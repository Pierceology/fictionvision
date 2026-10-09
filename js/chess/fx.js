/* Captures on the board: the attacker strikes, the victim falls.
   Six attacks (one for each kind of attacker) and five falls (one for each kind of victim) cover all thirty pairings.
   Everything is drawn in code on a layer laid over the board: ghost copies of the two pieces, moved with the Web Animations API,
   so there are no clips to load and nothing to hold up the game. Squares are the unit: 1 = the width of one square. */

const E = { out: 'cubic-bezier(.2,.8,.2,1)', in: 'cubic-bezier(.55,0,.9,.4)', io: 'cubic-bezier(.45,0,.2,1)', snap: 'cubic-bezier(.1,.9,.25,1)' };
// every keyframe uses the same list of transform functions, so they interpolate cleanly
const T = (x = 0, y = 0, o = {}) => `translate(${x * 100}%, ${y * 100}%) rotate(${o.r || 0}deg) skewX(${o.k || 0}deg) scale(${o.sx == null ? 1 : o.sx}, ${o.sy == null ? (o.sx == null ? 1 : o.sx) : o.sy})`;
const SQ = 12.5;
const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* where a square sits on screen, in squares from the top left, for the board's orientation */
export function squareXY(sq, orient) {
  const f = sq.charCodeAt(0) - 97, r = +sq[1] - 1;
  return orient === 'w' ? { x: f, y: 7 - r } : { x: 7 - f, y: r };
}

function ghost(layer, color, type, p, cls = '') {
  const d = document.createElement('div');
  d.className = 'fx-piece ' + cls;
  d.style.left = p.x * SQ + '%'; d.style.top = p.y * SQ + '%';
  d.innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><use href="#${color}${type}"/></svg>`;
  layer.appendChild(d);
  return d;
}
function bit(layer, cls, p, style = '') {
  const d = document.createElement('i');
  d.className = cls;
  d.style.cssText = `left:${p.x * SQ}%;top:${p.y * SQ}%;${style}`;
  layer.appendChild(d);
  return d;
}
const anim = (el, frames, opt) => el.animate(frames, { fill: 'both', ...opt });

/* ---------------------------------------------------------------- the six attacks */
/* d = { vx, vy: the way to the victim in squares, ux, uy: that as a unit step }. hit = when it lands, as a share of dur. */
const ATTACKS = {
  // pawn: pulls back and jabs
  p: d => ({ dur: 440, hit: 0.6, frames: [
    { transform: T(), offset: 0 },
    { transform: T(-d.ux * 0.16, -d.uy * 0.16, { sx: 0.94, sy: 1.07 }), offset: 0.28, easing: E.out },
    { transform: T(d.vx + d.ux * 0.14, d.vy + d.uy * 0.14, { sx: 1.07, sy: 0.93 }), offset: 0.6, easing: E.snap },
    { transform: T(d.vx, d.vy), offset: 1 },
  ] }),
  // knight: crouches, leaps over, lands on top of it
  n: d => ({ dur: 560, hit: 0.64, frames: [
    { transform: T(), offset: 0 },
    { transform: T(0, 0, { sx: 1.1, sy: 0.86 }), offset: 0.15, easing: E.out },
    { transform: T(d.vx * 0.5, d.vy * 0.5 - 0.95, { r: d.ux >= 0 ? 14 : -14 }), offset: 0.4, easing: E.in },
    { transform: T(d.vx, d.vy, { sx: 1.14, sy: 0.84 }), offset: 0.64, easing: E.out },
    { transform: T(d.vx, d.vy - 0.12), offset: 0.8, easing: E.in },
    { transform: T(d.vx, d.vy), offset: 1 },
  ] }),
  // bishop: winds up and cuts straight through
  b: d => ({ dur: 400, hit: 0.5, frames: [
    { transform: T(), offset: 0 },
    { transform: T(-d.ux * 0.14, -d.uy * 0.14, { r: d.ux >= 0 ? -9 : 9 }), offset: 0.24, easing: E.out },
    { transform: T(d.vx + d.ux * 0.22, d.vy + d.uy * 0.22, { k: d.ux >= 0 ? -14 : 14, sx: 1.05 }), offset: 0.5, easing: E.snap },
    { transform: T(d.vx, d.vy), offset: 1 },
  ] }),
  // rook: draws back and rams
  r: d => ({ dur: 480, hit: 0.6, frames: [
    { transform: T(), offset: 0 },
    { transform: T(-d.ux * 0.3, -d.uy * 0.3, { sx: 1.04, sy: 0.97 }), offset: 0.36, easing: E.in },
    { transform: T(d.vx + d.ux * 0.1, d.vy + d.uy * 0.1, { sx: 0.96, sy: 1.05 }), offset: 0.6, easing: E.snap },
    { transform: T(d.vx, d.vy), offset: 1 },
  ] }),
  // queen: spins through it
  q: d => ({ dur: 580, hit: 0.6, frames: [
    { transform: T(), offset: 0 },
    { transform: T(d.vx * 0.5, d.vy * 0.5, { r: 200, sx: 1.2 }), offset: 0.34, easing: E.io },
    { transform: T(d.vx, d.vy, { r: 330, sx: 1.14 }), offset: 0.6, easing: E.out },
    { transform: T(d.vx, d.vy, { r: 360 }), offset: 1 },
  ] }),
  // king: lifts a heavy foot and stamps
  k: d => ({ dur: 660, hit: 0.64, frames: [
    { transform: T(), offset: 0 },
    { transform: T(0, -0.2, { sx: 1.14 }), offset: 0.28, easing: E.out },
    { transform: T(d.vx * 0.7, d.vy * 0.7 - 0.5, { sx: 1.24 }), offset: 0.5, easing: E.in },
    { transform: T(d.vx, d.vy, { sx: 1.22, sy: 0.8 }), offset: 0.64, easing: E.out },
    { transform: T(d.vx, d.vy), offset: 1 },
  ] }),
};

/* ---------------------------------------------------------------- the five falls (they start at the hit) */
const hideAt = (el, at) => anim(el, [{ visibility: 'visible' }, { visibility: 'hidden' }], { delay: at, duration: 1 });
const FALLS = {
  // pawn: tips over like a bowling pin
  p: (el, at, q, d) => [anim(el, [
    { transform: T(), opacity: 1, offset: 0 },
    { transform: T(d.sign * 0.06, 0.04, { r: d.sign * 68 }), opacity: 1, offset: 0.55, easing: E.in },
    { transform: T(d.sign * 0.16, 0.14, { r: d.sign * 92 }), opacity: 0, offset: 1 },
  ], { delay: at, duration: 460 * q })],
  // knight: rears up, then flips off backwards
  n: (el, at, q, d) => [anim(el, [
    { transform: T(), opacity: 1, offset: 0 },
    { transform: T(0, -0.12, { r: -16, sx: 1.08 }), opacity: 1, offset: 0.28, easing: E.out },
    { transform: T(d.sign * 0.18, -0.06, { r: d.sign * 150, sx: 0.95 }), opacity: 0.9, offset: 0.7, easing: E.in },
    { transform: T(d.sign * 0.36, 0.2, { r: d.sign * 230, sx: 0.78 }), opacity: 0, offset: 1 },
  ], { delay: at, duration: 520 * q })],
  // bishop: cut in two
  b: (el, at, q, d, layer) => {
    const out = [hideAt(el, at)];
    [['inset(0 50% 0 0)', -1], ['inset(0 0 0 50%)', 1]].forEach(([clip, s]) => {
      const h = el.cloneNode(true); h.style.visibility = 'hidden'; h.style.clipPath = clip; h.style.webkitClipPath = clip; layer.appendChild(h);
      out.push(anim(h, [
        { transform: T(), opacity: 1, visibility: 'visible', offset: 0 },
        { transform: T(s * 0.14, 0.06, { r: s * 9 }), opacity: 1, visibility: 'visible', offset: 0.35, easing: E.out },
        { transform: T(s * 0.46, 0.66, { r: s * 38 }), opacity: 0, visibility: 'visible', offset: 1 },
      ], { delay: at, duration: 500 * q, fill: 'forwards' }));
    });
    return out;
  },
  // rook: crumbles into four blocks
  r: (el, at, q, d, layer) => {
    const out = [hideAt(el, at)];
    [['inset(0 50% 50% 0)', -1, 0], ['inset(0 0 50% 50%)', 1, 0], ['inset(50% 50% 0 0)', -1, 1], ['inset(50% 0 0 50%)', 1, 1]].forEach(([clip, s, low], i) => {
      const h = el.cloneNode(true); h.style.visibility = 'hidden'; h.style.clipPath = clip; h.style.webkitClipPath = clip; layer.appendChild(h);
      out.push(anim(h, [
        { transform: T(), opacity: 1, visibility: 'visible', offset: 0 },
        { transform: T(s * 0.1, low ? 0.06 : -0.04, { r: s * 6 }), opacity: 1, visibility: 'visible', offset: 0.25, easing: E.out },
        { transform: T(s * (0.28 + i * 0.06), 0.74 + low * 0.18, { r: s * (40 + i * 18) }), opacity: 0, visibility: 'visible', offset: 1 },
      ], { delay: at + i * 22 * q, duration: 560 * q, fill: 'forwards' }));
    });
    return out;
  },
  // queen: a long dramatic swoon
  q: (el, at, q, d) => [anim(el, [
    { transform: T(), opacity: 1, offset: 0 },
    { transform: T(0, -0.14, { r: -24 }), opacity: 1, offset: 0.22, easing: E.out },
    { transform: T(0, -0.04, { r: 180, sx: 0.82 }), opacity: 0.85, offset: 0.62, easing: E.io },
    { transform: T(0, 0.12, { r: 380, sx: 0.14 }), opacity: 0, offset: 1 },
  ], { delay: at, duration: 700 * q })],
};

/* ---------------------------------------------------------------- shared effects */
function burst(layer, p, at, q, color, big) {
  const out = [];
  const star = bit(layer, 'fx-star', p, `--fx:${color}`);
  star.innerHTML = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><path d="M0-48 5-9 42-34 12-4 48 0 12 4 42 34 5 9 0 48-5 9-42 34-12 4-48 0-12-4-42-34-5-9Z"/></svg>';
  out.push(anim(star, [{ transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 0.9 }, { transform: `translate(-50%,-50%) scale(${big ? 1.7 : 1.25}) rotate(20deg)`, opacity: 0 }], { delay: at, duration: 300 * q, easing: E.out }));
  const ring = bit(layer, 'fx-ring', p, `--fx:${color}`);
  out.push(anim(ring, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0.95 }, { transform: `translate(-50%,-50%) scale(${big ? 2.3 : 1.7})`, opacity: 0 }], { delay: at, duration: 460 * q, easing: E.out }));
  const n = big ? 11 : 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.4 + (i % 2) * 0.25, r = (big ? 0.95 : 0.7) + (i % 3) * 0.18;
    const b = bit(layer, 'fx-bit', p, `--fx:${color};--s:${2.2 + (i % 3) * 0.9}%`);
    out.push(anim(b, [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * r * 100}%), calc(-50% + ${(Math.sin(a) * r - 0.1) * 100}%)) scale(.9)`, opacity: 1, offset: 0.55, easing: E.out },
      { transform: `translate(calc(-50% + ${Math.cos(a) * r * 118}%), calc(-50% + ${(Math.sin(a) * r + 0.55) * 100}%)) scale(.3)`, opacity: 0 },
    ], { delay: at, duration: 520 * q, easing: E.out }));
  }
  return out;
}
function shake(el, at, q, amp) {
  const k = amp;
  return anim(el, [
    { transform: 'none' }, { transform: `translate(${k}%, ${-k * 0.6}%)` }, { transform: `translate(${-k}%, ${k * 0.5}%)` },
    { transform: `translate(${k * 0.6}%, ${k * 0.4}%)` }, { transform: `translate(${-k * 0.4}%, ${-k * 0.3}%)` }, { transform: 'none' },
  ], { delay: at, duration: 280 * q, easing: 'linear' });
}
function slash(layer, p, ux, uy, at, q) {
  const b = bit(layer, 'fx-slash', p);
  const deg = Math.atan2(uy, ux) * 180 / Math.PI;
  return anim(b, [
    { transform: `translate(-50%,-50%) rotate(${deg}deg) scaleX(.1)`, opacity: 1 },
    { transform: `translate(-50%,-50%) rotate(${deg}deg) scaleX(1)`, opacity: 1, offset: 0.4, easing: E.out },
    { transform: `translate(-50%,-50%) rotate(${deg}deg) scaleX(1.05)`, opacity: 0 },
  ], { delay: at, duration: 300 * q });
}
function sparks(layer, p, at, q, color, n = 7) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const b = bit(layer, 'fx-spark', { x: p.x + (i - n / 2) * 0.08, y: p.y }, `--fx:${color}`);
    b.innerHTML = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><path d="M0-48 12-12 48 0 12 12 0 48-12 12-48 0-12-12Z"/></svg>';
    out.push(anim(b, [
      { transform: 'translate(-50%,-30%) scale(.2)', opacity: 0 },
      { transform: `translate(calc(-50% + ${(i - n / 2) * 18}%), -${70 + (i % 3) * 25}%) scale(1)`, opacity: 1, offset: 0.4 },
      { transform: `translate(calc(-50% + ${(i - n / 2) * 30}%), -${140 + (i % 3) * 30}%) scale(.3)`, opacity: 0 },
    ], { delay: at + i * 40 * q, duration: 620 * q, easing: E.out }));
  }
  return out;
}

/* ---------------------------------------------------------------- public: one capture */
/* o: { orient: 'w'|'b', from, to, victimSq, attacker: {color, type}, victim: {color, type}, quick, colors: {w, b} }
   Returns { done, cleanup }. The caller hides the two real pieces first, puts the new position up when `done` resolves,
   and then calls cleanup() to take the ghosts away. */
export function capture(layer, o) {
  const a = squareXY(o.from, o.orient), t = squareXY(o.to, o.orient), v = squareXY(o.victimSq || o.to, o.orient);
  const q = calm() ? 0 : (o.quick ? 0.42 : 1);
  const color = (o.colors && o.colors[o.attacker.color]) || '#ffb347';
  const made = [];
  if (!q) {   // reduced motion: no flying, only a quiet flash on the square
    const ring = bit(layer, 'fx-ring', v, `--fx:${color}`); made.push(ring);
    const an = anim(ring, [{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0 }], { duration: 260, easing: E.out });
    return { done: an.finished.catch(() => { }), cleanup() { made.forEach(n => n.remove()); } };
  }
  const vx = t.x - a.x, vy = t.y - a.y, len = Math.hypot(vx, vy) || 1;
  const d = { vx, vy, ux: vx / len, uy: vy / len, sign: (vx !== 0 ? Math.sign(vx) : ((t.x + t.y) % 2 ? 1 : -1)) };
  const victim = ghost(layer, o.victim.color, o.victim.type, v, 'victim');
  const attacker = ghost(layer, o.attacker.color, o.attacker.type, a, 'attacker ' + o.attacker.type);
  made.push(victim, attacker);
  const A = ATTACKS[o.attacker.type](d);
  const dur = A.dur * q, hit = dur * A.hit;
  const anims = [];
  anims.push(anim(attacker, A.frames, { duration: dur, easing: 'linear' }));
  // the victim falls at the hit
  const before = layer.children.length;
  anims.push(...FALLS[o.victim.type](victim, hit + 20 * q, q, d, layer));
  made.push(...[...layer.children].slice(before));
  // the impact
  const big = o.attacker.type === 'k' || o.attacker.type === 'r' || o.victim.type === 'q';
  const m0 = layer.children.length;
  anims.push(...burst(layer, { x: v.x + 0.5, y: v.y + 0.55 }, hit, q, color, big));
  if (o.attacker.type === 'b') anims.push(slash(layer, { x: v.x + 0.5, y: v.y + 0.5 }, d.ux, d.uy, Math.max(0, hit - 70 * q), q));
  if (o.victim.type === 'q') anims.push(...sparks(layer, { x: v.x + 0.5, y: v.y + 0.4 }, hit + 60 * q, q, '#ffc857'));
  made.push(...[...layer.children].slice(m0));
  const wrap = layer.parentElement;
  if (wrap && (o.attacker.type === 'r' || o.attacker.type === 'k')) anims.push(shake(wrap, hit, q, o.attacker.type === 'k' ? 1.1 : 0.7));
  const done = Promise.all(anims.map(x => x.finished.catch(() => { })));
  return {
    done,
    // the attacker rests on the victim's square until the new position is drawn under it
    cleanup() { anims.forEach(x => { try { x.cancel(); } catch (e) { } }); made.forEach(n => n.remove()); },
    skip() { anims.forEach(x => { try { x.finish(); } catch (e) { } }); },
  };
}

/* a pawn that reaches the far rank: a little shower of light on the square */
export function promote(layer, sq, orient, color, quick) {
  const q = calm() ? 0 : (quick ? 0.5 : 1);
  if (!q) return { done: Promise.resolve(), cleanup() { } };
  const p = squareXY(sq, orient);
  const made0 = layer.children.length;
  const an = [...burst(layer, { x: p.x + 0.5, y: p.y + 0.5 }, 0, q, color, false), ...sparks(layer, { x: p.x + 0.5, y: p.y + 0.5 }, 40 * q, q, '#ffc857', 6)];
  const made = [...layer.children].slice(made0);
  return { done: Promise.all(an.map(x => x.finished.catch(() => { }))), cleanup() { made.forEach(n => n.remove()); } };
}

/* checkmate: the king goes over and stays down until the layer is cleared */
export function kingDown(layer, sq, orient, color, quick) {
  const p = squareXY(sq, orient);
  const q = calm() ? 0 : (quick ? 0.5 : 1);
  const g = ghost(layer, color, 'k', p, 'victim');
  if (!q) { g.style.opacity = '.55'; return { done: Promise.resolve(), cleanup() { g.remove(); } }; }
  const s = ((p.x + p.y) % 2) ? 1 : -1;
  const an = anim(g, [
    { transform: T(), opacity: 1 },
    { transform: T(0, -0.06, { r: s * -6 }), opacity: 1, offset: 0.25, easing: E.out },
    { transform: T(s * 0.14, 0.16, { r: s * 82 }), opacity: 0.6 },
  ], { duration: 800 * q, easing: E.in });
  return { done: an.finished.catch(() => { }), cleanup() { g.remove(); } };
}
