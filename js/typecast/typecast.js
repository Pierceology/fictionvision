/* TYPECAST: type what the beings say, as fast as you can, while they say worse things about your typing.
   The Transcribosaurus lineage (Pierce's Wishbones patch: a typing test where a T-rex roars at every typo), moved into the
   same frame as the other games: the thirteen beings, one at a time, each one's lines from OVER THE BOARD as the copy.
   A round is three of the being's lines. The clock starts on your first key. A wrong key flashes and the being reacts.
   Finish a round at 85 percent or better and the next being opens. Each being has a speed of its own to beat. */
import { BEINGS, BY_ID } from '../chess/beings.js';
import { LINES } from '../chess/lines.js';

export const HOME = '#/games/typecast';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.typecast.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.typecast.' + k, JSON.stringify(v)); } catch (e) { } },
};
const PROG = {
  done() { return new Set(store.get('done', [])); },
  add(id) { const s = this.done(); s.add(id); store.set('done', [...s]); },
  best(id) { return (store.get('best', {}) || {})[id] || null; },
  setBest(id, rec) { const b = store.get('best', {}) || {}; if (!b[id] || rec.wpm > b[id].wpm) { b[id] = rec; store.set('best', b); return true; } return false; },
  preview() { return !!store.get('preview', false); },
  unlocked(b) { return this.preview() || b.n === 1 || this.done().has(BEINGS[b.n - 2].id); },
  next() { const s = this.done(); return BEINGS.find(b => !s.has(b.id) && this.unlocked(b)) || null; },
};
/* the being's own speed, words a minute, the one to beat */
const HOUSE = [28, 32, 24, 48, 44, 36, 40, 30, 46, 38, 42, 52, 60];
const TAGS = {
  'planet-zee': 'Slow sentences. He is in no hurry. You should be.', 'yaaarghs-revenge': 'Pirate spelling. Ye have been warned.', 'oogh-iv': 'Short words. Lots of Zug.',
  'prearth': 'Fast lines. He roars at typos. Literally.', 'that-other-planet': 'Long words, billed per letter.', 'figuria': 'Snap-fit sentences. Mind the hinges.',
  'dens-crevice': 'Every line is a boast. Type it like you mean it.', 'heliumdrum': 'Gentle lines. Press softly.', 'washy-washy-ii': 'Street talk. Keep your guard up.',
  'yarnia': 'Dear, love, sweetheart. All of them.', 'hungary': 'Food words, going stale as you type.', 'guffaw-7': 'Setups and punchlines. Timing counts.', 'spee-ider-grove': 'The fast one. Eight legs on the keys.',
};
const V = {
  'planet-zee': { greet: ['Type what I say. Slowly is fine. Slowly is everything here.'], typo: ['A mistake. Filed.', 'That key was wrong. It will stay wrong, in the file.', 'Wrong. Take a number, and the right key.'], slow: ['Still typing. Most people stop. I respect either.'], win: ['Typed. Stamped. Filed. Next.'], fast: ['Faster than me. I type with one finger, over decades.'], locked: ['Not yet. Finish mine.'], next: ['Go on. The next one talks faster.'] },
  'yaaarghs-revenge': { greet: ['Type me words. They were somebody else\'s first.'], typo: ['Ye missed. I copy that too.', 'Wrong key. Even I would not steal that one.', 'Ach. A typo. Salvage it.'], slow: ['Still at it? I would have copied a finished page.'], win: ['Typed. I will be stealin that speed.'], fast: ['Faster than me. Suspicious. Did ye copy someone?'], locked: ['Locked. Mine first.'], next: ['Off ye go. The next one spells worse.'] },
  'oogh-iv': { greet: ['Zug words. You type. Zug watch.'], typo: ['Wrong rock.', 'No. Other key.', 'Zug saw that. Zug not tell.'], slow: ['Long time. Zug find snack.'], win: ['Done! You type Zug words! Zug proud.'], fast: ['Faster than Zug. Zug use one finger. Still.'], locked: ['No. Zug first.'], next: ['Go next. Next being use big words.'] },
  'prearth': { greet: ['My lines. Fast. The sky is falling, type like it.'], typo: ['RAWR. Wrong key.', 'The sky heard that typo.', 'Claws on the keys. Again.'], slow: ['The rock is closer than your last word.'], win: ['Typed. Before the rock. Loud.'], fast: ['Faster than me, and I have claws. Respect.'], locked: ['Not yet. Mine first.'], next: ['Go. Keep the beat.'] },
  'that-other-planet': { greet: ['Transcription services. Billed per keystroke, including the wrong ones.'], typo: ['Error logged. Billed.', 'Incorrect key. Surcharge applied.', 'Deviation. Noted on the invoice.'], slow: ['Elapsed time is billable.'], win: ['Transcription complete. Invoice attached.'], fast: ['Faster than Unit 7. Recalculating rates.'], locked: ['Sequential access only.'], next: ['Proceed. Rates increase.'] },
  'figuria': { greet: ['Type the lines. Snap them in, one key at a time.'], typo: ['That one did not fit.', 'Wrong part. Back in the pile.', 'Loose key. Try again.'], slow: ['Still building. Missing a part, I think.'], win: ['Typed. Clean build.'], fast: ['Faster than me. I was looking for my arm.'], locked: ['Still in the box.'], next: ['Go on. More parts next.'] },
  'dens-crevice': { greet: ['Type my words. Carefully. They are magnificent.'], typo: ['Wrong. The fire noticed.', 'A typo, in MY line? Burn it.', 'Again. Properly.'], slow: ['The cave is patient. I am not.'], win: ['Typed. Applause is customary.'], fast: ['Faster than a dragon. Tell no one.'], locked: ['Sealed. Mine first.'], next: ['Go. The next cave is softer.'] },
  'heliumdrum': { greet: ['Type my lines. Softly. The keys are sharp if you press hard.'], typo: ['Oh. Wrong key. That\'s all right.', 'Eek. A typo. Gently, next time.', 'Oops. Not that one. Breathe.'], slow: ['Still floating along. That\'s fine.'], win: ['Typed. Nobody popped. Lovely.'], fast: ['Faster than me. I drift, you know.'], locked: ['Closed. Mine first. Gently.'], next: ['Off you go. Mind the needles.'] },
  'washy-washy-ii': { greet: ['Type what I say. The Wall is watching your hands.'], typo: ['Wrong. Ledgered.', 'Missed. Chin down.', 'Typo. The Wall saw.'], slow: ['Still typing. The back room is comfy, is it.'], win: ['Typed. Clean. The Wall spells your name right.'], fast: ['Faster than me. Hm. Respect.'], locked: ['Locked. One room at a time.'], next: ['Go on. The next room types meaner.'] },
  'yarnia': { greet: ['Type my words, dear. Even stitches.'], typo: ['A dropped stitch, dear.', 'Wrong key, love. I will remember it.', 'Oh dear. Unpick that.'], slow: ['Patience, love. I have plenty.'], win: ['Typed, dear. Cast off. Lovely.'], fast: ['Faster than me, dear. I was counting.'], locked: ['Tied off. Mine first.'], next: ['Go on, dear. Tighter next.'] },
  'hungary': { greet: ['Type my lines before they go stale.'], typo: ['Wrong key. Crumbs.', 'Missed. Still fresh. Barely.', 'Typo. Getting stale.'], slow: ['The oven is off. Hurry.'], win: ['Typed. Fresh to the end.'], fast: ['Faster than me. I am a snack and you beat me.'], locked: ['In the oven. Mine first.'], next: ['Go on. Spicier next.'] },
  'guffaw-7': { greet: ['Type the bit. Timing counts. Nobody laughs at a typo.'], typo: ['Typo. Tough room.', 'Wrong key. The room noticed.', 'Missed. Hold for silence.'], slow: ['Still typing. Bombing, beautifully.'], win: ['Typed. Thank you, drive safe.'], fast: ['Faster than me. Somebody laughed. It was me.'], locked: ['Dark tonight. Mine first.'], next: ['Go on. Tougher room next.'] },
  'spee-ider-grove': { greet: ['Type fast. Eight legs, remember. I will know.'], typo: ['Wrong thread.', 'Missed. The web shivered.', 'Typo. Plot twist.'], slow: ['The web tightens, you know.'], win: ['Typed. You pulled the right threads.'], fast: ['Faster than eight legs. Hm.'], locked: ['Wrapped. Mine first.'], next: ['That was the last one. Sit down and play me at chess.'] },
};

const meter = n => `<span class="lv" role="img" aria-label="Round ${n} of 13">${BEINGS.map((_, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('')}</span>`;
function ladderHTML() {
  const done = PROG.done(), nxt = PROG.next();
  const count = BEINGS.filter(b => done.has(b.id)).length;
  const prog = count === 13 ? 'All thirteen typed. Your fingers have been to every planet.' : count === 0 ? `Nobody typed yet. ${BEINGS[0].name} goes first.` : `${count} of 13 typed.${nxt ? ` Next: ${nxt.name}.` : ''}`;
  const card = b => {
    const did = done.has(b.id), open = PROG.unlocked(b), isNext = nxt && nxt.id === b.id, best = PROG.best(b.id);
    const cls = did ? 'is-beaten' : isNext ? 'is-next' : open ? 'is-open' : 'is-locked';
    const status = did && best ? `${best.wpm} words a minute · ${best.acc}%` : isNext ? 'Your turn to type' : open ? 'Open' : `Type ${BEINGS[b.n - 2].name} first`;
    const inner = `<span class="face"><img src="${b.face}" alt="" width="360" height="351" loading="lazy" decoding="async" draggable="false"></span>
      <span class="no">${b.n}</span><b class="nm">${esc(b.name)}</b><span class="sp">${esc(b.species)} · ${esc(b.planet)}</span><span class="tg">${esc(TAGS[b.id] || '')}</span>${meter(b.n)}
      <span class="st">${did ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : ''}${esc(status)}</span>`;
    return open ? `<a class="otb-card ${cls}" href="${HOME}/${b.id}" style="--bc:${b.color}">${inner}</a>` : `<div class="otb-card ${cls}" aria-disabled="true" style="--bc:${b.color}">${inner}</div>`;
  };
  return `<div class="page otb-page tc-page">
    <p class="crumbs"><a href="#/games">Games</a><span aria-hidden="true">/</span>TYPECAST</p>
    <div class="page-head"><span class="kicker">Game</span><h1>TYPECAST</h1>
      <p>Type what the beings say, as fast as you can, while they say worse things about your typing. Three lines a round, the clock starts on your first key, a wrong key flashes. Keep it at 85 percent and the next being opens. Each one has a speed to beat.</p>
      <p class="otb-prog">${esc(prog)}</p></div>
    <div class="otb-ladder">${BEINGS.map(card).join('')}</div>
    <div class="otb-foot"><button class="otb-preview" type="button" role="switch" aria-checked="${PROG.preview()}" id="tcPreview"><span class="knob" aria-hidden="true"></span><span>Preview mode: open all thirteen</span></button>
      <details class="otb-credits"><summary>Credits</summary><div class="cr-in"><p>Made for FictionVision, after Transcribosaurus, Pierce's typing test where a T-rex roared at every typo. The lines are the beings' own, from OVER THE BOARD.</p></div></details></div></div>`;
}
function mountLadder(root) { const paint = () => { root.innerHTML = ladderHTML(); $('#tcPreview', root).addEventListener('click', () => { store.set('preview', !PROG.preview()); paint(); }); }; paint(); return () => { }; }

function tableHTML(b) {
  return `<div class="page otb-page otb-table tc-table" style="--bc:${b.color}">
    <div class="otb-head"><a class="back" href="${HOME}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>All thirteen</span></a><span class="lvl">${b.n} of 13 · ${esc(b.species)}</span></div>
    <div class="otb-grid">
      <section class="otb-talk" aria-label="${esc(b.name)}"><div class="face"><img src="${b.face}" alt="${esc(b.name)}" width="360" height="351" decoding="async"></div>
        <div class="bubble" id="bubble"><span class="who">${esc(b.name)}</span><p id="say" aria-live="polite"></p><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div></section>
      <section class="otb-boardcol">
        <div class="otb-strip opp"><span class="who">${esc(b.short || b.name)}</span><span class="tray tc-round" id="round">Line 1 of 3</span></div>
        <div class="otb-boardwrap tc-stage" id="stage"><div class="tc-line" id="line" aria-label="The line to type"></div>
          <input class="tc-in" id="inp" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Type the line here" placeholder="Tap here and type the line">
          <div class="tc-gate" id="gate"><span class="kicker">${esc(b.planet)}</span><b>Three lines. Your first key starts the clock.</b><button class="cta" type="button" id="btnStart">Start typing</button></div></div>
        <div class="otb-strip me"><span class="who">You</span><span class="de-clock" id="clock">0:00.0</span><span class="ip-moves" id="stats">0 wpm · 100%</span><span class="status" id="status" role="status"></span></div>
      </section>
      <aside class="otb-side"><div class="meta"><b>${esc(b.name)}</b><span>${esc(b.species)} · ${esc(b.planet)}</span><span class="tg">${esc(TAGS[b.id] || '')}</span></div>
        <dl class="de-times" id="times"></dl>
        <div class="actions"><button class="ghost" type="button" id="btnAgain">New lines</button></div></aside>
      <div class="otb-over" id="over" hidden role="region" aria-labelledby="overTitle"></div>
    </div></div>`;
}

class Table {
  constructor(root, b) {
    this.root = root; this.b = b; this.dead = false; this.timers = new Set(); this.bag = {}; this.said = [];
    root.innerHTML = tableHTML(b);
    const q = id => $('#' + id, root);
    this.el = { line: q('line'), inp: q('inp'), gate: q('gate'), start: q('btnStart'), round: q('round'), clock: q('clock'), stats: q('stats'), status: q('status'), say: q('say'), bubble: q('bubble'), over: q('over'), times: q('times'), again: q('btnAgain'), stage: q('stage') };
    this.paintTimes(); this.bind(); this.say('greet');
    document.title = `TYPECAST · ${b.name} · FictionVision`;
    window.__tc = this.handle();
  }
  later(fn, ms) { const t = setTimeout(() => { this.timers.delete(t); if (!this.dead) fn(); }, ms); this.timers.add(t); return t; }
  pick(kind) { const L = (V[this.b.id] || {})[kind]; if (!L || !L.length) return ''; let bag = this.bag[kind]; if (!bag || !bag.length) bag = L.map((_, i) => i).sort(() => Math.random() - 0.5); const i = bag.shift(); this.bag[kind] = bag; return L[i]; }
  say(kind) { const t = this.pick(kind); if (!t) return; const e = this.el; e.say.textContent = t; e.bubble.dataset.kind = kind; e.bubble.classList.remove('pop'); void e.bubble.offsetWidth; e.bubble.classList.add('pop'); const fc = $('.otb-talk .face', this.root); if (fc) { fc.classList.remove('bump'); void fc.offsetWidth; fc.classList.add('bump'); } this.said.push({ kind, text: t }); }
  paintTimes() { const best = PROG.best(this.b.id); this.el.times.innerHTML = `<div><dt>${esc(this.b.short || this.b.name)}'s speed</dt><dd>${HOUSE[this.b.n - 1]} wpm</dd></div><div><dt>Your best</dt><dd>${best ? `${best.wpm} wpm · ${best.acc}%` : 'Not yet'}</dd></div>`; }
  /* three lines from the being's own pool, {piece} filled, no two alike */
  lines() {
    const L = LINES[this.b.id] || {}; const pool = [];
    ['greet', 'think', 'capture', 'lose', 'check', 'open', 'late', 'ahead', 'behind', 'good', 'win'].forEach(k => (L[k] || []).forEach(s => pool.push(s)));
    const pieces = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
    const out = []; const used = new Set();
    while (out.length < 3 && used.size < pool.length) { const i = Math.floor(Math.random() * pool.length); if (used.has(i)) continue; used.add(i); out.push(pool[i].replace(/\{piece\}/g, pieces[Math.floor(Math.random() * pieces.length)])); }
    return out;
  }
  reset() {
    this.set = this.lines(); this.k = 0; this.pos = 0; this.typed = 0; this.errors = 0; this.t0 = 0; this.over = false; this.slowSaid = false; this.lastTypo = 0;
    this.el.inp.value = ''; this.el.clock.textContent = '0:00.0'; this.el.stats.textContent = '0 wpm · 100%'; this.el.status.textContent = '';
    this.paintLine();
  }
  paintLine() {
    const s = this.set[this.k] || ''; const p = this.pos;
    this.el.round.textContent = `Line ${Math.min(this.k + 1, 3)} of 3`;
    this.el.line.innerHTML = `<span class="done">${esc(s.slice(0, p))}</span><span class="cur">${esc(s[p] || '')}</span><span class="rest">${esc(s.slice(p + 1))}</span>`;
  }
  bind() {
    const e = this.el;
    e.start.addEventListener('click', () => { e.gate.hidden = true; this.reset(); e.inp.focus(); });
    e.again.addEventListener('click', () => { e.over.hidden = true; e.gate.hidden = true; this.reset(); this.say('greet'); e.inp.focus(); });
    e.inp.addEventListener('beforeinput', ev => {
      if (this.over || e.gate.hidden === false) return;
      if (ev.inputType !== 'insertText' || !ev.data) { ev.preventDefault(); return; }
      ev.preventDefault();
      const s = this.set[this.k]; if (!s) return;
      if (!this.t0) { this.t0 = performance.now(); this.tick(); }
      for (const ch of ev.data) {
        if (ch === s[this.pos]) { this.pos++; this.typed++; }
        else { this.errors++; this.typed++; this.flash(); const now = performance.now(); if (now - this.lastTypo > 2600) { this.lastTypo = now; this.say('typo'); } }
      }
      if (this.pos >= s.length) { this.k++; this.pos = 0; if (this.k >= 3) return this.finish(); }
      this.paintLine(); this.paintStats();
    });
    e.inp.addEventListener('keydown', ev => { if (ev.key === 'Backspace' || ev.key === 'Enter') ev.preventDefault(); });
    e.stage.addEventListener('click', () => { if (e.gate.hidden) e.inp.focus(); });
  }
  flash() { const s = this.el.stage; s.classList.remove('err'); void s.offsetWidth; s.classList.add('err'); }
  paintStats() { const min = Math.max(0.001, (performance.now() - this.t0) / 60000), wpm = Math.round((this.pos + this.set.slice(0, this.k).join('').length) / 5 / min), acc = this.typed ? Math.round(100 * (this.typed - this.errors) / this.typed) : 100; this.el.stats.textContent = `${isFinite(wpm) ? wpm : 0} wpm · ${acc}%`; }
  tick() { if (this.dead || this.over || !this.t0) return; const ms = performance.now() - this.t0; this.el.clock.textContent = Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0') + '.' + Math.floor((ms % 1000) / 100); if (!this.slowSaid && ms > 40000) { this.slowSaid = true; this.say('slow'); } this.raf = requestAnimationFrame(() => this.tick()); }
  finish() {
    this.over = true; cancelAnimationFrame(this.raf);
    const ms = performance.now() - this.t0, chars = this.set.join('').length, wpm = Math.round(chars / 5 / (ms / 60000)), acc = this.typed ? Math.round(100 * (this.typed - this.errors) / this.typed) : 100;
    const b = this.b, house = HOUSE[b.n - 1], counts = acc >= 85, fast = counts && wpm > house;
    document.dispatchEvent(new CustomEvent('fv:sfx', { detail: counts ? { planet: b.id, volume: 0.7 } : { kind: 'lose' } }));
    let improved = false; if (counts) { improved = PROG.setBest(b.id, { wpm, acc }); PROG.add(b.id); }
    this.paintTimes(); this.paintStats(); this.el.inp.blur();
    this.say(fast ? 'fast' : counts ? 'win' : 'typo');
    const next = BEINGS[b.n] || null;
    const why = counts ? `${wpm} words a minute at ${acc}%.${fast ? ` Faster than ${b.short || b.name}'s ${house}.` : ` ${b.short || b.name} does ${house}.`}${improved ? ' Your best.' : ''}` : `${wpm} words a minute at ${acc}%. Under 85, so it does not count. New lines, and slow down a touch.`;
    let nextHTML = '';
    if (counts && next) nextHTML = `<div class="nx"><img src="${next.face}" alt="" width="360" height="351"><p><span>Next up</span><b>${esc(next.name)}</b><small>${esc(next.species)} · ${esc(next.planet)}</small></p></div>`;
    else if (counts) nextHTML = '<p class="all">That is all thirteen. The beings have nothing left to dictate.</p>';
    this.el.over.innerHTML = `<div class="ov-card" data-kind="${counts ? 'win' : 'loss'}"><span class="kicker">${counts ? 'Typed' : 'Not yet'}</span><h2 id="overTitle">${counts ? `You kept up with ${esc(b.name)}.` : `${esc(b.short || b.name)} lost you.`}</h2><p>${esc(why)}</p>${nextHTML}
      <div class="btns">${counts && next ? `<a class="cta" href="${HOME}/${next.id}">Type ${esc(next.short || next.name)}</a>` : ''}<button class="ghost" id="ovAgain" type="button">New lines</button><a class="ghost" href="${HOME}">All thirteen</a></div></div>`;
    this.el.over.hidden = false;
    $('#ovAgain', this.el.over).addEventListener('click', () => this.el.again.click());
    const r = this.el.over.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) this.el.over.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }
  handle() { const t = this; return { get being() { return t.b.id; }, get set() { return [...(t.set || [])]; }, get over() { return t.over; }, get bubble() { return t.el.say.textContent; }, get said() { return [...t.said]; }, start() { t.el.start.click(); }, type(s) { t.el.inp.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: s, bubbles: true, cancelable: true })); } }; }
  destroy() { this.dead = true; cancelAnimationFrame(this.raf); this.timers.forEach(t => clearTimeout(t)); if (window.__tc) delete window.__tc; }
}

export function mount(root, slug) {
  const b = slug ? BY_ID[slug] : null;
  if (slug && !b) { location.replace(HOME); return () => { }; }
  if (!b) return mountLadder(root);
  if (!PROG.unlocked(b)) { location.replace(HOME); return () => { }; }
  const t = new Table(root, b); return () => t.destroy();
}
