/* IN PIECES: a planet's video cut into pieces, every piece playing its own part of the picture. Put it back together.
   The thirteen planets, hosted by their beings, in the same frame as OVER THE BOARD and DEAD ENDS.
   The engine is the Winthrop video puzzle (one canvas, the video drawn tile by tile), reworked for this site:
   no full-screen takeover, nothing starts before you press Play, and the win plays the whole video in the stage. */
import { BEINGS, BY_ID } from '../chess/beings.js';
import { PUZZLE_LINES } from './voices.js';

export const HOME = '#/games/in-pieces';
const FV = window.FV || { planets: [] };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const slow = () => { const c = navigator.connection; return !!(c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))); };

const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.puzzle.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.puzzle.' + k, JSON.stringify(v)); } catch (e) { } },
};
const PROG = {
  done() { return new Set(store.get('done', [])); },
  add(id) { const s = this.done(); s.add(id); store.set('done', [...s]); },
  best(id) { return (store.get('best', {}) || {})[id] || null; },
  setBest(id, rec) { const b = store.get('best', {}) || {}; if (!b[id] || rec.ms < b[id].ms) { b[id] = rec; store.set('best', b); return true; } return false; },
  preview() { return !!store.get('preview', false); },
  unlocked(b) { return this.preview() || b.n === 1 || this.done().has(BEINGS[b.n - 2].id); },
  next() { const s = this.done(); return BEINGS.find(b => !s.has(b.id) && this.unlocked(b)) || null; },
};
const planetOf = b => FV.planets.find(p => p.slug === b.id) || {};
const fmt = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const small = () => innerWidth < 600;
const vsrc = (url, q) => (url || '').replace(/\/(480|720|1080)p\//, `/${q}p/`);

/* ------------------------------------------------------------------ the picker */
const meter = n => `<span class="lv" role="img" aria-label="Planet ${n} of 13">${BEINGS.map((_, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('')}</span>`;
function pickerHTML() {
  const done = PROG.done(), nxt = PROG.next();
  const count = BEINGS.filter(b => done.has(b.id)).length;
  const prog = count === 13 ? 'All thirteen planets, back in one piece.' : count === 0 ? `Nothing solved yet. ${BEINGS[0].planet} goes first.` : `${count} of 13 solved.${nxt ? ` Next: ${nxt.planet}.` : ''}`;
  const card = b => {
    const did = done.has(b.id), open = PROG.unlocked(b), isNext = nxt && nxt.id === b.id, best = PROG.best(b.id), p = planetOf(b);
    const cls = did ? 'is-beaten' : isNext ? 'is-next' : open ? 'is-open' : 'is-locked';
    const status = did && best ? `Solved in ${fmt(best.ms)} · ${best.moves} moves` : isNext ? 'Your turn' : open ? 'Open' : `Solve ${BEINGS[b.n - 2].planet} first`;
    const inner = `<span class="face"><img src="${b.face}" alt="" width="360" height="351" loading="lazy" decoding="async" draggable="false"></span>
      <span class="no">${b.n}</span>
      <b class="nm">${esc(b.planet)}</b>
      <span class="sp">${esc(b.name)} · ${esc(b.species)}</span>
      <span class="tg">${esc(p.galaxy || '')}. ${small() ? 'Nine pieces on a phone.' : 'Twenty-five pieces.'}</span>
      ${meter(b.n)}
      <span class="st">${did ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : ''}${esc(status)}</span>`;
    return open
      ? `<a class="otb-card ${cls}" href="${HOME}/${b.id}" data-being="${b.id}" style="--bc:${b.color}">${inner}</a>`
      : `<div class="otb-card ${cls}" aria-disabled="true" data-being="${b.id}" style="--bc:${b.color}">${inner}</div>`;
  };
  return `<div class="page otb-page ip-page">
    <p class="crumbs"><a href="#/games">Games</a><span aria-hidden="true">/</span>IN PIECES</p>
    <div class="page-head"><span class="kicker">Game</span><h1>IN PIECES</h1>
      <p>A planet's video, cut into pieces. Every piece keeps playing its own part of the picture. Tap two to swap them, or drag one onto another. Right pieces lock. Solve one planet and the next opens.</p>
      <p class="otb-prog" id="ipProg">${esc(prog)}</p></div>
    <div class="otb-ladder">${BEINGS.map(card).join('')}</div>
    <div class="otb-foot">
      <button class="otb-preview" type="button" role="switch" aria-checked="${PROG.preview()}" id="ipPreview"><span class="knob" aria-hidden="true"></span><span>Preview mode: open all thirteen</span></button>
      <details class="otb-credits"><summary>Credits</summary><div class="cr-in"><p>Made for FictionVision. The planet videos are Pierce's, streamed from Wix like everywhere on the site. The faces are the Winthrop Review Crew. The engine is the Winthrop by the Sea video puzzle, moved here. No library does any of this.</p></div></details>
    </div></div>`;
}
function mountPicker(root) {
  const paint = () => { root.innerHTML = pickerHTML(); $('#ipPreview', root).addEventListener('click', () => { store.set('preview', !PROG.preview()); paint(); }); };
  paint();
  return () => { };
}

/* ------------------------------------------------------------------ the table */
function tableHTML(b) {
  const p = planetOf(b);
  return `<div class="page otb-page otb-table ip-table" style="--bc:${b.color}" data-being="${b.id}">
    <div class="otb-head">
      <a class="back" href="${HOME}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>All thirteen</span></a>
      <span class="lvl">${b.n} of 13 · ${esc(b.species)}</span>
    </div>
    <div class="otb-grid">
      <section class="otb-talk" aria-label="${esc(b.name)}">
        <div class="face"><img src="${b.face}" alt="${esc(b.name)}" width="360" height="351" decoding="async"></div>
        <div class="bubble" id="bubble"><span class="who">${esc(b.name)}</span><p id="say" aria-live="polite"></p><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
      </section>
      <section class="otb-boardcol">
        <div class="otb-strip opp"><span class="who">${esc(b.short || b.name)}</span><span class="tray de-planet"><img src="${p.mark || b.mark}" alt="">${esc(b.planet)}</span></div>
        <div class="otb-boardwrap ip-stage" id="stage">
          <canvas id="board" class="ip-board"></canvas>
          <div class="ip-gate" id="gate"><img src="${p.still || ''}" alt="" class="poster"><div class="in"><span class="kicker">${esc(b.planet)}</span><b id="gateMeta">${small() ? 'Nine' : 'Twenty-five'} pieces</b><button class="cta" type="button" id="btnPlay">Play</button></div></div>
          <div class="ip-loading" id="loading" hidden><span class="spin"></span><span id="loadPct">Loading the video</span></div>
          <div class="ip-msg" id="msg" hidden></div>
          <div class="ip-won" id="won" hidden><video id="winVid" muted playsinline disablepictureinpicture></video><div class="in"><b>Back in one piece.</b></div></div>
        </div>
        <div class="otb-strip me"><span class="who">You</span><span class="de-clock" id="clock" role="timer">0:00</span><span class="ip-moves" id="moves">0 moves</span><span class="status" id="status" role="status"></span></div>
      </section>
      <aside class="otb-side">
        <div class="meta"><b>${esc(b.name)}</b><span>${esc(b.species)} · ${esc(b.planet)}</span><span class="tg">${esc(p.galaxy || '')}</span></div>
        <div class="ip-ref" id="ref"><video id="refVid" muted playsinline loop disablepictureinpicture poster="${p.still || ''}"></video><span>What you are building</span></div>
        <dl class="de-times" id="times"></dl>
        <div class="actions">
          <button class="ghost" type="button" id="btnHint" disabled>Hint</button>
          <button class="ghost" type="button" id="btnSolve" disabled>Solve</button>
          <button class="ghost" type="button" id="btnShuffle" disabled>Shuffle</button>
        </div>
      </aside>
      <div class="otb-over" id="over" hidden role="region" aria-labelledby="overTitle"></div>
    </div>
  </div>`;
}

class Table {
  constructor(root, b) {
    this.root = root; this.b = b; this.p = planetOf(b); this.dead = false; this.timers = new Set(); this.bag = {}; this.heard = new Set(); this.said = [];
    root.innerHTML = tableHTML(b);
    const q = id => $('#' + id, root);
    this.el = { stage: q('stage'), board: q('board'), gate: q('gate'), play: q('btnPlay'), loading: q('loading'), pct: q('loadPct'), msg: q('msg'), won: q('won'), winVid: q('winVid'), clock: q('clock'), moves: q('moves'), status: q('status'), say: q('say'), bubble: q('bubble'), over: q('over'), ref: q('refVid'), times: q('times'), hint: q('btnHint'), solve: q('btnSolve'), shuffle: q('btnShuffle') };
    this.ctx = this.el.board.getContext('2d');
    this.vid = document.createElement('video'); this.vid.muted = true; this.vid.playsInline = true; this.vid.loop = true; this.vid.preload = 'auto'; this.vid.crossOrigin = 'anonymous'; this.vid.setAttribute('disablepictureinpicture', '');
    this.cols = this.rows = small() ? 3 : 5;
    this.order = []; this.revealed = []; this.selected = null; this.solved = false; this.started = false; this.t0 = 0; this.elapsed = 0; this.moveCount = 0; this.flash = {}; this.hintsOn = false; this.hover = -1; this.tainted = false; this.locksSaid = 0; this.slowSaid = false; this.usedSolve = false;
    this.ac = null;
    this.bind(); this.paintTimes(); this.resize();
    document.title = `IN PIECES · ${b.planet} · FictionVision`;
    this.say('greet');
    window.__ip = this.handle();
  }
  later(fn, ms) { const t = setTimeout(() => { this.timers.delete(t); if (!this.dead) fn(); }, ms); this.timers.add(t); return t; }

  /* ---- talk */
  pick(kind) {
    const lines = (PUZZLE_LINES[this.b.id] || {})[kind]; if (!lines || !lines.length) return '';
    const key = kind; let bag = this.bag[key];
    if (!bag || !bag.length) { const all = lines.map((_, i) => i), fresh = all.filter(i => !this.heard.has(key + ':' + i)); bag = (fresh.length ? fresh : all).sort(() => Math.random() - 0.5); if (!fresh.length) all.forEach(i => this.heard.delete(key + ':' + i)); }
    const i = bag.shift(); this.bag[key] = bag; this.heard.add(key + ':' + i); return lines[i];
  }
  say(kind) {
    const t = this.pick(kind); if (!t) return;
    const e = this.el; e.say.textContent = t; e.bubble.dataset.kind = kind;
    e.bubble.classList.remove('pop'); void e.bubble.offsetWidth; e.bubble.classList.add('pop');
    const fc = $('.otb-talk .face', this.root); if (fc) { fc.classList.remove('bump'); void fc.offsetWidth; fc.classList.add('bump'); }
    this.said.push({ kind, text: t });
  }
  paintTimes() {
    const best = PROG.best(this.b.id);
    this.el.times.innerHTML = `<div><dt>Pieces</dt><dd>${this.cols * this.rows}</dd></div><div><dt>Your best</dt><dd>${best ? `${fmt(best.ms)} · ${best.moves}` : 'Not yet'}</dd></div>`;
  }

  /* ---- sizes */
  resize() {
    const st = this.el.stage, dpr = Math.min(2, devicePixelRatio || 1);
    this.el.board.width = Math.round(st.clientWidth * dpr); this.el.board.height = Math.round(st.clientHeight * dpr);
    this.dpr = dpr;
  }

  /* ---- sound: a chime when a piece locks, a small fanfare at the end (made here, no files) */
  getAC() { try { return this.ac || (this.ac = new (window.AudioContext || window.webkitAudioContext)()); } catch (e) { return null; } }
  chime() { const a = this.getAC(); if (!a) return; const now = a.currentTime; [523, 659, 784, 1047].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(a.destination); const t = now + i * 0.08; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.38); o.start(t); o.stop(t + 0.4); }); }
  fanfare() { const a = this.getAC(); if (!a) return; const now = a.currentTime; [[261.6, 0, .16, 4.5], [329.6, .18, .13, 4.2], [392, .32, .12, 4], [523.2, .44, .14, 3.8], [659.3, .55, .11, 3.5], [784, .62, .09, 3.2]].forEach(([f, d, v, dur]) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(a.destination); const t = now + d; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.55); g.gain.setValueAtTime(v, t + dur - 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.start(t); o.stop(t + dur + 0.05); }); }

  /* ---- the scramble: the same one for everyone on a given day, a fresh one on Shuffle */
  seeded(seed) { let s = seed | 0; return () => { s = Math.imul(s ^ s >>> 15, 1 | s); s ^= s + Math.imul(s ^ s >>> 7, 61 | s); return ((s ^ s >>> 14) >>> 0) / 2 ** 32; }; }
  dailySeed() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + this.b.n * 7919; }
  scramble(seed, revealAll) {
    this.stopDeal(); this.clearHint();
    this.solved = false; this.started = false; this.selected = null; this.flash = {}; this.locksSaid = 0; this.slowSaid = false; this.usedSolve = false;
    this.stopTimer(); this.el.clock.textContent = fmt(0); this.moveCount = 0; this.el.moves.textContent = '0 moves'; this.el.status.textContent = '';
    const n = this.cols * this.rows; this.order = [...Array(n).keys()];
    const rng = this.seeded(seed);
    do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [this.order[i], this.order[j]] = [this.order[j], this.order[i]]; } } while (this.order.every((v, i) => v === i));
    this.revealed = new Array(n).fill(!!revealAll);
    this.resize();
  }
  stopDeal() { clearInterval(this.dealT); this.dealT = null; this.revealed = new Array(this.cols * this.rows).fill(true); }
  dealIn() { let slot = 0; const delay = small() ? 28 : 20; this.dealT = setInterval(() => { if (this.dead) return clearInterval(this.dealT); if (slot >= this.cols * this.rows) { this.stopDeal(); return; } this.revealed[slot] = true; slot++; }, delay); }
  clearHint() { clearInterval(this.hintT); this.hintT = null; this.hintsOn = false; this.el.hint.textContent = 'Hint'; }
  startTimer() { this.started = true; this.t0 = Date.now(); clearInterval(this.timerT); this.timerT = setInterval(() => { if (this.dead) return clearInterval(this.timerT); if (!this.solved) { this.elapsed = Date.now() - this.t0; this.el.clock.textContent = fmt(this.elapsed); if (!this.slowSaid && this.elapsed > 90000) { this.slowSaid = true; this.say('slow'); } } }, 250); }
  stopTimer() { clearInterval(this.timerT); }

  /* ---- moves */
  slotAt(cx, cy) { const r = this.el.board.getBoundingClientRect(); const c = Math.floor((cx - r.left) / (r.width / this.cols)), rw = Math.floor((cy - r.top) / (r.height / this.rows)); if (c < 0 || c >= this.cols || rw < 0 || rw >= this.rows) return -1; return rw * this.cols + c; }
  swap(a, b, count) { [this.order[a], this.order[b]] = [this.order[b], this.order[a]]; if (count) { this.moveCount++; this.el.moves.textContent = this.moveCount + (this.moveCount === 1 ? ' move' : ' moves'); } }
  interact() { this.stopDeal(); if (!this.started && !this.solved) { this.startTimer(); this.say('start'); } }
  checkLocks(a, b) {
    let lock = false;
    [a, b].forEach(s => { if (this.order[s] === s) { this.flash[s] = performance.now(); lock = true; } });
    if (lock) { this.chime(); if (this.locksSaid < 2 && Math.random() < 0.6) { this.locksSaid++; this.say('lock'); } }
    if (this.order.every((v, i) => v === i) && this.started && !this.solved) { this.solved = true; this.later(() => this.finish(), 1200); }
  }

  bind() {
    const e = this.el, board = e.board;
    board.addEventListener('click', ev => {
      if (this.solved || !this.live) return; this.interact();
      const slot = this.slotAt(ev.clientX, ev.clientY); if (slot < 0 || this.order[slot] === slot) return;
      if (this.selected === null) this.selected = slot; else if (this.selected === slot) this.selected = null; else { const a = this.selected; this.swap(a, slot, true); this.checkLocks(a, slot); this.selected = null; }
    });
    let from = -1, moved = false;
    board.addEventListener('pointerdown', ev => { if (this.solved || !this.live) return; from = this.slotAt(ev.clientX, ev.clientY); moved = false; });
    board.addEventListener('pointermove', ev => { if (from < 0) { const s = this.slotAt(ev.clientX, ev.clientY); this.hover = (s >= 0 && this.order[s] === s) ? s : -1; } else if (Math.abs(ev.movementX) + Math.abs(ev.movementY) > 2) moved = true; });
    board.addEventListener('pointerleave', () => { this.hover = -1; });
    board.addEventListener('pointerup', ev => { if (!moved || from < 0) { from = -1; return; } const to = this.slotAt(ev.clientX, ev.clientY); if (to >= 0 && to !== from && this.order[to] !== to && this.order[from] !== from) { this.interact(); const f = from; this.swap(f, to, true); this.checkLocks(f, to); this.selected = null; } from = -1; moved = false; });
    e.hint.addEventListener('click', () => { if (this.solved) return; this.clearHint(); this.hintsOn = true; this.say('hint'); let n = 5; e.hint.textContent = String(n); this.hintT = setInterval(() => { n--; if (n <= 0 || this.dead) this.clearHint(); else e.hint.textContent = String(n); }, 1000); });
    e.solve.addEventListener('click', () => {
      if (this.solved) return; this.stopDeal(); this.clearHint(); if (!this.started) this.startTimer(); this.usedSolve = true; this.say('solve');
      let i = 0; const step = () => { if (this.dead) return; const n = this.cols * this.rows; while (i < n && this.order[i] === i) i++; if (i >= n) { if (!this.solved) { this.solved = true; this.later(() => this.finish(), 1200); } return; } const slot = i, f = this.order.indexOf(slot); this.swap(f, slot, false); this.flash[slot] = performance.now(); if (this.order[f] === f) this.flash[f] = performance.now(); this.chime(); i++; this.later(step, 55); };
      step();
    });
    e.shuffle.addEventListener('click', () => { if (!this.live) return; e.won.hidden = true; e.over.hidden = true; try { e.winVid.pause(); } catch (err) { } this.vid.play().catch(() => { }); this.scramble((Math.random() * 2 ** 31) | 0, false); this.dealIn(); this.say('greet'); });
    e.play.addEventListener('click', () => this.begin());
    this.onResize = () => { clearTimeout(this.rsT); this.rsT = setTimeout(() => { if (!this.dead) this.resize(); }, 80); };
    addEventListener('resize', this.onResize);
    this.onVis = () => { if (document.hidden) { try { this.vid.pause(); this.el.ref.pause(); } catch (err) { } } else if (this.live && !this.el.over.hidden === false) { this.vid.play().catch(() => { }); this.el.ref.play().catch(() => { }); } };
    document.addEventListener('visibilitychange', this.onVis);
  }

  /* ---- start: press Play, the video loads, the pieces deal in */
  begin() {
    const e = this.el, q = small() || slow() ? 480 : innerWidth >= 1900 ? 1080 : 720;
    const src = vsrc(this.p.planet_video || this.p.nebula, q);
    if (!src) { e.msg.hidden = false; e.msg.textContent = 'This planet has no video yet.'; return; }
    e.gate.hidden = true; e.loading.hidden = false; e.msg.hidden = true;
    this.vid.src = src; this.vid.load();
    e.ref.src = vsrc(src, 480); e.ref.load(); e.ref.play().catch(() => { });
    this.vid.addEventListener('progress', () => { try { if (this.vid.buffered.length && this.vid.duration) e.pct.textContent = 'Loading the video · ' + Math.round(this.vid.buffered.end(this.vid.buffered.length - 1) / this.vid.duration * 100) + '%'; } catch (err) { } });
    this.vid.addEventListener('canplay', () => {
      if (this.dead) return;
      e.loading.hidden = true; this.live = true; e.hint.disabled = e.solve.disabled = e.shuffle.disabled = false;
      this.vid.play().catch(() => { });
      this.scramble(this.dailySeed(), true);
      if (!this.raf) this.raf = requestAnimationFrame(t => this.draw(t));
      // the whole picture for a second, then the pieces leave one by one and come back scrambled
      this.later(() => { let slot = this.cols * this.rows - 1; const vd = small() ? 22 : 16; const vt = setInterval(() => { if (this.dead) return clearInterval(vt); if (slot < 0) { clearInterval(vt); this.later(() => this.dealIn(), 200); return; } this.revealed[slot] = false; slot--; }, vd); }, 1000);
    }, { once: true });
    this.vid.addEventListener('error', () => { if (this.dead) return; e.loading.hidden = true; e.msg.hidden = false; e.msg.textContent = 'The video did not arrive. Check your connection and press Play again.'; e.gate.hidden = false; }, { once: true });
  }

  /* ---- the picture, tile by tile */
  draw(ts) {
    this.raf = requestAnimationFrame(t => this.draw(t));
    if (this.dead) return;
    if (ts - (this.lastDraw || 0) < 1000 / 30) return; this.lastDraw = ts;
    const v = this.vid; if (v.readyState < 2) return;
    const vw = v.videoWidth, vh = v.videoHeight; if (!vw) return;
    const ctx = this.ctx, dpr = this.dpr, W = this.el.board.width / dpr, H = this.el.board.height / dpr, cols = this.cols, rows = this.rows;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pw = W / cols, ph = H / rows, sw = vw / cols, sh = vh / rows;
    try {
      for (let slot = 0; slot < this.order.length; slot++) {
        const dc = slot % cols, dr = Math.floor(slot / cols);
        if (!this.revealed[slot]) { ctx.fillStyle = '#0b0b10'; ctx.fillRect(dc * pw, dr * ph, pw, ph); continue; }
        const pid = this.order[slot], pc = pid % cols, pr = Math.floor(pid / cols);
        ctx.drawImage(v, pc * sw, pr * sh, sw, sh, dc * pw, dr * ph, pw + 0.5, ph + 0.5);
      }
    } catch (err) { if (!this.tainted) { this.tainted = true; this.el.msg.hidden = false; this.el.msg.textContent = 'The video host would not let the pieces be drawn. Try again in a moment.'; } return; }
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1;
    for (let c = 1; c < cols; c++) { ctx.beginPath(); ctx.moveTo(c * pw, 0); ctx.lineTo(c * pw, H); ctx.stroke(); }
    for (let r = 1; r < rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * ph); ctx.lineTo(W, r * ph); ctx.stroke(); }
    const bc = this.b.color;
    for (const [k, t] of Object.entries(this.flash)) { const slot = +k, age = (ts - t) / 700; if (age >= 1) { delete this.flash[slot]; continue; } const dc = slot % cols, dr = Math.floor(slot / cols); ctx.strokeStyle = bc; ctx.globalAlpha = 1 - age; ctx.lineWidth = 5; ctx.strokeRect(dc * pw + 2, dr * ph + 2, pw - 4, ph - 4); ctx.globalAlpha = 1; }
    if (this.selected !== null && this.order[this.selected] !== this.selected) { const dc = this.selected % cols, dr = Math.floor(this.selected / cols); ctx.fillStyle = 'rgba(250,96,16,.25)'; ctx.fillRect(dc * pw, dr * ph, pw, ph); ctx.strokeStyle = '#fa6010'; ctx.lineWidth = 3; ctx.strokeRect(dc * pw + 1.5, dr * ph + 1.5, pw - 3, ph - 3); }
    for (let slot = 0; slot < this.order.length; slot++) if (this.order[slot] === slot && !this.solved) { const dc = slot % cols, dr = Math.floor(slot / cols); ctx.strokeStyle = bc; ctx.globalAlpha = .7; ctx.lineWidth = 2.5; ctx.strokeRect(dc * pw + 1, dr * ph + 1, pw - 2, ph - 2); ctx.globalAlpha = 1; }
    if (this.hover >= 0 && this.order[this.hover] === this.hover) { const dc = this.hover % cols, dr = Math.floor(this.hover / cols); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(dc * pw, dr * ph, pw, ph); }
    if (this.hintsOn) { const fs = Math.max(11, Math.round(pw * 0.2)); ctx.font = `700 ${fs}px Outfit, system-ui, sans-serif`; ctx.shadowColor = '#000'; ctx.shadowBlur = 4; for (let slot = 0; slot < this.order.length; slot++) { if (this.order[slot] === slot) continue; const dc = slot % cols, dr = Math.floor(slot / cols); ctx.fillStyle = '#fff'; ctx.fillText(this.order[slot] + 1, dc * pw + 6, dr * ph + fs + 4); } ctx.shadowBlur = 0; }
  }

  /* ---- the end: the whole video plays in the stage, then the card */
  finish() {
    this.stopTimer(); this.clearHint(); this.fanfare();
    document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { planet: this.b.id, volume: 0.7 } }));
    const ms = Date.now() - this.t0, moves = this.moveCount, counts = !this.usedSolve, b = this.b;
    let improved = false; if (counts) { improved = PROG.setBest(b.id, { ms, moves }); PROG.add(b.id); }
    this.paintTimes();
    const e = this.el; e.won.hidden = false; e.winVid.src = this.vid.currentSrc || this.vid.src; e.winVid.currentTime = 0; e.winVid.play().catch(() => { });
    this.say('win');
    const next = BEINGS[b.n] || null;
    const why = counts ? `${fmt(ms)} and ${moves} move${moves === 1 ? '' : 's'}.${improved ? ' Your best on this planet.' : ''}` : `${fmt(ms)}, with the Solve button. That one does not count. Solve it yourself and the next planet opens.`;
    let nextHTML = '';
    if (counts && next) nextHTML = `<div class="nx"><img src="${next.face}" alt="" width="360" height="351"><p><span>Next planet</span><b>${esc(next.planet)}</b><small>${esc(next.name)} · ${esc(next.species)}</small></p></div>`;
    else if (counts) nextHTML = '<p class="all">That is all thirteen, back in one piece. The beings would like a word over the board.</p>';
    e.over.innerHTML = `<div class="ov-card" data-kind="${counts ? 'win' : 'draw'}"><span class="kicker">${counts ? 'Solved' : 'Finished for you'}</span><h2 id="overTitle">${counts ? `${esc(b.planet)}, back in one piece.` : `${esc(b.short || b.name)} finished it.`}</h2><p>${esc(why)}</p>${nextHTML}
      <div class="btns">${counts && next ? `<a class="cta" href="${HOME}/${next.id}" id="ovNext">Solve ${esc(next.planet)}</a>` : ''}${counts && !next ? `<a class="cta" href="#/games/over-the-board">Over the board</a>` : ''}
      <button class="ghost" id="ovAgain" type="button">Shuffle and go again</button><a class="ghost" href="${HOME}">All thirteen</a></div></div>`;
    e.over.hidden = false;
    $('#ovAgain', e.over).addEventListener('click', () => e.shuffle.click());
    const nb = $('#ovNext', e.over); if (nb) nb.addEventListener('click', () => this.say('next'));
    const f = nb || $('#ovAgain', e.over); if (f) f.focus({ preventScroll: true });
    const r = e.over.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) e.over.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }

  handle() {
    const t = this;
    return { get being() { return t.b.id; }, get live() { return !!t.live; }, get order() { return [...t.order]; }, get solved() { return t.solved; }, get moves() { return t.moveCount; }, get bubble() { return t.el.say.textContent; }, get said() { return [...t.said]; }, get cols() { return t.cols; },
      play() { t.begin(); }, swap(a, b) { t.interact(); t.swap(a, b, true); t.checkLocks(a, b); }, solve() { t.el.solve.click(); } };
  }
  destroy() {
    this.dead = true; cancelAnimationFrame(this.raf); this.raf = 0;
    this.timers.forEach(t => clearTimeout(t)); this.timers.clear(); clearInterval(this.timerT); clearInterval(this.hintT); clearInterval(this.dealT);
    removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVis);
    try { this.vid.pause(); this.vid.removeAttribute('src'); this.vid.load(); } catch (e) { }
    try { this.el.ref.pause(); this.el.winVid.pause(); } catch (e) { }
    try { if (this.ac) this.ac.close(); } catch (e) { }
    if (window.__ip) delete window.__ip;
  }
}

/* ------------------------------------------------------------------ the route: #/games/in-pieces[/planet] */
export function mount(root, slug) {
  const b = slug ? BY_ID[slug] : null;
  if (slug && !b) { location.replace(HOME); return () => { }; }
  if (!b) return mountPicker(root);
  if (!PROG.unlocked(b)) { location.replace(HOME); return () => { }; }
  const t = new Table(root, b);
  return () => t.destroy();
}
