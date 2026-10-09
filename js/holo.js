/* The sticker engine. Every input only writes CSS variables; the stickers on screen are the only ones that move.
   Mouse, pen and touch drive the foil directly. A phone with no tilt permission follows the scroll, so the foil
   sweeps as you scroll. iOS tilt is one tap ("Tilt to shimmer"). A desktop left alone sways after 3 s.
   Reduced motion: no sway and no 3D tilt; the foil still follows your own pointer and scroll, one to one. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchy = () => matchMedia('(hover: none)').matches;

let glitterURL = '';
function glitter() {
  if (glitterURL) return glitterURL;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let dots = '';
  for (let i = 0; i < 64; i++) {
    const r = (0.5 + rnd() * 1.1).toFixed(2), a = (0.55 + rnd() * 0.45).toFixed(2);
    dots += `<circle cx='${(rnd() * 128).toFixed(1)}' cy='${(rnd() * 128).toFixed(1)}' r='${r}' fill='white' fill-opacity='${a}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>${dots}</svg>`;
  glitterURL = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return glitterURL;
}

export function mountStickers(root, opts = {}) {
  const els = [...root.querySelectorAll('.sticker')];
  if (!els.length) return () => { };
  root.style.setProperty('--glitter', glitter());
  const chip = opts.chip || null;
  const st = els.map((el, i) => ({
    el, i, vis: false, cx: 0, cy: 0, ptr: null, lx: 9, ly: 9,
    phase: (i * 2.399) % (Math.PI * 2), per: 7 + ((i * 37) % 5), r: (i * 7) % 5,
  }));
  let lastInput = performance.now(), ori = null, raf = 0, dead = false, lastDraw = 0, anyVis = false;
  const touch = () => { lastInput = performance.now(); if (!raf && !dead && anyVis) { prev = lastInput; raf = requestAnimationFrame(frame); } };

  // ---- flip, pointer
  st.forEach(s => {
    const el = s.el;
    const flip = () => { el.classList.remove('turning'); void el.offsetWidth; el.classList.add('turning'); el.classList.toggle('flip'); s.ptr = null; };
    el.addEventListener('click', flip);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    el.addEventListener('pointermove', e => {
      if (el.classList.contains('flip')) return;
      const r = el.getBoundingClientRect();
      s.ptr = { x: clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1), y: clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1) };
      touch();
    });
    const off = () => { s.ptr = null; };
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') off(); });
  });

  // ---- only what is on screen moves
  const io = new IntersectionObserver(es => {
    es.forEach(e => { const s = st.find(x => x.el === e.target); if (s) s.vis = e.isIntersecting; });
    anyVis = st.some(s => s.vis);
    if (anyVis) kick();
  }, { rootMargin: '80px 0px' });
  els.forEach(e => io.observe(e));

  // ---- tilt (iOS asks once; Android just works)
  const onOri = e => { if (e.gamma == null || e.beta == null) return; ori = { x: clamp(e.gamma / 24, -1, 1), y: clamp((e.beta - 40) / 24, -1, 1) }; touch(); if (chip) chip.classList.remove('on'); };
  const startTilt = () => addEventListener('deviceorientation', onOri);
  const needsAsk = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
  if (touchy() && typeof DeviceOrientationEvent !== 'undefined') {
    if (needsAsk) {
      if (chip) {
        chip.classList.add('on');
        chip.addEventListener('click', async () => {
          try { const r = await DeviceOrientationEvent.requestPermission(); if (r === 'granted') startTilt(); } catch (e) { /* declined: scroll keeps it moving */ }
          chip.classList.remove('on');
        });
      }
    } else startTilt();
  }
  addEventListener('scroll', touch, { passive: true });
  addEventListener('pointermove', touch, { passive: true });
  addEventListener('keydown', touch);

  function apply(s, cx, cy, amp, quiet) {
    if (Math.abs(cx - s.lx) < 0.0015 && Math.abs(cy - s.ly) < 0.0015) return;
    s.lx = cx; s.ly = cy;
    const st_ = s.el.style, px = (cx + 1) * 50, py = (cy + 1) * 50;
    st_.setProperty('--mx', px.toFixed(1) + '%'); st_.setProperty('--my', py.toFixed(1) + '%');
    st_.setProperty('--px', px.toFixed(1) + '%'); st_.setProperty('--py', py.toFixed(1) + '%');
    st_.setProperty('--rx', (quiet ? 0 : -cy * amp).toFixed(2) + 'deg'); st_.setProperty('--ry', (quiet ? 0 : cx * amp).toFixed(2) + 'deg');
    st_.setProperty('--sx', (-cx * 7).toFixed(1) + 'px'); st_.setProperty('--sy', (-cy * 5).toFixed(1) + 'px');
    st_.setProperty('--hx', (50 - cx * 26).toFixed(1) + '%'); st_.setProperty('--hy', (24 - cy * 14).toFixed(1) + '%');
    st_.setProperty('--gx', (-cx * 26).toFixed(1) + 'px'); st_.setProperty('--gy', (-cy * 20).toFixed(1) + 'px');
  }

  let prev = performance.now();
  function frame(now) {
    raf = 0;
    if (dead || document.hidden || !anyVis) return;
    const dt = Math.min(0.1, (now - prev) / 1000); prev = now;
    const quiet = calm(), idle = now - lastInput > 3000;
    // left alone, the foil comes to rest: nothing keeps drawing until the next move, scroll or tilt
    if (now - lastInput > (touchy() || quiet ? 2500 : 15000) && !st.some(s => s.ptr)) return;
    const sway = !quiet && !ori && !touchy() && idle && !st.some(s => s.ptr);
    // idle sway is slow, so thirty frames a second is plenty and keeps the foil cheap
    if (sway && now - lastDraw < 33) { raf = requestAnimationFrame(frame); return; }
    lastDraw = now;
    const t = now / 1000;
    for (const s of st) {
      if (!s.vis) continue;
      let tg;
      if (s.ptr) tg = s.ptr;
      else if (ori) tg = ori;
      else if (touchy() || quiet) {
        const top = s.el.getBoundingClientRect().top;
        tg = { x: Math.sin(top * 0.011 + s.phase), y: Math.cos(top * 0.008 + s.phase * 0.7) };
      } else if (idle) tg = { x: Math.sin(t * 6.283 / s.per + s.phase) * 0.7, y: Math.cos(t * 6.283 / (s.per * 1.3) + s.phase) * 0.5 };
      else tg = { x: 0, y: 0 };
      const k = quiet ? 1 : 1 - Math.exp(-dt / (s.ptr ? 0.07 : 0.22));
      s.cx += (tg.x - s.cx) * k; s.cy += (tg.y - s.cy) * k;
      apply(s, s.cx, s.cy, ori ? 8 : 14, quiet);
    }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !dead) { prev = performance.now(); raf = requestAnimationFrame(frame); } }
  const vis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', vis);
  // the first paint is already shimmering, before anything moves
  st.forEach(s => apply(s, ((s.i % 5) - 2) * 0.28, ((s.r % 3) - 1) * 0.3, 14, true));
  kick();

  return () => {
    dead = true; cancelAnimationFrame(raf); io.disconnect();
    removeEventListener('scroll', touch); removeEventListener('pointermove', touch); removeEventListener('keydown', touch);
    removeEventListener('deviceorientation', onOri); document.removeEventListener('visibilitychange', vis);
  };
}

export function stickerHTML(s, o) {
  // s: {name, quote, cls, cat, no, back, art}   o: {rot, emblem}. The card as designed in 2023: see css/trophy.css.
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const art = s.art ? `<img class="tro" src="${esc(s.art)}" alt="" loading="lazy" decoding="async" draggable="false">` : `<span class="emb">${o.emblem}</span>`;
  const scene = `<i class="tun"></i><i class="stars"></i><span class="frame"></span>`;
  return `<div class="sticker ${s.cls || ''}" tabindex="0" role="button" style="--rot:${o.rot}deg" aria-label="${esc(s.name)}. Tap to turn over.">
    <div class="sheet">
      <div class="face front"><div class="ink">${scene}<i class="holo"></i><i class="laser a"></i><i class="laser b"></i>
        <span class="pill">${esc(s.cat)}</span>
        <div class="art">${art}</div>
        <span class="nm">${esc(s.name)}</span><span class="no">${esc(s.no)}</span>
        <span class="vee" aria-hidden="true"></span>
        <i class="glare"></i></div></div>
      <div class="face back"><div class="ink">${scene}
        <span class="pill">${esc(s.cat)}</span>
        <div class="in"><span class="bn">${esc(s.name)}</span><q>${esc(s.quote)}</q><span class="earn">${s.back}</span></div>
        <span class="vee" aria-hidden="true"></span></div></div>
    </div></div>`;
}
