/* Clippo. A knockoff of the paperclip, bent, with eyes, who makes sure you click things (Pierce, 2026-10-08: "we need to make sure
   they click things ... a pocket pierce but helped them understand it all, more like the style of the assistant in High on Life").
   He talks like the guns in that game: needy, loud, honest, on your side whether you like it or not. PG. Never scary.
   Rules that keep him from being the thing everybody hates:
     one tip at a time, never two inside thirty seconds, each tip once per device, three dismissals in a row and he goes quiet
     for the rest of the visit (a small clip stays in the corner; tap it and he is back). Nothing he says is needed to use the site. */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.clippo.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.clippo.' + k, JSON.stringify(v)); } catch (e) { } },
};

/* what he says, and when. Each key fires once per device. {n} is the number of things on your list. */
const TIPS = {
  arrive: ["Hey. Hey. Hi. I'm Clippo. Not that one. Legally different. Those posters move. Click one. I'll wait. I won't wait."],
  idle: ["Still here? Me too. I have no choice. You do. Click something.", "You've been staring for a while. The posters can tell."],
  title: ["See that button, I'd watch this? That's the whole site. Click it, or admit you wouldn't.", "Somebody wrote this in their own words. The least you can do is press the orange button."],
  watch1: ["THERE it is. That click just made somebody's day in Nebraska. Do it again on something worse."],
  watch3: ["Three on your list. You have taste. Questionable, but taste. The Trophy Room keeps score of this stuff."],
  games: ["Three games. The beings will talk your ear off. Start with the chess, lose, come back. I'll be here."],
  maze: ["Arrow keys. Or the pad. Don't press Solve, he'll never let you live it down."],
  puzzle: ["Tap two pieces to swap them. The right ones lock. Hint shows numbers for five seconds. I'd use it. Nobody's watching. I'm watching."],
  chess: ["He talks while he thinks. He thinks while you talk. Castle early. I don't know what that means but people say it."],
  trophies: ["Turn a card over. Tilt your phone. On a desk, wiggle the mouse like you mean it. The lasers follow."],
  music: ["Thirteen stations. One per planet. The speaker button turns the sound on. Nothing here plays sound until you ask. House rule."],
  submit: ["Type it the way you'd say it across a counter. I'm not reading it anyway. A buyer is."],
  search: ["Searching? Type spatulas. Trust me."],
  secret: ["You found a secret. I'm legally required to act impressed. Wow. Wow."],
  award: ["You saved an idea. That's a sticker. One Hit Wonder. It's real, it's in the Trophy Room, and it has your name on it in spirit."],
  ptu: ["Welcome to the Pool Table Universe. Thirteen planets, one cruise ship, a radio station in a volcano. Pick a planet. Any planet. Zee is easiest."],
  ideas: ["This is all of them. Every one belongs to the person who had it. Click a poster, read it, press the button if you'd watch it. That's the job."],
};
/* what you haven't done yet. Clippo keeps the list of things worth doing here, checks each one against what this device has done
   (the site's own storage, plus what he sees you open), and points at the first one left: the thing you haven't done on the page you
   are on first, then the best thing elsewhere, with a button that takes you there. Each nudge at most once a visit; never again once
   it is done. Tap the clip for the whole list. (Pierce, 2026-10-08: "tell you what to do based on what you haven't done yet"). */
const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsj = (k, d) => { try { const v = ls(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const anyKey = pre => { try { for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i).startsWith(pre)) return true; } catch (e) { } return false; };
const doneSet = () => new Set(store.get('done', []));
const markDone = k => { const d = doneSet(); if (!d.has(k)) { d.add(k); store.set('done', [...d]); } };
const sessGet = k => { try { return JSON.parse(sessionStorage.getItem('fv.clippo.' + k) || 'null'); } catch (e) { return null; } };
const sessSet = (k, v) => { try { sessionStorage.setItem('fv.clippo.' + k, JSON.stringify(v)); } catch (e) { } };
const onPlanet = () => (location.hash.split('/')[2] || '');
const NEXT = [
  { key: 'poster', label: 'Open a poster', on: ['home', 'ideas', 'ptu', 'tfrta', 'list', 'music'], test: () => doneSet().has('title') || lsj('fv.list', []).length > 0 || lsj('fv.ptuSeen', []).some(x => x !== 'hub' && !String(x).startsWith('planet:')), say: "Click a poster. Any poster. They open. That's the whole trick, and you haven't done it yet.", go: '#/ideas', goLabel: 'Show me' },
  { key: 'watch', label: "Press I'd watch this on one", on: ['t'], test: () => lsj('fv.list', []).length > 0, say: "The orange button. I'd watch this. Somebody wrote this in their own words; press it if you would. You haven't pressed one yet.", go: '#/ideas', goLabel: 'Find one' },
  { key: 'preview', label: 'Watch a preview', on: ['t'], when: () => !!document.getElementById('prev'), test: () => doneSet().has('preview'), say: "This one has a preview. Watch the preview. SOLACE paid for the plate in front of it, the least you can do is sit through two seconds." },
  { key: 'sound', label: 'Turn the sound on', on: ['any'], test: () => ls('fv.sfx') === '1', say: "Nothing here makes a sound until you ask. The speaker, top right. Ask." },
  { key: 'planet', label: 'Stand on a planet', on: ['home', 'ideas', 'music', 'tfrta', 't', 'list', 'trophies'], test: () => doneSet().has('planet') || lsj('fv.ptuSeen', []).some(x => String(x).startsWith('planet:')), say: "Thirteen planets and a cruise ship, and you've stood on none of them. Zee is easiest. Figuria is weirder.", go: '#/ptu/planet-zee', goLabel: 'Take me to Zee' },
  { key: 'solace', label: 'Ride SOLACE to a planet', on: ['ptu', 't'], when: () => !!onPlanet() || page() === 't', test: () => doneSet().has('rode'), say: "Go to another planet from here and SOLACE takes you. The doors open on the deck. Beat them to it.", go: () => onPlanet() === 'figuria' ? '#/ptu/planet-zee' : '#/ptu/figuria', goLabel: 'Next stop' },
  { key: 'show', label: 'Watch the Asteroid Show', on: ['ptu', 'home', 'games', 'music', 'tfrta'], test: () => doneSet().has('show'), say: "The Asteroid Show. Thirteen skies, the rocks fly to the music, you can drag the planet around. You haven't. Go.", go: () => onPlanet() ? '#/show/' + onPlanet() : '#/show', goLabel: 'Open the show' },
  { key: 'tfrta', label: 'Read a TFRTA post', on: ['ptu', 't', 'home', 'ideas'], test: () => doneSet().has('post'), say: "Rick wrote thirty-nine travel posts and then reviewed his own writing. Read one. He'd want you to. He'd say he wouldn't.", go: '#/tfrta', goLabel: 'Read one' },
  { key: 'radio', label: 'Play PTU Radio', on: ['music', 'ptu', 'home'], test: () => doneSet().has('radio'), say: "PTU Radio. Thirteen stations, one per planet, one of them inside a volcano. Press play on something.", go: '#/music', goLabel: 'Tune in' },
  { key: 'chess', label: 'Play Over the Board', on: ['games', 'home'], test: () => anyKey('fv.chess.') || doneSet().has('g:' + 'over-the-board'), say: "The chess. He talks while he thinks. Lose once, come back. Everybody loses once.", go: '#/games/over-the-board', goLabel: 'Sit down' },
  { key: 'maze', label: 'Play Dead Ends', on: ['games', 'home'], test: () => anyKey('fv.maze.') || doneSet().has('g:dead-ends'), say: "Dead Ends. A maze with opinions. Arrow keys or the pad. Don't press Solve.", go: '#/games/dead-ends', goLabel: 'Get lost' },
  { key: 'puzzle', label: 'Play In Pieces', on: ['games', 'home'], test: () => anyKey('fv.puzzle.') || doneSet().has('g:in-pieces'), say: "In Pieces. Tap two pieces, they swap, the right ones lock. You haven't locked one.", go: '#/games/in-pieces', goLabel: 'Start one' },
  { key: 'typecast', label: 'Play Typecast', on: ['games', 'home'], test: () => anyKey('fv.typecast.') || doneSet().has('g:typecast'), say: "Typecast. You type, the beings judge. They judge anyway; you might as well type.", go: '#/games/typecast', goLabel: 'Type' },
  { key: 'planetgame', label: 'Play Name That Planet', on: ['games', 'home'], test: () => anyKey('fv.planet.') || doneSet().has('g:name-that-planet'), say: "Name That Planet. Thirteen of them, and you'd get maybe four. Prove me wrong. It's in Games.", go: '#/games/name-that-planet', goLabel: 'Play it' },
  { key: 'bean', label: 'Order a coffee at Brain Bean', on: ['games', 'home', 'ptu'], test: () => lsj('fv.bean.orders', 0) > 0, say: "Brain Bean Coffee. One in a hundred gets the coffee. Pam almost hands it over. Order one. Order ten.", go: '#/games/brain-bean', goLabel: 'Get in line' },
  { key: 'coffee', label: 'Get the coffee', on: ['games'], when: () => lsj('fv.bean.orders', 0) >= 5, test: () => lsj('fv.bean.wins', 0) > 0, say: "Still no coffee? The ninety-nine people in front of you felt the same. The math doesn't care. Order again.", go: () => location.hash.includes('brain-bean') ? null : '#/games/brain-bean', goLabel: 'Back in line' },
  { key: 'trophies', label: 'Visit the Trophy Room', on: ['home', 'ideas', 't', 'games', 'list'], test: () => doneSet().has('trophies'), say: "The Trophy Room keeps score of everything you just did. Go look at your name not being on it yet.", go: '#/trophies', goLabel: 'Trophy Room' },
  { key: 'secret', label: 'Find a secret', on: ['home', 'ideas', 'trophies'], test: () => Object.keys(lsj('fv.found', {})).length > 0, say: "There are secrets on this site. Eleven. The logo is a good place to start pressing. Ten times. I didn't say that." },
  { key: 'submit', label: 'Submit your idea', on: ['home', 'ideas', 't', 'list', 'trophies', 'tfrta'], test: () => doneSet().has('submitted'), say: "Submit your idea. Type it the way you'd say it across a counter. There's a sticker in it, and a buyer reads it, not me.", go: '#/submit', goLabel: 'Submit' },
  { key: 'rick', label: "Ask for Rick's review", on: ['submit'], test: () => !!ls('fv.rick'), say: "Five dollars and Rick reviews your idea. One shot. The five dollars is a bit. The review isn't." },
];
const progress = () => { const n = NEXT.filter(x => x.test()).length; return { n, of: NEXT.length }; };
function nextFor(p) {
  const nudged = new Set(sessGet('nudged') || []);
  const ok = n => !n.test() && (!n.when || n.when()) && !nudged.has(n.key);
  return NEXT.find(n => ok(n) && n.on.includes(p)) || NEXT.find(n => ok(n) && n.on.includes('any')) || NEXT.find(n => ok(n) && n.go);
}
/* while something is playing or arriving, he waits: the show, the elevator, a preview, the radio with sound */
const mediaOn = () => page() === 'show' || !!document.getElementById('bumper') || !!document.getElementById('ident') || !!document.querySelector('.vbox') || [...document.querySelectorAll('video, audio')].some(m => !m.paused && !m.muted && !m.ended);

const QUIET_AFTER = 3;          // dismissals in a row
const GAP = 30000;              // ms between tips
const IDLE = 45000;             // ms with no clicks before the idle tip

const SVG = `<svg viewBox="0 0 64 80" aria-hidden="true"><path class="wire" d="M22 70V18a10 10 0 0 1 20 0v44a7 7 0 0 1-14 0V26" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  <g class="eyes"><ellipse cx="26" cy="22" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="40" cy="22" rx="6.5" ry="7.5" fill="#fff"/><circle class="pupil" cx="27.5" cy="23" r="3"/><circle class="pupil" cx="41.5" cy="23" r="3"/></g>
  <path class="brow" d="M20 12l9 3M44 12l-9 3" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`;

let el, bubble, textEl, timer, lastAt = -1e9, dismissals = 0, quiet = false, idleT, seen, born = false, retryT;
const page = () => { const h = (location.hash || '#/').replace(/^#\/?/, ''); return h.split('/')[0] || 'home'; };

function build() {
  if (el) return;
  el = document.createElement('div'); el.id = 'clippo'; el.className = 'off';
  el.innerHTML = `<div class="bub" id="clippoBub" role="status" aria-live="polite"><p id="clippoSay"></p><ul class="todo" id="clippoTodo" hidden></ul><div class="row"><button class="ls" type="button" id="clippoList" aria-expanded="false">The list</button><a class="go" id="clippoGo" hidden></a><button class="ok" type="button" id="clippoOk">Got it</button><button class="no" type="button" id="clippoNo" aria-label="Clippo, stop">Stop</button></div></div>
    <button class="clip" type="button" id="clippoClip" aria-label="Clippo">${SVG}</button>`;
  document.body.appendChild(el);
  bubble = el.querySelector('#clippoBub'); textEl = el.querySelector('#clippoSay');
  el.querySelector('#clippoOk').addEventListener('click', () => { dismissals = 0; hide(); });
  el.querySelector('#clippoNo').addEventListener('click', () => { dismissals = QUIET_AFTER; quiet = true; hide(); store.set('quiet', Date.now()); });
  el.querySelector('#clippoClip').addEventListener('click', () => { if (el.classList.contains('on')) { hide(); return; } quiet = false; dismissals = 0; store.set('quiet', 0); if (!nudge('tap', true)) say(pageTip(page()) || 'idle', true); });
  el.querySelector('#clippoGo').addEventListener('click', () => { dismissals = 0; setTimeout(hide, 50); });
  el.querySelector('#clippoList').addEventListener('click', () => { const ul = el.querySelector('#clippoTodo'), b = el.querySelector('#clippoList'); const open = ul.hidden; if (open) { const pr = progress(); ul.innerHTML = `<li class="sum">${pr.n} of ${pr.of} done</li>` + NEXT.map(n => { const d = n.test(); const g = typeof n.go === 'function' ? n.go() : n.go; return `<li class="${d ? 'did' : 'todo'}">${d ? '<i>&#10003;</i>' : '<i></i>'}${g && !d ? `<a href="${esc(g)}">${esc(n.label)}</a>` : `<span>${esc(n.label)}</span>`}</li>`; }).join(''); } ul.hidden = !open; b.setAttribute('aria-expanded', String(open)); clearTimeout(timer); if (!open) timer = setTimeout(() => { if (el.classList.contains('on')) hide(); }, 14000); });
}
function show(text, go, goLabel) {
  build();
  textEl.textContent = text;
  const g = el.querySelector('#clippoGo'); if (go) { g.hidden = false; g.href = go; g.textContent = goLabel || 'Take me'; } else { g.hidden = true; }
  el.querySelector('#clippoTodo').hidden = true; el.querySelector('#clippoList').setAttribute('aria-expanded', 'false');
  el.classList.remove('off'); el.classList.add('on', 'pop'); setTimeout(() => el.classList.remove('pop'), 500);
  document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind: 'clippo' } }));
  lastAt = performance.now();
  clearTimeout(timer); timer = setTimeout(() => { if (el.classList.contains('on')) { dismissals++; hide(); } }, 14000);
}
function hide() { if (!el) return; el.classList.remove('on'); clearTimeout(timer); if (dismissals >= QUIET_AFTER) quiet = true; }
const REACTIONS = new Set(['watch1', 'watch3', 'secret', 'search', 'award']);    // answers to something you just did: no waiting period
function say(key, force) {
  const lines = TIPS[key]; if (!lines) return false;
  seen = seen || new Set(store.get('seen', []));
  if (!force) {
    if (quiet) return false;
    if (seen.has(key) && key !== 'idle') return false;
    if (!REACTIONS.has(key) && performance.now() - lastAt < GAP) return false;
    // the elevator or the logo is on screen: wait for them, then say it
    if (document.getElementById('bumper') || document.getElementById('ident')) { clearTimeout(retryT); retryT = setTimeout(() => say(key), 2500); return false; }
  }
  const t = lines[Math.floor(Math.random() * lines.length)];
  show(t);
  if (!seen.has(key)) { seen.add(key); store.set('seen', [...seen]); }
  return true;
}
/* the next thing you haven't done, said once a visit; forced when you tap the clip */
function nudge(why, force) {
  if (!force) { if (quiet) return false; if (mediaOn()) return false; if (performance.now() - lastAt < GAP) return false; }
  const n = nextFor(page());
  if (!n) { if (force) { const pr = progress(); if (pr.n >= pr.of) { show("You've done the whole thing. I have nothing left to say, which is new for me. Submit another idea."); return true; } } return false; }
  const go = typeof n.go === 'function' ? n.go() : n.go;
  show(n.say, go || null, n.goLabel);
  const nudged = new Set(sessGet('nudged') || []); nudged.add(n.key); sessSet('nudged', [...nudged]);
  return true;
}
function pageTip(p) {
  if (p === 'home') return 'arrive';
  if (p === 't') return 'title';
  if (p === 'games') { const sub = (location.hash.split('/')[2] || ''); return sub === 'dead-ends' ? 'maze' : sub === 'in-pieces' ? 'puzzle' : sub === 'over-the-board' ? 'chess' : 'games'; }
  if (p === 'trophies') return 'trophies';
  if (p === 'music') return 'music';
  if (p === 'submit') return 'submit';
  if (p === 'ptu') return 'ptu';
  if (p === 'ideas') return 'ideas';
  return null;
}
function armIdle() { clearTimeout(idleT); idleT = setTimeout(() => { if (!document.hidden && !mediaOn()) { if (!nudge('idle')) say('idle'); } armIdle(); }, IDLE); }

/* ---- the site tells him what happened: document events with a detail string */
export function mount() {
  if (born) return; born = true;
  build();
  const q = store.get('quiet', 0); if (q && Date.now() - q < 6 * 3600 * 1000) quiet = true;      // Stop holds for six hours
  // what he sees you open
  const seeRoute = () => {
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/'); const a = parts[0] || 'home', b = parts[1] || '';
    if (a === 't') markDone('title'); if (a === 'ptu' && b) markDone('planet'); if (a === 'show') markDone('show'); if (a === 'tfrta' && b) markDone('post');
    if (a === 'trophies') markDone('trophies'); if (a === 'games' && b) markDone('g:' + b); if (a === 'music') markDone('music');
  };
  const onRoute = () => { seeRoute(); const p = page(); const k = pageTip(p); const delay = k === 'arrive' ? 9000 : k === 'title' ? 18000 : 6000; clearTimeout(routeT); routeT = setTimeout(() => { if (page() !== p) return; if (!k || !say(k)) nudge('route'); }, delay); };
  let routeT; const pageFor = k => ({ arrive: 'home', title: 't', games: 'games', maze: 'games', puzzle: 'games', chess: 'games', trophies: 'trophies', music: 'music', submit: 'submit', ptu: 'ptu', ideas: 'ideas' })[k];
  addEventListener('hashchange', onRoute); onRoute();
  document.addEventListener('fv:event', e => {
    const d = e.detail || {};
    if (d.kind === 'watch') { const n = d.count || 1; if (n === 1) say('watch1'); else if (n === 3) say('watch3'); }
    if (d.kind === 'search') say('search');
    if (d.kind === 'secret') say('secret');
    if (d.kind === 'award' && d.fresh) { markDone('submitted'); say('award'); }
    if (d.kind === 'arrive') markDone('rode');
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-play], [data-playalb], [data-radio], .trk')) markDone('radio');
    if (e.target.closest('#prev')) markDone('preview');
  }, true);
  ['pointerdown', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, armIdle, { passive: true }));
  armIdle();
}
