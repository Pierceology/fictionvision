/* OVER THE BOARD: the ladder of thirteen beings, and the table where you play one of them.
   (The Games card and the #/games page are in card.js and app.js, so the home page never loads any of this.)
   Rules: chess.js. Board: cm-chessboard. Engine: Lozza in a Web Worker. All three come from the jsDelivr CDN, pinned. */
import { BEINGS, BY_ID, PIECE_NAME } from './beings.js';
import { Engine } from './engine.js';
import { Brain } from './brain.js';
import * as fx from './fx.js';
import { creditsHTML } from './credits.js';

const CDN = {
  chess: 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js',
  board: 'https://cdn.jsdelivr.net/npm/cm-chessboard@8.15.3/src/Chessboard.js',
  css: 'https://cdn.jsdelivr.net/npm/cm-chessboard@8.15.3/assets/chessboard.css',
};
export const LADDER = '#/games/over-the-board';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const HUMAN = '#fa6010';

/* ------------------------------------------------------------------ saved on this device */
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.chess.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.chess.' + k, JSON.stringify(v)); } catch (e) { /* private mode: it just will not be remembered */ } },
};
const PROG = {
  beaten() { return new Set(store.get('beaten', [])); },
  add(id) { const s = this.beaten(); s.add(id); store.set('beaten', [...s]); },
  preview() { return !!store.get('preview', false); },
  unlocked(b) { return this.preview() || b.n === 1 || this.beaten().has(BEINGS[b.n - 2].id); },
  next() { const s = this.beaten(); return BEINGS.find(b => !s.has(b.id) && this.unlocked(b)) || null; },
};

/* ------------------------------------------------------------------ the three libraries, loaded when a table opens */
let libsP = null;
function loadCss(href) {
  return new Promise(res => {
    if ($(`link[data-otb="${href}"]`)) return res();
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.dataset.otb = href;
    l.onload = l.onerror = () => res();
    document.head.appendChild(l);
    setTimeout(res, 6000);
  });
}
function loadLibs() {
  if (!libsP) {
    libsP = Promise.all([import(CDN.chess), import(CDN.board), loadCss(CDN.css)])
      .then(([c, b]) => ({ Chess: c.Chess, Chessboard: b.Chessboard, INPUT: b.INPUT_EVENT_TYPE, FEN: b.FEN }))
      .catch(e => { libsP = null; throw e; });
  }
  return libsP;
}

/* ------------------------------------------------------------------ the ladder */
const meter = n => `<span class="lv" role="img" aria-label="Level ${n} of 13">${BEINGS.map((_, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('')}</span>`;

function ladderHTML() {
  const done = PROG.beaten(), nxt = PROG.next();
  const count = BEINGS.filter(b => done.has(b.id)).length;
  const prog = count === 13 ? 'All thirteen beaten.'
    : count === 0 ? `Nobody beaten yet. ${BEINGS[0].name} goes first.`
      : `${count} of 13 beaten.${nxt ? ` Next up: ${nxt.name}.` : ''}`;
  const card = b => {
    const beaten = done.has(b.id), open = PROG.unlocked(b), isNext = nxt && nxt.id === b.id;
    const cls = beaten ? 'is-beaten' : isNext ? 'is-next' : open ? 'is-open' : 'is-locked';
    const status = beaten ? 'Beaten' : isNext ? 'Your turn to face' : open ? 'Open' : `Beat ${BEINGS[b.n - 2].name} first`;
    const inner = `<span class="face"><img src="${b.face}" alt="" width="360" height="351" loading="lazy" decoding="async" draggable="false"></span>
      <span class="no">${b.n}</span>
      <b class="nm">${esc(b.name)}</b>
      <span class="sp">${esc(b.species)} · ${esc(b.planet)}</span>
      <span class="tg">${esc(b.tag)}</span>
      ${meter(b.n)}
      <span class="st">${beaten ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : ''}${esc(status)}</span>`;
    return open
      ? `<a class="otb-card ${cls}" href="${LADDER}/${b.id}" data-being="${b.id}" style="--bc:${b.color}">${inner}</a>`
      : `<div class="otb-card ${cls}" aria-disabled="true" data-being="${b.id}" style="--bc:${b.color}">${inner}</div>`;
  };
  return `<div class="page otb-page">
    <p class="crumbs"><a href="#/games">Games</a><span aria-hidden="true">/</span>OVER THE BOARD</p>
    <div class="page-head"><span class="kicker">Game</span><h1>OVER THE BOARD</h1>
      <p>You play chess against the thirteen beings of the Pool Table Universe, one at a time. Beat one and the next one sits down across from you.</p>
      <p class="otb-prog" id="otbProg">${esc(prog)}</p></div>
    <div class="otb-ladder">${BEINGS.map(card).join('')}</div>
    <div class="otb-foot">
      <button class="otb-preview" type="button" role="switch" aria-checked="${PROG.preview()}" id="otbPreview"><span class="knob" aria-hidden="true"></span><span>Preview mode: open all thirteen</span></button>
      ${creditsHTML()}
    </div></div>`;
}

function mountLadder(root) {
  const paint = () => {
    root.innerHTML = ladderHTML();
    $('#otbPreview', root).addEventListener('click', () => { store.set('preview', !PROG.preview()); paint(); });
  };
  paint();
  return () => { };
}

/* ------------------------------------------------------------------ the table */
const rankFile = sq => ({ f: sq.charCodeAt(0) - 97, r: +sq[1] - 1 });

function tableHTML(b) {
  const sw = (id, label, on) => `<button class="otb-sw" type="button" role="switch" aria-checked="${on}" id="${id}"><span class="knob" aria-hidden="true"></span><span>${label}</span></button>`;
  return `<div class="page otb-page otb-table" style="--bc:${b.color}" data-being="${b.id}">
    <div class="otb-head">
      <a class="back" href="${LADDER}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>All thirteen</span></a>
      <span class="lvl">${b.n} of 13 · ${esc(b.species)}</span>
    </div>
    <div class="otb-grid">
      <section class="otb-talk" aria-label="${esc(b.name)}">
        <div class="face"><img src="${b.face}" alt="${esc(b.name)}" width="360" height="351" decoding="async"></div>
        <div class="bubble" id="bubble"><span class="who">${esc(b.name)}</span><p id="say" aria-live="polite"></p><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
      </section>
      <section class="otb-boardcol">
        <div class="otb-strip opp"><span class="who">${esc(b.short || b.name)}</span><span class="tray" id="trayOpp"></span></div>
        <div class="otb-boardwrap" id="boardwrap">
          <div class="otb-board" id="board"></div>
          <div class="fxl" id="fxl"><div class="marks" id="marks"></div></div>
          <div class="promo" id="promo" hidden></div>
        </div>
        <div class="otb-strip me"><span class="who">You</span><span class="tray" id="trayMe"></span><span class="status" id="status" role="status"></span></div>
      </section>
      <aside class="otb-side">
        <div class="meta"><b>${esc(b.name)}</b><span>${esc(b.species)} · ${esc(b.planet)}</span><span class="tg">${esc(b.tag)}</span></div>
        <ol class="moves" id="moves" aria-label="Moves"></ol>
        <div class="actions">
          <button class="ghost" type="button" id="btnResign">Resign</button>
          <button class="ghost" type="button" id="btnNew">New game</button>
        </div>
        <div class="toggles">${sw('swQuick', 'Quick play', false)}${sw('swColor', 'You play White', false)}</div>
      </aside>
      <div class="otb-over" id="over" hidden role="region" aria-labelledby="overTitle"></div>
    </div>
    <div class="otb-foot">${creditsHTML()}</div>
  </div>`;
}

class Table {
  constructor(root, b) {
    this.root = root; this.b = b; this.dead = false;
    this.quick = !!store.get('quick', false);
    this.color = store.get('color', 'w') === 'b' ? 'b' : 'w';
    this.bag = {}; this.timers = new Set(); this.sel = null; this.busy = true; this.over = false;
    this.hist = []; this.uci = []; this.said = []; this.gen = 0;
    root.innerHTML = tableHTML(b);
    const q = id => $('#' + id, root);
    this.el = { board: q('board'), wrap: q('boardwrap'), fxl: q('fxl'), marks: q('marks'), promo: q('promo'), say: q('say'), bubble: q('bubble'), status: q('status'), moves: q('moves'),
      trayOpp: q('trayOpp'), trayMe: q('trayMe'), over: q('over'), resign: q('btnResign'), again: q('btnNew'), swQuick: q('swQuick'), swColor: q('swColor') };
    this.bindUI();
    window.__otb = this.handle();
  }

  /* ---- small things */
  wait(ms) { return new Promise(res => { const t = setTimeout(() => { this.timers.delete(t); res(); }, ms); this.timers.add(t); }); }
  later(fn, ms) { const t = setTimeout(() => { this.timers.delete(t); if (!this.dead) fn(); }, ms); this.timers.add(t); return t; }
  setStatus(t) { this.el.status.textContent = t; }

  handle() {
    const t = this;
    return {
      get ready() { return !!t.board && !!t.game; }, get busy() { return t.busy; }, get over() { return t.over; }, get result() { return t.result; },
      get fen() { return t.game ? t.game.fen() : null; }, get turn() { return t.game ? t.game.turn() : null; }, get color() { return t.color; },
      get boardFen() { return t.board ? t.board.getPosition() : null; }, get bubble() { return t.el.say.textContent; },
      get uci() { return [...t.uci]; }, get san() { return t.hist.map(m => m.san); }, get said() { return [...t.said]; }, being: t.b.id,
      load: fen => t.loadFen(fen),
      get fxRunning() { return t.el.fxl.querySelectorAll('.fx-piece').length > 0; },
    };
  }

  bindUI() {
    const e = this.el;
    e.resign.addEventListener('click', () => this.onResign());
    e.again.addEventListener('click', () => { if (!this.over && this.hist.length) { this.askAgain(); } else this.newGame(); });
    e.swQuick.addEventListener('click', () => { this.quick = !this.quick; store.set('quick', this.quick); this.paintToggles(); });
    e.swColor.addEventListener('click', () => {
      if (this.hist.length && !this.over) return;
      this.color = this.color === 'w' ? 'b' : 'w'; store.set('color', this.color); this.newGame();
    });
    // tap the board while a capture plays and it finishes at once
    e.wrap.addEventListener('pointerdown', () => { if (this.fxCur && this.fxCur.skip) this.fxCur.skip(); });
    this.onKey = ev => { if (ev.key === 'Escape' && !e.promo.hidden) this.cancelPromotion(); };
    addEventListener('keydown', this.onKey);
    this.paintToggles();
  }
  paintToggles() {
    const e = this.el;
    e.swQuick.setAttribute('aria-checked', String(this.quick));
    e.swColor.setAttribute('aria-checked', String(this.color === 'b'));
    e.swColor.lastElementChild.textContent = this.color === 'w' ? 'You play White' : 'You play Black';
    const locked = this.hist.length > 0 && !this.over;
    e.swColor.disabled = locked; e.swColor.title = locked ? 'You can switch sides when a game starts' : '';
  }
  askAgain() {
    const btn = this.el.again;
    if (btn.dataset.sure) { delete btn.dataset.sure; btn.textContent = 'New game'; return this.newGame(); }
    btn.dataset.sure = '1'; btn.textContent = 'Drop this game?';
    this.later(() => { delete btn.dataset.sure; btn.textContent = 'New game'; }, 3500);
  }

  /* ---- setting up */
  async start() {
    this.setStatus('Setting up the board…');
    try {
      const L = await loadLibs();
      if (this.dead) return;
      this.L = L; this.Chess = L.Chess;
      this.makeBoard(L);
      this.engine = new Engine();
      this.engineReady = this.engine.start();
      this.engineReady.catch(err => { if (!this.dead) { this.failed = true; this.fatal(err); } });
      this.newGame();
    } catch (err) { if (!this.dead) this.fatal(err); }
  }
  fatal(err) {
    console.warn('OVER THE BOARD could not start:', err && err.message);
    this.busy = true;
    this.say('The board’s parts come from the internet and they did not arrive. Check your connection, then try again.', 'error');
    this.setStatus('');
    if (!$('#otbRetry', this.root)) {
      this.el.bubble.insertAdjacentHTML('beforeend', '<button class="ghost" id="otbRetry" type="button">Try again</button>');
      // a module that failed to load stays failed until the page is loaded again, so trying again means reloading
      $('#otbRetry', this.root).addEventListener('click', () => location.reload());
    }
  }
  makeBoard(L) {
    const sprite = new URL('img/chess/pieces.svg', document.baseURI).href;
    this.board = new L.Chessboard(this.el.board, {
      position: L.FEN.start, orientation: this.color, assetsUrl: new URL('img/chess/', document.baseURI).href, assetsCache: true,
      style: { cssClass: 'ptu', showCoordinates: true, borderType: 'none', aspectRatio: 1, pieces: { type: 'svgSprite', file: sprite, tileSize: 40 }, animationDuration: 230 },
    });
    this.onInput = ev => this.input(ev);
  }
  armies() {
    const h = document.documentElement.style, me = this.color, them = me === 'w' ? 'b' : 'w';
    h.setProperty('--ac-' + them, this.b.color);       // the being's army wears the being's colour
    h.setProperty('--ac-' + me, HUMAN);                 // yours is always the site's orange
  }
  colors() { return { [this.color]: HUMAN, [this.color === 'w' ? 'b' : 'w']: this.b.color }; }

  async newGame() {
    this.gen++;
    this.over = false; this.result = null; this.busy = true; this.sel = null;
    this.hist = []; this.uci = []; this.said = []; this.startFen = null;
    this.game = new this.Chess();
    this.orient = this.color;
    this.armies();
    if (this.fxCur) { try { this.fxCur.cleanup(); } catch (e) { } this.fxCur = null; }
    $$('.fx-piece, .fx-star, .fx-ring, .fx-bit, .fx-slash, .fx-spark', this.el.fxl).forEach(n => n.remove());
    this.el.over.hidden = true; this.el.over.innerHTML = '';
    this.el.promo.hidden = true;
    this.el.again.textContent = 'New game'; delete this.el.again.dataset.sure;
    this.el.resign.textContent = 'Resign'; delete this.el.resign.dataset.sure;
    this.disableInput();
    if (this.board.getOrientation() !== this.color) await this.board.setOrientation(this.color, false);
    await this.board.setPosition(this.L.FEN.start, false);
    if (this.dead) return;
    this.brain = new Brain(this.b, this.engine, this.Chess);       // a fresh one each game, so a search still running from the last cannot touch it
    if (this.engine) this.engine.newGame();
    this.renderMoves(); this.renderTrays(); this.showMarks(); this.paintToggles();
    this.say(this.pick('greet'), 'greet');
    if (this.color === 'b') await this.beingTurn(); else this.humanTurn();
  }

  /* QA only (used by the tests, never by the game): set a position up and play on from it */
  async loadFen(fen) {
    this.gen++; this.sel = null; this.over = false; this.result = null;
    this.game = new this.Chess(fen); this.startFen = fen; this.hist = []; this.uci = [];
    this.el.over.hidden = true; this.el.promo.hidden = true;
    $$('.fx-piece, .fx-star, .fx-ring, .fx-bit, .fx-slash, .fx-spark', this.el.fxl).forEach(n => n.remove());
    await this.board.setPosition(fen, false);
    this.renderMoves(); this.renderTrays(); this.showMarks();
    if (this.game.turn() === this.color) this.humanTurn(); else await this.beingTurn();
  }

  /* ---- what the being says */
  pick(cat, vars = {}) {
    const lines = this.b.lines[cat];
    if (!lines || !lines.length) return '';
    let bag = this.bag[cat];
    if (!bag || !bag.length) {
      // a fresh bag: the lines it has not said since this table opened come first, so nothing repeats while an unsaid one is left
      const heard = this.heard || (this.heard = new Set());
      const all = lines.map((_, i) => i), fresh = all.filter(i => !heard.has(cat + ':' + i));
      bag = (fresh.length ? fresh : all).sort(() => Math.random() - 0.5);
      if (!fresh.length) all.forEach(i => heard.delete(cat + ':' + i));
      if (bag[0] === this.lastPicked?.[cat] && bag.length > 1) bag.push(bag.shift());
    }
    const i = bag.shift(); this.bag[cat] = bag;
    (this.lastPicked = this.lastPicked || {})[cat] = i;
    (this.heard || (this.heard = new Set())).add(cat + ':' + i);
    return lines[i].replace(/\{piece\}/g, vars.piece || 'piece');
  }
  /* which kind of thinking-aloud fits the moment: the opening, the endgame, winning, losing, or just thinking */
  thinkCat() {
    const L = this.b.lines, n = Math.floor(this.hist.length / 2) + 1;
    const cp = this.brain && this.brain.S ? this.brain.S.evalCp : 0;
    let pieces = 0; try { pieces = this.game.board().flat().filter(Boolean).length; } catch (e) { pieces = 32; }
    if (n <= 5 && L.open) return 'open';
    if ((pieces <= 10 || n >= 28) && L.late && Math.random() < 0.6) return 'late';
    if (cp >= 250 && L.ahead && Math.random() < 0.6) return 'ahead';
    if (cp <= -250 && L.behind && Math.random() < 0.6) return 'behind';
    return 'think';
  }
  say(text, kind = '') {
    if (!text) return;
    const e = this.el;
    e.say.textContent = text;
    e.bubble.dataset.kind = kind;
    e.bubble.classList.remove('pop', 'thinking'); void e.bubble.offsetWidth; e.bubble.classList.add('pop');
    const fc = $('.otb-talk .face', this.root); if (fc) { fc.classList.remove('bump'); void fc.offsetWidth; fc.classList.add('bump'); }
    this.said.push({ kind, text });
    this.sayAt = performance.now(); this.sayHold = Math.min(2600, 700 + 32 * text.length);     // long enough to read it
  }
  held() { return this.sayAt ? Math.max(0, this.sayHold - (performance.now() - this.sayAt)) : 0; }
  maybe(cat, p, vars) { if (Math.random() < p) { this.say(this.pick(cat, vars), cat); return true; } return false; }

  /* ---- turns */
  humanTurn() {
    if (this.dead || this.over) return;
    this.busy = false;
    this.setStatus(this.game.isCheck() ? 'Check. Your move.' : 'Your move.');
    this.paintToggles();
    this.enableInput();
  }
  enableInput() { this.disableInput(); try { this.board.enableMoveInput(this.onInput, this.color); } catch (e) { console.warn(e.message); } }
  disableInput() { try { this.board.disableMoveInput(); } catch (e) { } }

  input(ev) {
    const T = this.L.INPUT;
    if (ev.type === T.moveInputStarted) {
      if (this.busy || this.over || this.game.turn() !== this.color) return false;
      const mv = this.game.moves({ square: ev.squareFrom, verbose: true });
      if (!mv.length) return false;
      this.sel = { from: ev.squareFrom, moves: mv };
      this.showMarks();
      return true;
    }
    if (ev.type === T.validateMoveInput) {
      const sel = this.sel; this.sel = null; this.showMarks();
      if (!sel || sel.from !== ev.squareFrom) return false;
      const options = sel.moves.filter(m => m.to === ev.squareTo);
      if (!options.length) return false;
      const m0 = options[0];
      if (m0.promotion) { this.disableInputSoon(); this.later(() => this.askPromotion(options), 0); return false; }
      this.busy = true;
      const isCap = !!m0.captured;
      this.later(() => this.commit(m0, !isCap), 0);
      return !isCap;          // a quiet move is left to the board to carry out; a capture is staged by us
    }
    if (ev.type === T.moveInputCanceled) { this.sel = null; this.showMarks(); }
    return undefined;
  }
  disableInputSoon() { this.later(() => this.disableInput(), 0); }

  askPromotion(options) {
    const box = this.el.promo, c = this.color;
    box.innerHTML = `<div class="pm" role="group" aria-label="Promote to"><b>Promote to</b><div class="pm-row">${['q', 'r', 'b', 'n'].map(t => `<button type="button" data-p="${t}" aria-label="${PIECE_NAME[t]}"><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#${c}${t}"/></svg></button>`).join('')}</div><button class="pm-x ghost" type="button">Cancel</button></div>`;
    box.hidden = false;
    $$('[data-p]', box).forEach(btn => btn.addEventListener('click', () => {
      const m = options.find(o => o.promotion === btn.dataset.p) || options[0];
      box.hidden = true; this.busy = true; this.commit(m, false);
    }));
    $('.pm-x', box).addEventListener('click', () => this.cancelPromotion());
    const first = $('[data-p]', box); if (first) first.focus({ preventScroll: true });
  }
  cancelPromotion() { this.el.promo.hidden = true; if (!this.over) { this.busy = false; this.enableInput(); } }

  async commit(m, boardMoved) {
    if (this.dead || this.over) return;
    this.busy = true; this.disableInput();
    await this.applyMove(m, 'human', boardMoved);
    if (this.dead || this.over) return;
    await this.beingTurn();
  }

  async beingTurn() {
    const gen = this.gen;
    this.busy = true; this.disableInput();
    const nm = this.b.short || this.b.name;
    this.setStatus(`${nm} is thinking…`);
    this.paintToggles();
    const held = this.quick ? 0 : this.held();
    const talked = held <= 0 && this.hist.length > 0 && this.maybe(this.thinkCat(), (this.b.style.talk || 0.5) * 0.7);
    if (!talked) { if (held > 0) this.later(() => { if (this.busy && !this.over) this.el.bubble.classList.add('thinking'); }, held); else this.el.bubble.classList.add('thinking'); }
    const t0 = performance.now();
    let r;
    try { await this.engineReady; r = await this.brain.choose(this.game, this.uci, this.startFen); }
    catch (err) { if (this.dead || this.failed || gen !== this.gen) return; console.warn('Engine trouble, playing simply:', err && err.message); r = this.simpleMove(); }
    if (this.dead || gen !== this.gen || this.over) return;
    const need = this.quick ? 0 : Math.max(this.held(), (this.b.style.think || 800) - (performance.now() - t0));
    if (need) await this.wait(need);
    if (this.dead || gen !== this.gen || this.over) return;
    this.el.bubble.classList.remove('thinking');
    if (r.resign) return this.finish('resign');
    await this.applyMove(r.move, 'being', false, r);
    if (!this.over && !this.dead && gen === this.gen) this.humanTurn();
  }
  simpleMove() {
    const L = this.game.moves({ verbose: true });
    L.sort((a, b) => (VAL[b.captured] || 0) - (VAL[a.captured] || 0) || Math.random() - 0.5);
    return { move: L[0], kind: 'simple' };
  }

  /* ---- a move, on the board */
  hide(sq) { try { if (this.board.getPiece(sq)) this.board.view.setPieceVisibility(sq, false); } catch (e) { } }

  async applyMove(mv, who, boardMoved, r) {
    const g = this.game;
    const m = g.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
    this.hist.push(m); this.uci.push(m.from + m.to + (m.promotion || ''));
    const fen = g.fen();
    this.sel = null; this.showMarks(true);
    if (m.captured) {
      const ep = m.flags.includes('e');
      const victimSq = ep ? m.to[0] + m.from[1] : m.to;
      this.hide(m.from); this.hide(victimSq);
      const f = fx.capture(this.el.fxl, {
        orient: this.orient, from: m.from, to: m.to, victimSq, quick: this.quick, colors: this.colors(),
        attacker: { color: m.color, type: m.piece }, victim: { color: m.color === 'w' ? 'b' : 'w', type: m.captured },
      });
      this.fxCur = f;
      if (!calm() && navigator.vibrate) { try { navigator.vibrate(18); } catch (e) { } }
      await f.done;
      if (this.dead) return;
      await this.board.setPosition(fen, false);
      f.cleanup(); this.fxCur = null;
    } else {
      await this.board.setPosition(fen, !boardMoved || !this.quick);
    }
    if (this.dead) return;
    if (m.promotion) { const p = fx.promote(this.el.fxl, m.to, this.orient, m.color === this.color ? '#ffc857' : this.b.color, this.quick); p.done.then(() => p.cleanup()); }
    this.renderMoves(); this.renderTrays(); this.showMarks();
    this.afterMove(m, who, r);
  }

  afterMove(m, who, r) {
    const g = this.game;
    if (g.isGameOver()) {
      if (g.isCheckmate()) return this.finish(who === 'human' ? 'win' : 'loss');
      return this.finish('draw');
    }
    const talk = this.b.style.talk || 0.5;
    const check = g.isCheck();
    let spoke = false;
    const swing = who === 'being' && r ? (r.swing || 0) : 0;          // how much your last move changed its view: + is good for it
    if (who === 'being' && r && r.event) spoke = this.maybe('event', 1);
    if (!spoke && check) spoke = this.maybe(who === 'being' ? 'check' : 'checked', 0.85);
    if (!spoke && swing >= 200 && m.captured) spoke = this.maybe('blunder', 0.9, { piece: PIECE_NAME[m.captured] });
    if (!spoke && m.captured) {
      const big = m.captured === 'q' || m.captured === 'r';
      spoke = this.maybe(who === 'being' ? 'capture' : 'lose', Math.min(1, (big ? 1 : talk * 1.3)), { piece: PIECE_NAME[m.captured] });
    }
    if (!spoke && m.promotion) spoke = this.maybe(who === 'being' ? 'promo' : 'upromo', 1);
    if (!spoke && /^O-O/.test(m.san || '')) spoke = this.maybe(who === 'being' ? 'castled' : 'ucastle', 0.8);
    if (!spoke && swing >= 200) spoke = this.maybe('blunder', 0.8, { piece: 'piece' });
    if (!spoke && swing <= -150) spoke = this.maybe('good', 0.7);
    if (check) this.setStatus(who === 'being' ? 'Check.' : 'Your check.');
  }

  /* ---- marks on the board: last move, check, the piece you picked up and where it can go */
  showMarks(clear) {
    const g = this.game;
    if (!g || !this.orient) { this.el.marks.innerHTML = ''; return; }
    const at = (sq, cls) => { const p = fx.squareXY(sq, this.orient); return `<i class="mk ${cls}" style="left:${p.x * 12.5}%;top:${p.y * 12.5}%"></i>`; };
    const out = [];
    const last = this.hist[this.hist.length - 1];
    if (last && !clear) out.push(at(last.from, 'last'), at(last.to, 'last'));
    if (!clear && g.isCheck() && !g.isCheckmate()) { const k = this.kingOf(g.turn()); if (k) out.push(at(k, 'check')); }
    if (this.sel) {
      out.push(at(this.sel.from, 'sel'));
      [...new Set(this.sel.moves.map(m => m.to))].forEach(to => { const cap = this.sel.moves.some(m => m.to === to && (m.captured || m.flags.includes('e'))); out.push(at(to, cap ? 'cap' : 'dot')); });
    }
    this.el.marks.innerHTML = out.join('');
  }
  kingOf(color) { for (const row of this.game.board()) for (const s of row) if (s && s.type === 'k' && s.color === color) return s.square; return null; }

  /* ---- the strips and the move list */
  renderTrays() {
    const taken = { w: [], b: [] };           // pieces each colour has captured
    this.hist.forEach(m => { if (m.captured) taken[m.color].push(m.captured); });
    const score = c => taken[c].reduce((a, t) => a + VAL[t], 0);
    const adv = score(this.color) - score(this.color === 'w' ? 'b' : 'w');
    const html = (list, ofColor, plus) => [...list].sort((a, b) => VAL[b] - VAL[a]).map(t => `<svg viewBox="0 0 40 40" aria-hidden="true"><use href="#${ofColor}${t}"/></svg>`).join('') + (plus > 0 ? `<em>+${plus}</em>` : '');
    const me = this.color, them = me === 'w' ? 'b' : 'w';
    this.el.trayMe.innerHTML = html(taken[me], them, adv);
    this.el.trayOpp.innerHTML = html(taken[them], me, -adv);
  }
  renderMoves() {
    const out = [];
    for (let i = 0; i < this.hist.length; i += 2) out.push(`<li><span class="n">${i / 2 + 1}.</span><span>${esc(this.hist[i].san)}</span><span>${this.hist[i + 1] ? esc(this.hist[i + 1].san) : ''}</span></li>`);
    this.el.moves.innerHTML = out.join('');
    this.el.moves.scrollTop = this.el.moves.scrollHeight;
  }

  /* ---- the end */
  onResign() {
    if (this.over || !this.game) return;
    const btn = this.el.resign;
    if (!btn.dataset.sure) { btn.dataset.sure = '1'; btn.textContent = 'Really resign?'; this.later(() => { delete btn.dataset.sure; btn.textContent = 'Resign'; }, 3500); return; }
    delete btn.dataset.sure; btn.textContent = 'Resign';
    this.finish('human-resign');
  }

  async finish(kind) {
    if (this.over) return;
    this.over = true; this.busy = true; this.sel = null; this.gen++;
    this.disableInput(); this.el.promo.hidden = true; this.el.bubble.classList.remove('thinking');
    const b = this.b, g = this.game;
    const win = kind === 'win' || kind === 'resign';
    this.result = kind === 'draw' ? 'draw' : win ? 'win' : 'loss';
    const line = { win: 'lost', loss: 'win', resign: 'resign', 'human-resign': 'taken', draw: 'draw' }[kind];
    document.dispatchEvent(new CustomEvent('fv:sfx', { detail: win ? { planet: b.id, volume: 0.7 } : { kind: kind === 'draw' ? 'soft' : 'lose' } }));
    this.say(this.pick(line), line);
    // checkmate: the king goes over
    let down = null;
    if (kind === 'win' || kind === 'loss') {
      const loser = g.turn(), sq = this.kingOf(loser);
      if (sq) { this.hide(sq); down = fx.kingDown(this.el.fxl, sq, this.orient, loser, this.quick); this.fxCur = down; }
    }
    this.setStatus({ win: 'Checkmate. You win.', loss: 'Checkmate.', resign: `${b.short || b.name} resigned.`, 'human-resign': 'You resigned.', draw: this.drawWhy() }[kind]);
    this.paintToggles();
    let next = null;
    if (win) { PROG.add(b.id); next = BEINGS[b.n] || null; }
    if (down) await down.done;                      // the card comes when the king is down, not on a guess
    await this.wait(this.quick ? 250 : 650);
    if (this.dead) return;
    this.showOver(kind, next);
  }
  drawWhy() {
    const g = this.game;
    return g.isStalemate() ? 'Stalemate. A draw.' : g.isThreefoldRepetition() ? 'Same position three times. A draw.' : g.isInsufficientMaterial() ? 'Not enough pieces left. A draw.' : 'Fifty moves with nothing happening. A draw.';
  }
  showOver(kind, next) {
    const b = this.b, win = kind === 'win' || kind === 'resign';
    const title = win ? `You beat ${b.name}.` : kind === 'draw' ? 'A draw.' : kind === 'human-resign' ? 'You resigned.' : `${b.name} wins.`;
    const why = { win: 'Checkmate.', resign: `${b.name} resigned.`, loss: 'Checkmate.', 'human-resign': `${b.short || b.name} takes it.`, draw: this.drawWhy() }[kind];
    let nextHTML = '';
    if (win && next) nextHTML = `<div class="nx"><img src="${next.face}" alt="" width="360" height="351"><p><span>Next up</span><b>${esc(next.name)}</b><small>${esc(next.species)} · ${esc(next.planet)}</small></p></div>`;
    else if (win) nextHTML = '<p class="all">That is all thirteen. Nobody is left to sit down across from you.</p>';
    this.el.over.innerHTML = `<div class="ov-card" data-kind="${kind}"><span class="kicker">${win ? 'Unlocked' : 'Game over'}</span><h2 id="overTitle">${esc(title)}</h2><p>${esc(why)}</p>${nextHTML}
      <div class="btns">${win && next ? `<a class="cta" id="ovNext" href="${LADDER}/${next.id}">Face ${esc(next.short || next.name)}</a>` : ''}
      <button class="ghost" id="ovAgain" type="button">${win ? 'Play again' : 'Rematch'}</button><a class="ghost" href="${LADDER}">All thirteen</a></div></div>`;
    this.el.over.hidden = false;
    $('#ovAgain', this.el.over).addEventListener('click', () => this.newGame());
    const f = $('#ovNext', this.el.over) || $('#ovAgain', this.el.over); if (f) f.focus({ preventScroll: true });
    // on a phone the card sits under the board: bring it into view
    const r = this.el.over.getBoundingClientRect();
    if (r.bottom > innerHeight || r.top < 0) this.el.over.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }

  /* ---- leaving */
  destroy() {
    this.dead = true;
    this.timers.forEach(t => clearTimeout(t)); this.timers.clear();
    removeEventListener('keydown', this.onKey);
    try { if (this.fxCur) this.fxCur.cleanup(); } catch (e) { }
    try { this.disableInput(); } catch (e) { }
    try { this.engine && this.engine.terminate(); } catch (e) { }
    try { this.board && this.board.destroy(); } catch (e) { }
    const h = document.documentElement.style; h.removeProperty('--ac-w'); h.removeProperty('--ac-b');
    document.querySelectorAll('.cm-chessboard-draggable-piece').forEach(n => n.remove());
    if (window.__otb && window.__otb.being === this.b.id) delete window.__otb;
  }
}

/* ------------------------------------------------------------------ the route: #/games/over-the-board[/being] */
export function mount(root, beingId) {
  const b = beingId ? BY_ID[beingId] : null;
  if (beingId && !b) { location.replace(LADDER); return () => { }; }
  if (!b) return mountLadder(root);
  if (!PROG.unlocked(b)) { location.replace(LADDER); return () => { }; }
  const t = new Table(root, b);
  t.start();
  return () => t.destroy();
}
