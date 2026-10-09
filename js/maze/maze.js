/* DEAD ENDS: thirteen circular mazes, one per planet, each laid out by the being who lives there.
   The ladder and the table share OVER THE BOARD's frame (chess.css classes), so the three games read as one.
   The mazes keep the seeds and palettes of the SOLACE maze, so each one is the shape it has always been.
   Nothing loads from a CDN. The nebula behind each maze and the planet sounds stream from Wix, as everywhere on the site. */
import { BEINGS, BY_ID } from '../chess/beings.js';
import { MAZE_ASSETS } from './assets.js';
import { MAZE_LINES } from './voices.js';

export const HOME = '#/games/dead-ends';
const FV = window.FV || { planets: [] };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = () => matchMedia('(hover: none) and (pointer: coarse)').matches;

/* ------------------------------------------------------------------ saved on this device */
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.maze.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.maze.' + k, JSON.stringify(v)); } catch (e) { } },
};
const PROG = {
  done() { return new Set(store.get('done', [])); },
  add(id) { const s = this.done(); s.add(id); store.set('done', [...s]); },
  best(id) { return (store.get('best', {}) || {})[id] || 0; },
  setBest(id, ms) { const b = store.get('best', {}) || {}; if (!b[id] || ms < b[id]) { b[id] = ms; store.set('best', b); return true; } return false; },
  preview() { return !!store.get('preview', false); },
  unlocked(b) { return this.preview() || b.n === 1 || this.done().has(BEINGS[b.n - 2].id); },
  next() { const s = this.done(); return BEINGS.find(b => !s.has(b.id) && this.unlocked(b)) || null; },
};

/* the being's own time on its maze, the one to beat; and a line about the maze itself */
const HOUSE = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 165, 180, 200];
const TAGS = {
  'planet-zee': 'Wide corridors and a few loops. The one everybody gets out of.',
  'yaaarghs-revenge': 'Looks like the last one, turned around. It is not.',
  'oogh-iv': 'Corridors a stone wide. Fewer loops. More walls.',
  'prearth': 'Tighter, and the lava does not help.',
  'that-other-planet': 'Efficient. Every wrong turn is a long one.',
  'figuria': 'Snap-fit walls. Half the gaps are decoys.',
  'dens-crevice': 'A cave. Dark corners, long dead ends.',
  'heliumdrum': 'Soft walls, long drifts between turns.',
  'washy-washy-ii': 'Back rooms inside back rooms.',
  'yarnia': 'Knitted tight. One thread goes through.',
  'hungary': 'Fresh for a minute. Then the walls close in.',
  'guffaw-7': 'Every corridor is a setup. One of them pays off.',
  'spee-ider-grove': 'The web. Thirteenth and tightest.',
};
const planetOf = b => FV.planets.find(p => p.slug === b.id) || {};
const fmt = ms => { const s = Math.floor(ms / 1000), cs = Math.floor((ms % 1000) / 10); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + '.' + String(cs).padStart(2, '0'); };

/* ------------------------------------------------------------------ the maze itself (seeded, so a planet's maze never changes) */
const W = 51, H = 51;
function mulberry32(seed) { return function () { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function buildMaze(seed, loopFactor = 0.03, wide = false) {
  const rng = mulberry32(seed);
  const grid = Array.from({ length: H }, () => Array(W).fill(1));
  const cx = (W - 1) / 2, cy = (H - 1) / 2, maxR = Math.floor(Math.min(W, H) / 2) - 2;
  const inside = (x, y) => Math.hypot((x + 0.5) - cx, (y + 0.5) - cy) <= maxR;
  const stack = [[Math.floor(cx), Math.floor(cy)]];
  grid[Math.floor(cy)][Math.floor(cx)] = 0;
  // iterative carve (the original recursed; a 51x51 grid is fine either way, this one never touches the call stack)
  const carve = (x, y) => {
    grid[y][x] = 0;
    const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => rng() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy, mx = x + dx / 2, my = y + dy / 2;
      if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1 && inside(nx, ny) && grid[ny][nx] === 1) {
        grid[ny][nx] = 0; if (inside(mx, my)) grid[my][mx] = 0; carve(nx, ny);
      }
    }
  };
  carve(Math.floor(cx), Math.floor(cy));
  const loops = Math.floor(W * H * loopFactor);
  const open = n => { for (let i = 0; i < n; i++) { const wx = 2 + Math.floor(rng() * (W - 4)), wy = 2 + Math.floor(rng() * (H - 4)); if (!inside(wx, wy) || grid[wy][wx] !== 1) continue; const l = grid[wy][wx - 1] === 0, r = grid[wy][wx + 1] === 0, u = grid[wy - 1][wx] === 0, d = grid[wy + 1][wx] === 0; if ((l && r) || (u && d)) grid[wy][wx] = 0; } };
  open(loops); if (wide) open(Math.floor(loops * 0.4));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!inside(x, y)) grid[y][x] = 1;
  return grid;
}
function endpoints(grid) {
  const cx = (W - 1) / 2, cy = (H - 1) / 2, maxR = Math.floor(Math.min(W, H) / 2) - 2;
  const cells = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (grid[y][x] === 0 && Math.hypot(x - cx, y - cy) <= maxR) cells.push({ x, y });
  cells.sort((a, b) => a.y - b.y || a.x - b.x);
  return { start: cells[0], end: cells[cells.length - 1] };
}
function bfs(grid, start, end) {
  const q = [[start.x, start.y]], par = { [start.x + ',' + start.y]: null };
  while (q.length) {
    const [x, y] = q.shift();
    if (x === end.x && y === end.y) { const path = []; let p = [x, y]; while (p) { path.unshift(p); p = par[p[0] + ',' + p[1]]; } return path; }
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] === 0 && !(k in par)) { par[k] = [x, y]; q.push([nx, ny]); } }
  }
  return [];
}

/* ------------------------------------------------------------------ the ladder */
const meter = n => `<span class="lv" role="img" aria-label="Maze ${n} of 13">${BEINGS.map((_, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('')}</span>`;
function ladderHTML() {
  const done = PROG.done(), nxt = PROG.next();
  const count = BEINGS.filter(b => done.has(b.id)).length;
  const prog = count === 13 ? 'All thirteen escaped. The whole route, walked.' : count === 0 ? `Nobody escaped yet. ${BEINGS[0].name}'s maze goes first.` : `${count} of 13 escaped.${nxt ? ` Next: ${nxt.name}'s.` : ''}`;
  const card = b => {
    const did = done.has(b.id), open = PROG.unlocked(b), isNext = nxt && nxt.id === b.id, best = PROG.best(b.id);
    const cls = did ? 'is-beaten' : isNext ? 'is-next' : open ? 'is-open' : 'is-locked';
    const status = did ? `Escaped in ${fmt(best)}` : isNext ? 'Your turn to run' : open ? 'Open' : `Escape ${BEINGS[b.n - 2].name}'s first`;
    const inner = `<span class="face"><img src="${b.face}" alt="" width="360" height="351" loading="lazy" decoding="async" draggable="false"></span>
      <span class="no">${b.n}</span>
      <b class="nm">${esc(b.planet)}</b>
      <span class="sp">${esc(b.name)} · ${esc(b.species)}</span>
      <span class="tg">${esc(TAGS[b.id] || '')}</span>
      ${meter(b.n)}
      <span class="st">${did ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : ''}${esc(status)}</span>`;
    return open
      ? `<a class="otb-card ${cls}" href="${HOME}/${b.id}" data-being="${b.id}" style="--bc:${b.color}">${inner}</a>`
      : `<div class="otb-card ${cls}" aria-disabled="true" data-being="${b.id}" style="--bc:${b.color}">${inner}</div>`;
  };
  return `<div class="page otb-page de-page">
    <p class="crumbs"><a href="#/games">Games</a><span aria-hidden="true">/</span>DEAD ENDS</p>
    <div class="page-head"><span class="kicker">Game</span><h1>DEAD ENDS</h1>
      <p>Thirteen round mazes, one per planet, each one laid out by the being who lives there. Get out of one and the next planet opens. Arrow keys on a desk, the pad or a swipe on a phone. Hints cost nothing but their respect.</p>
      <p class="otb-prog" id="deProg">${esc(prog)}</p></div>
    <div class="otb-ladder">${BEINGS.map(card).join('')}</div>
    <div class="otb-foot">
      <button class="otb-preview" type="button" role="switch" aria-checked="${PROG.preview()}" id="dePreview"><span class="knob" aria-hidden="true"></span><span>Preview mode: open all thirteen</span></button>
      <details class="otb-credits"><summary>Credits</summary><div class="cr-in"><p>Made for FictionVision. The faces are the Winthrop Review Crew, the asteroid you steer and the planet sounds are Pierce's, and the mazes keep the seeds of the SOLACE maze so each planet's maze is the shape it has always been. No library does any of this.</p></div></details>
    </div></div>`;
}
function mountLadder(root) {
  const paint = () => { root.innerHTML = ladderHTML(); $('#dePreview', root).addEventListener('click', () => { store.set('preview', !PROG.preview()); paint(); }); };
  paint();
  return () => { };
}

/* ------------------------------------------------------------------ the table */
function tableHTML(b) {
  const p = planetOf(b);
  return `<div class="page otb-page otb-table de-table" style="--bc:${b.color}" data-being="${b.id}">
    <div class="otb-head">
      <a class="back" href="${HOME}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>All thirteen</span></a>
      <span class="lvl" id="deLvl">${b.n} of 13 · ${esc(b.species)}</span>
    </div>
    <div class="otb-grid">
      <section class="otb-talk" aria-label="${esc(b.name)}">
        <div class="face"><img src="${b.face}" alt="${esc(b.name)}" width="360" height="351" decoding="async" id="deFace"></div>
        <div class="bubble" id="bubble"><span class="who" id="deWho">${esc(b.name)}</span><p id="say" aria-live="polite"></p><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
      </section>
      <section class="otb-boardcol">
        <div class="otb-strip opp"><span class="who" id="deStripWho">${esc(b.short || b.name)}</span><span class="tray de-planet" id="dePlanet"><img src="${p.mark || b.mark}" alt="">${esc(b.planet)}</span></div>
        <div class="otb-boardwrap de-stage" id="stage">
          <div class="de-orbit" id="orbit" aria-label="The thirteen planets"></div>
          <div class="de-disc" id="disc">
            <video class="de-neb" id="neb" muted playsinline preload="none" disablepictureinpicture poster="${p.still || ''}"></video>
            <canvas class="de-maze" id="mz"></canvas>
          </div>
          <canvas class="de-ring" id="ring"></canvas>
          <div class="de-card" id="deHint"><span>Arrow keys to move</span><span class="keys"><i>↑</i><i>↓</i><i>←</i><i>→</i></span></div>
        </div>
        <div class="otb-strip me"><span class="who">You</span><span class="de-clock" id="clock" role="timer">0:00.00</span><span class="status" id="status" role="status"></span></div>
        <div class="de-pad" id="pad" aria-label="Move">
          <button type="button" data-dir="up" aria-label="Up">↑</button>
          <button type="button" data-dir="left" aria-label="Left">←</button>
          <button type="button" data-dir="down" aria-label="Down">↓</button>
          <button type="button" data-dir="right" aria-label="Right">→</button>
        </div>
      </section>
      <aside class="otb-side">
        <div class="meta"><b id="deName">${esc(b.name)}</b><span id="deMeta">${esc(b.species)} · ${esc(b.planet)}</span><span class="tg" id="deTag">${esc(TAGS[b.id] || '')}</span></div>
        <dl class="de-times" id="times"></dl>
        <div class="actions">
          <button class="ghost" type="button" id="btnHint">Hint</button>
          <button class="ghost" type="button" id="btnSolve">Solve</button>
          <button class="ghost" type="button" id="btnAgain">Run it again</button>
        </div>
      </aside>
      <div class="otb-over" id="over" hidden role="region" aria-labelledby="overTitle"></div>
    </div>
  </div>`;
}

class Table {
  constructor(root, b) {
    this.root = root; this.dead = false; this.timers = new Set();
    this.bag = {}; this.heard = new Set(); this.sayAt = 0; this.sayHold = 0;
    this.keys = { up: false, down: false, left: false, right: false }; this.lastKey = null;
    this.faces = BEINGS.map(x => { const i = new Image(); i.decoding = 'async'; i.src = x.face; return i; });
    this.rocks = BEINGS.map(x => { const i = new Image(); i.decoding = 'async'; i.src = (MAZE_ASSETS[x.id] || {}).asteroid || ''; return i; });
    this.sound = null; this.soundIdx = {}; this.touched = false;
    root.innerHTML = tableHTML(b);
    const q = id => $('#' + id, root);
    this.el = { stage: q('stage'), orbit: q('orbit'), disc: q('disc'), neb: q('neb'), mz: q('mz'), ring: q('ring'), hint: q('deHint'), clock: q('clock'), status: q('status'), pad: q('pad'), times: q('times'), say: q('say'), bubble: q('bubble'), over: q('over'), face: q('deFace'), who: q('deWho'), stripWho: q('deStripWho'), planet: q('dePlanet'), name: q('deName'), meta: q('deMeta'), tag: q('deTag'), lvl: q('deLvl'), btnHint: q('btnHint'), btnSolve: q('btnSolve'), btnAgain: q('btnAgain') };
    this.ctx = this.el.mz.getContext('2d'); this.rctx = this.el.ring.getContext('2d');
    this.bind();
    this.setBeing(b, { spin: false });
    this.layout();
    this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
    window.__de = this.handle();
  }
  later(fn, ms) { const t = setTimeout(() => { this.timers.delete(t); if (!this.dead) fn(); }, ms); this.timers.add(t); return t; }

  /* ---- the being whose maze this is */
  setBeing(b, o = {}) {
    this.b = b; this.a = MAZE_ASSETS[b.id] || {}; this.p = planetOf(b); this.idx = b.n - 1;
    const e = this.el, r = this.root.firstElementChild;
    r.style.setProperty('--bc', b.color); r.dataset.being = b.id;
    e.face.src = b.face; e.face.alt = b.name; e.who.textContent = b.name; e.stripWho.textContent = b.short || b.name;
    e.planet.innerHTML = `<img src="${this.p.mark || b.mark}" alt="">${esc(b.planet)}`;
    e.name.textContent = b.name; e.meta.textContent = `${b.species} · ${b.planet}`; e.tag.textContent = TAGS[b.id] || ''; e.lvl.textContent = `${b.n} of 13 · ${b.species}`;
    document.title = `DEAD ENDS · ${b.planet} · FictionVision`;
    try { history.replaceState(history.state, '', `${HOME}/${b.id}`); } catch (err) { }
    // the maze
    this.grid = buildMaze(this.a.seed || 1, this.a.loop != null ? this.a.loop : (0.08 - (this.idx / 12) * 0.06), !!this.a.wide);
    const { start, end } = endpoints(this.grid); this.start = start; this.end = end;
    this.reset();
    // the orbit spins so this being sits at the top
    this.spinFrom = o.spin === false ? null : performance.now();
    // the nebula behind it
    this.nebula();
    this.paintTimes();
    this.el.over.hidden = true;
    this.say('greet');
  }
  reset() {
    this.fx = this.start.x; this.fy = this.start.y; this.moved = false; this.t0 = null; this.elapsed = 0; this.over = false; this.slowSaid = false; this.solved = false;
    this.path = []; this.seg = []; this.hintMode = 'none'; this.hintP = 0; this.hintAnim = false;
    this.keys = { up: false, down: false, left: false, right: false }; this.lastKey = null;
    this.el.btnHint.disabled = this.el.btnSolve.disabled = false;
    this.el.clock.textContent = fmt(0); this.el.status.textContent = '';
    this.el.hint.classList.remove('gone');
  }
  nebula() {
    const v = this.el.neb, src = this.p.nebula;
    cancelAnimationFrame(this.nebRaf); this.nebRaf = 0;
    v.poster = this.p.still || ''; v.classList.remove('in');
    if (!src || calm()) { v.removeAttribute('src'); v.load(); return; }
    v.src = src.replace('/1080p/', '/720p/'); v.loop = false; v.load();
    v.onplaying = () => v.classList.add('in');
    v.oncanplay = () => { if (!this.dead && v.paused) v.play().catch(() => { }); };
    // never a hard loop: forward, then backward, then forward (the site's rule for every video)
    v.onended = () => { let last = 0; const back = now => { if (this.dead || v.src !== v.currentSrc && !v.currentSrc) return; const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; if (!v.seeking) { const t = v.currentTime - dt * 0.9; if (t <= 0.05) { v.currentTime = 0; this.nebRaf = 0; v.play().catch(() => { }); return; } v.currentTime = t; } this.nebRaf = requestAnimationFrame(back); }; this.nebRaf = requestAnimationFrame(back); };
    v.play().catch(() => { });
  }
  paintTimes() {
    const best = PROG.best(this.b.id), house = HOUSE[this.idx] * 1000;
    this.el.times.innerHTML = `<div><dt>${esc(this.b.short || this.b.name)}'s time</dt><dd>${fmt(house)}</dd></div><div><dt>Your best</dt><dd>${best ? fmt(best) : 'Not yet'}</dd></div>`;
  }

  /* ---- what it says */
  pick(kind) {
    const lines = (MAZE_LINES[this.b.id] || {})[kind]; if (!lines || !lines.length) return '';
    const key = this.b.id + ':' + kind; let bag = this.bag[key];
    if (!bag || !bag.length) { const all = lines.map((_, i) => i), fresh = all.filter(i => !this.heard.has(key + ':' + i)); bag = (fresh.length ? fresh : all).sort(() => Math.random() - 0.5); if (!fresh.length) all.forEach(i => this.heard.delete(key + ':' + i)); }
    const i = bag.shift(); this.bag[key] = bag; this.heard.add(key + ':' + i);
    return lines[i];
  }
  say(kind, text) {
    const t = text || this.pick(kind); if (!t) return;
    const e = this.el; e.say.textContent = t; e.bubble.dataset.kind = kind;
    e.bubble.classList.remove('pop'); void e.bubble.offsetWidth; e.bubble.classList.add('pop');
    const fc = $('.otb-talk .face', this.root); if (fc) { fc.classList.remove('bump'); void fc.offsetWidth; fc.classList.add('bump'); }
    (this.said = this.said || []).push({ kind, text: t });
  }

  /* ---- sizes: the disc (the maze) sits inside the ring of faces on a desk; on a phone the faces go in a row above and the disc takes the width */
  layout() {
    const e = this.el, S = e.stage.clientWidth || 300, dpr = Math.min(2, devicePixelRatio || 1);
    this.phone = coarse() || S < 480;
    this.faceR = this.phone ? 0 : Math.round(Math.max(26, Math.min(56, S * 0.065)));
    const pad = this.phone ? 2 : 6;
    this.discR = Math.floor(S / 2 - (this.faceR * 2) - pad);
    this.cell = (this.discR * 2) / W;
    e.disc.style.width = e.disc.style.height = (this.discR * 2) + 'px';
    e.mz.width = e.mz.height = Math.round(this.discR * 2 * dpr); e.mz.style.width = e.mz.style.height = (this.discR * 2) + 'px';
    e.ring.width = e.ring.height = Math.round(S * dpr); e.ring.style.width = e.ring.style.height = S + 'px';
    this.dpr = dpr; this.S = S;
    e.stage.classList.toggle('phone', this.phone);
    this.paintOrbit();
  }
  paintOrbit() {
    // on a phone the orbit is a row of faces above the disc (a real row, scrollable), on a desk it is drawn on the ring canvas
    const o = this.el.orbit;
    if (!this.phone) { o.innerHTML = ''; return; }
    const done = PROG.done();
    o.innerHTML = BEINGS.map(b => `<button type="button" class="${b.id === this.b.id ? 'on' : ''}${PROG.unlocked(b) ? '' : ' locked'}${done.has(b.id) ? ' did' : ''}" data-being="${b.id}" aria-label="${esc(b.planet)}" style="--bc:${b.color}"><img src="${b.face}" alt="" width="360" height="351" draggable="false"></button>`).join('');
    const on = $('.on', o); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }

  /* ---- input */
  bind() {
    const e = this.el;
    this.onKey = ev => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
      const dir = map[ev.key]; if (!dir || /input|textarea|select/i.test((document.activeElement || {}).tagName || '')) return;
      ev.preventDefault(); if (this.over) return;
      if (ev.type === 'keydown') { this.keys[dir] = true; this.lastKey = dir; this.touched = true; } else this.keys[dir] = false;
    };
    addEventListener('keydown', this.onKey); addEventListener('keyup', this.onKey);
    // the pad: hold to move
    $$('button', e.pad).forEach(btn => {
      const dir = btn.dataset.dir;
      const down = ev => { ev.preventDefault(); if (this.over) return; this.keys[dir] = true; this.lastKey = dir; this.touched = true; try { btn.setPointerCapture(ev.pointerId); } catch (err) { } };
      const up = () => { this.keys[dir] = false; };
      btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
    });
    // a swipe on the disc steers, like a thumb on a joystick
    let sx = 0, sy = 0, swiping = false;
    e.disc.addEventListener('pointerdown', ev => { if (ev.pointerType === 'mouse') return; swiping = true; sx = ev.clientX; sy = ev.clientY; this.touched = true; try { e.disc.setPointerCapture(ev.pointerId); } catch (err) { } ev.preventDefault(); });
    e.disc.addEventListener('pointermove', ev => { if (!swiping || this.over) return; const dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.hypot(dx, dy) < 14) return; const k = this.keys; k.up = k.down = k.left = k.right = false; if (Math.abs(dy) >= Math.abs(dx)) { k[dy < 0 ? 'up' : 'down'] = true; this.lastKey = dy < 0 ? 'up' : 'down'; } else { k[dx < 0 ? 'left' : 'right'] = true; this.lastKey = dx < 0 ? 'left' : 'right'; } });
    const endSwipe = () => { swiping = false; const k = this.keys; k.up = k.down = k.left = k.right = false; };
    e.disc.addEventListener('pointerup', endSwipe); e.disc.addEventListener('pointercancel', endSwipe);
    // the ring of faces on a desk
    const hit = ev => { if (this.phone) return -1; const r = e.ring.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top; for (let i = 0; i < 13; i++) { const p = this.facePos(i); if (Math.hypot(x - p.x, y - p.y) <= this.faceR * 1.1) return i; } return -1; };
    e.ring.addEventListener('pointermove', ev => { const i = hit(ev); if (i !== this.hover) { this.hover = i; e.ring.style.cursor = i >= 0 ? 'pointer' : ''; if (i >= 0 && this.touched) this.playSound(i); } });
    e.ring.addEventListener('pointerleave', () => { this.hover = -1; e.ring.style.cursor = ''; });
    e.ring.addEventListener('click', ev => { const i = hit(ev); if (i >= 0) { this.touched = true; this.playSound(i); this.tapBeing(BEINGS[i]); } });
    e.orbit.addEventListener('click', ev => { const btn = ev.target.closest('button[data-being]'); if (!btn) return; this.touched = true; const b = BY_ID[btn.dataset.being]; this.playSound(b.n - 1); this.tapBeing(b); });
    e.btnHint.addEventListener('click', () => this.hintRun(false));
    e.btnSolve.addEventListener('click', () => this.hintRun(true));
    e.btnAgain.addEventListener('click', () => { this.reset(); this.el.over.hidden = true; this.say('greet'); });
    this.onResize = () => { clearTimeout(this.rsT); this.rsT = setTimeout(() => { if (!this.dead) this.layout(); }, 80); };
    addEventListener('resize', this.onResize);
    this.onVis = () => { if (document.hidden) { this.keys = { up: false, down: false, left: false, right: false }; if (this.sound) this.sound.pause(); } };
    document.addEventListener('visibilitychange', this.onVis);
  }
  tapBeing(b) {
    if (b.id === this.b.id) { this.reset(); this.el.over.hidden = true; this.say('greet'); return; }
    if (!PROG.unlocked(b)) { this.say('locked'); return; }
    this.setBeing(b, { spin: true }); this.paintOrbit();
  }
  playSound(i) {
    const list = (MAZE_ASSETS[BEINGS[i].id] || {}).sounds || []; if (!list.length) return;
    const k = this.soundIdx[i] = ((this.soundIdx[i] || 0) + 1) % list.length;
    try { if (this.sound) { this.sound.pause(); } this.sound = new Audio(list[k]); this.sound.volume = 0.7; this.sound.play().catch(() => { }); } catch (err) { }
  }

  /* ---- hints */
  hintRun(solve) {
    if (this.hintAnim || this.over) return;
    this.path = bfs(this.grid, { x: Math.round(this.fx), y: Math.round(this.fy) }, this.end); if (!this.path.length) return;
    if (solve) { this.seg = this.path; this.solved = true; } else {
      const n = this.path.length, show = Math.max(2, Math.ceil((n - 1) * 0.5) + 1); this.seg = this.path.slice(0, Math.min(show + 1, n));
    }
    this.say(solve ? 'solve' : 'hint');
    this.hintAnim = true; this.hintMode = solve ? 'solve' : 'dots'; this.hintP = 0; this.el.btnHint.disabled = this.el.btnSolve.disabled = true;
    const t0 = performance.now(), dur = 2500;
    const tick = () => { if (this.dead) return; this.hintP = Math.min(1, (performance.now() - t0) / dur); if (this.hintP < 1) requestAnimationFrame(tick); else { this.hintAnim = false; this.el.btnHint.disabled = this.el.btnSolve.disabled = false; this.later(() => { this.seg = []; this.hintMode = 'none'; this.hintP = 0; }, 1500); } };
    requestAnimationFrame(tick);
  }

  /* ---- the run */
  cellAt(px, py) { const gx = Math.floor(px), gy = Math.floor(py); if (gx < 0 || gx >= W || gy < 0 || gy >= H) return 1; return this.grid[gy][gx]; }
  step(dt) {
    if (this.over) return;
    const k = this.keys; let dx = 0, dy = 0;
    if (this.lastKey && !k[this.lastKey]) this.lastKey = null;
    if (!this.lastKey) this.lastKey = k.up ? 'up' : k.down ? 'down' : k.left ? 'left' : k.right ? 'right' : null;
    if (this.lastKey === 'up') dy = -1; else if (this.lastKey === 'down') dy = 1; else if (this.lastKey === 'left') dx = -1; else if (this.lastKey === 'right') dx = 1;
    if (!dx && !dy) return;
    if (!this.moved) { this.moved = true; this.t0 = performance.now(); this.el.hint.classList.add('gone'); this.say('start'); }
    const sp = 10.8 * dt, r = 0.22;                     // cells per second, the original's 0.18 cells a frame at sixty
    let nx = this.fx + dx * sp, ny = this.fy + dy * sp;
    if (dx < 0 && this.cellAt(nx - r, this.fy) === 1) nx = Math.floor(nx - r) + 1 + r; else if (dx > 0 && this.cellAt(nx + r, this.fy) === 1) nx = Math.floor(nx + r) - r;
    if (dy < 0 && this.cellAt(this.fx, ny - r) === 1) ny = Math.floor(ny - r) + 1 + r; else if (dy > 0 && this.cellAt(this.fx, ny + r) === 1) ny = Math.floor(ny + r) - r;
    this.fx = nx; this.fy = ny;
    if (Math.hypot(this.fx - this.end.x, this.fy - this.end.y) < 0.85) this.escape();
  }
  escape() {
    this.over = true; this.elapsed = performance.now() - this.t0; this.keys = { up: false, down: false, left: false, right: false };
    const ms = Math.round(this.elapsed), house = HOUSE[this.idx] * 1000, b = this.b;
    const counts = !this.solved;
    let improved = false;
    if (counts) { improved = PROG.setBest(b.id, ms); PROG.add(b.id); }
    this.paintTimes(); this.paintOrbit();
    const fast = counts && ms < house;
    document.dispatchEvent(new CustomEvent('fv:sfx', { detail: counts ? { planet: b.id, volume: 0.7 } : { kind: 'lose' } }));
    this.say(fast ? 'fast' : 'win');
    const next = BEINGS[this.idx + 1] || null;
    const why = counts ? `${fmt(ms)}. ${fast ? `Under ${b.short || b.name}'s ${fmt(house)}.` : `${b.short || b.name}'s time is ${fmt(house)}.`}${improved ? ' Your best on this maze.' : ''}` : `${fmt(ms)}, with the Solve button. That one does not count. Run it yourself and the next planet opens.`;
    let nextHTML = '';
    if (counts && next) nextHTML = `<div class="nx"><img src="${next.face}" alt="" width="360" height="351"><p><span>Next planet</span><b>${esc(next.planet)}</b><small>${esc(next.name)} · ${esc(next.species)}</small></p></div>`;
    else if (counts) nextHTML = '<p class="all">That is all thirteen. The whole route, walked. The beings would like a word over the board.</p>';
    this.el.over.innerHTML = `<div class="ov-card" data-kind="${counts ? 'win' : 'draw'}"><span class="kicker">${counts ? 'Escaped' : 'Walked out'}</span><h2 id="overTitle">${counts ? `You got out of ${esc(b.planet)}.` : `${esc(b.short || b.name)} walked you out.`}</h2><p>${esc(why)}</p>${nextHTML}
      <div class="btns">${counts && next ? `<button class="cta" type="button" id="ovNext">Run ${esc(next.planet)}</button>` : ''}${counts && !next ? `<a class="cta" href="#/games/over-the-board">Over the board</a>` : ''}
      <button class="ghost" id="ovAgain" type="button">Run it again</button><a class="ghost" href="${HOME}">All thirteen</a></div></div>`;
    this.el.over.hidden = false;
    $('#ovAgain', this.el.over).addEventListener('click', () => { this.reset(); this.el.over.hidden = true; this.say('greet'); });
    const nb = $('#ovNext', this.el.over); if (nb) nb.addEventListener('click', () => { this.say('next'); this.later(() => { this.setBeing(next, { spin: true }); this.paintOrbit(); }, 900); });
    const f = nb || $('#ovAgain', this.el.over); if (f) f.focus({ preventScroll: true });
    const r = this.el.over.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) this.el.over.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }

  /* ---- drawing */
  facePos(i) {
    const S = this.S, c = S / 2, R = c - this.faceR - 3;
    const sel = (this.idx / 13) * Math.PI * 2;
    let spin = 0;
    if (this.spinFrom != null) { const p = Math.min(1, (performance.now() - this.spinFrom) / 2200); const t = 1 - Math.pow(1 - p, 4); spin = (1 - t) * Math.PI * 3; if (p >= 1) this.spinFrom = null; }
    const a = (i / 13) * Math.PI * 2 - Math.PI / 2 - sel + spin;
    return { x: c + R * Math.cos(a), y: c + R * Math.sin(a), a };
  }
  loop(now) {
    if (this.dead) return;
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0; this.last = now;
    this.step(dt);
    if (this.moved && !this.over) { this.elapsed = now - this.t0; this.el.clock.textContent = fmt(this.elapsed); if (!this.slowSaid && this.elapsed > 45000) { this.slowSaid = true; this.say('slow'); } }
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }
  draw() {
    const ctx = this.ctx, dpr = this.dpr, D = this.discR * 2, C = this.cell, a = this.a;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, D, D);
    ctx.save(); ctx.beginPath(); ctx.arc(D / 2, D / 2, D / 2, 0, Math.PI * 2); ctx.clip();
    // the maze turns with the orbit while a new planet settles in
    let rot = 0; if (this.spinFrom != null) { const p = Math.min(1, (performance.now() - this.spinFrom) / 2200); rot = (1 - (1 - Math.pow(1 - p, 4))) * Math.PI * 3; }
    ctx.translate(D / 2, D / 2); ctx.rotate(rot); ctx.translate(-D / 2, -D / 2);
    const cx = (W - 1) / 2, cy = (H - 1) / 2, maxR = Math.floor(Math.min(W, H) / 2) - 2;
    ctx.fillStyle = (a.wall || '#2c3e50') + 'ee';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (this.grid[y][x] !== 1) continue; if (Math.hypot(x - cx, y - cy) > maxR + 1) continue; ctx.fillRect(x * C, y * C, C + 0.5, C + 0.5); }
    // the hint, drawn as a red thread
    if (this.seg.length >= 2 && this.hintMode !== 'none' && this.hintP > 0) {
      const segs = this.seg.length - 1, len = segs * this.hintP;
      ctx.strokeStyle = '#ff4a3d'; ctx.lineWidth = Math.max(2, C / 3); ctx.lineCap = ctx.lineJoin = 'round'; ctx.shadowColor = '#ff4a3d'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(this.seg[0][0] * C + C / 2, this.seg[0][1] * C + C / 2);
      for (let i = 0; i < segs; i++) { if (i + 1 <= len) ctx.lineTo(this.seg[i + 1][0] * C + C / 2, this.seg[i + 1][1] * C + C / 2); else if (i < len) { const t = len - i; ctx.lineTo((this.seg[i][0] + (this.seg[i + 1][0] - this.seg[i][0]) * t) * C + C / 2, (this.seg[i][1] + (this.seg[i + 1][1] - this.seg[i][1]) * t) * C + C / 2); break; } }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    const dot = (x, y, col) => { ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x * C + C / 2, y * C + C / 2, Math.max(3, C / 2.6), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; };
    dot(this.start.x, this.start.y, '#2ce880'); dot(this.end.x, this.end.y, '#ff4a3d');
    // you: the planet's asteroid, or a glowing ball until it loads
    const rock = this.rocks[this.idx], px = this.fx * C + C / 2, py = this.fy * C + C / 2, sz = Math.max(18, C * 5);
    if (rock && rock.complete && rock.naturalWidth) ctx.drawImage(rock, px - sz / 2, py - sz / 2, sz, sz);
    else { ctx.shadowColor = a.glow || this.b.color; ctx.shadowBlur = 14; ctx.fillStyle = a.ball || this.b.color; ctx.beginPath(); ctx.arc(px, py, Math.max(3, C / 2.2), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    ctx.restore();
    // the ring of faces (desk only)
    const r = this.rctx, S = this.S; r.setTransform(dpr, 0, 0, dpr, 0, 0); r.clearRect(0, 0, S, S);
    if (this.phone) return;
    const done = PROG.done();
    for (let i = 0; i < 13; i++) {
      const b = BEINGS[i], p = this.facePos(i), img = this.faces[i], R = this.faceR, on = i === this.idx, open = PROG.unlocked(b), hov = i === this.hover;
      r.save(); r.translate(p.x, p.y);
      if (on) { r.shadowColor = b.color; r.shadowBlur = 22; r.fillStyle = b.color; r.globalAlpha = .35; r.beginPath(); r.arc(0, 0, R * 1.18, 0, Math.PI * 2); r.fill(); r.globalAlpha = 1; r.shadowBlur = 0; }
      r.fillStyle = on ? '#14141d' : '#0f0f16'; r.beginPath(); r.arc(0, 0, R, 0, Math.PI * 2); r.fill();
      r.lineWidth = on ? 3 : 1.5; r.strokeStyle = on ? b.color : done.has(b.id) ? '#2ce880' : 'rgba(255,255,255,.28)'; r.stroke();
      if (img && img.complete && img.naturalWidth) { r.save(); r.beginPath(); r.arc(0, 0, R - 2, 0, Math.PI * 2); r.clip(); const s = (hov ? 2.1 : 1.9) * (R - 2); r.globalAlpha = open ? 1 : .32; r.drawImage(img, -s / 2, -s / 2 + (R - 2) * .18, s, s * 351 / 360); r.restore(); }
      if (!open) { r.fillStyle = 'rgba(0,0,0,.55)'; r.beginPath(); r.arc(0, 0, R - 2, 0, Math.PI * 2); r.fill(); r.strokeStyle = '#fff'; r.lineWidth = 2; r.strokeRect(-R * .22, -R * .05, R * .44, R * .36); r.beginPath(); r.arc(0, -R * .08, R * .16, Math.PI, 0); r.stroke(); }
      r.restore();
    }
  }

  handle() {
    const t = this;
    return { get being() { return t.b.id; }, get moved() { return t.moved; }, get over() { return t.over; }, get elapsed() { return t.elapsed; }, get bubble() { return t.el.say.textContent; }, get said() { return [...(t.said || [])]; }, get pos() { return { x: t.fx, y: t.fy }; }, get end() { return t.end; }, get start() { return t.start; }, get phone() { return t.phone; }, get cell() { return t.cell; },
      press(dir, on = true) { t.keys[dir] = on; if (on) t.lastKey = dir; t.touched = true; },
      teleport(x, y) { t.fx = x; t.fy = y; if (!t.moved) { t.moved = true; t.t0 = performance.now(); } },
      solve() { t.hintRun(true); }, hint() { t.hintRun(false); }, go(id) { const b = BY_ID[id]; if (b) t.tapBeing(b); } };
  }
  destroy() {
    this.dead = true; cancelAnimationFrame(this.raf); cancelAnimationFrame(this.nebRaf);
    this.timers.forEach(t => clearTimeout(t)); this.timers.clear();
    removeEventListener('keydown', this.onKey); removeEventListener('keyup', this.onKey); removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVis);
    try { if (this.sound) this.sound.pause(); } catch (e) { }
    try { const v = this.el.neb; v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { }
    if (window.__de === this.h) delete window.__de;
  }
}

/* ------------------------------------------------------------------ the route: #/games/dead-ends[/planet] */
export function mount(root, slug) {
  const b = slug ? BY_ID[slug] : null;
  if (slug && !b) { location.replace(HOME); return () => { }; }
  if (!b) return mountLadder(root);
  if (!PROG.unlocked(b)) { location.replace(HOME); return () => { }; }
  const t = new Table(root, b);
  return () => t.destroy();
}
