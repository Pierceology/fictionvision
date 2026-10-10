/* The sponsor. FictionVision is brought to you by SOLACE, the cruise line between the thirteen planets (Pierce, 2026-10-08).
   The arrival is the ship's own elevator, as Pierce built it (solace-ship v0.7.0): full-screen doors skinned with the deck's film as ONE
   continuous frame, his gate card on the doors (the headline that ends the way every SOLACE line ends, the second line, the body, the
   button), the floor controller on the right, and THE READER OPENS THE DOORS WHEN READY. The car arrives at Deck 16, Observation; press
   the button and the doors part onto the deck's own film, the ship's "We're Grand" asteroid show (Pierce, 2026-10-10: that one is the
   special one and it lives here; the only other show on the site is his beat-synced one at #/show). Press a floor instead and the car
   rides there: the doors re-skin, the card changes, and the doors open onto that deck's own film with its own sound. Before a preview
   the car arrives at Deck 4, the Atrium. */
import { srcFor } from './media.js';
import { FLOORS } from './ship.js';
import { bus } from './bus.js';

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const soundOn = () => { try { return localStorage.getItem('fv.sfx') === '1'; } catch (e) { return false; } };
const slow = () => { const c = navigator.connection; return !!(c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))); };
const quality = () => (slow() || innerWidth < 760) ? 480 : innerWidth >= 1900 ? 1080 : 720;
const M = window.FVM || { v: {} };
const vurl = (id, q) => { if (/^https?:/.test(id)) return id.replace(/\/(480|720|1080)p\//, `/${q}p/`); if (M.v[id]) return srcFor(id); return `https://video.wixstatic.com/video/${id}/${q}p/mp4/file.mp4`; };
const frame = id => { const x = /^https?:/.test(id) ? id.split('/video/')[1].split('/')[0] : id; return `https://static.wixstatic.com/media/${x}f000.jpg/v1/fill/w_1280,h_720,q_78/p.jpg`; };
const sfxEv = kind => document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind } }));
const SOLACE_LOGO = 'https://static.wixstatic.com/media/6c593b_e8fd7344f1784c52abe40b3f08413a34~mv2.png';
const ATRIUM = FLOORS.findIndex(f => f.k === '4'), OBSERVATION = FLOORS.findIndex(f => f.k === '16');
const stateroom = f => f.k.length === 2 && f.k.charAt(0) === '5';
/* door skins, as on the ship: the atrium and the thirteen stateroom decks greet you with their planet's nebula; every other deck's doors wear the film across its hall */
const skinOf = (f, i) => (i === ATRIUM || stateroom(f)) ? f.door : f.wall;
const NAMES = { 'planet-zee': 'Planet Zee', 'yaaarghs-revenge': "Yaaargh's Revenge", 'oogh-iv': 'OOGH-IV', 'prearth': 'Prearth', 'that-other-planet': 'That Other Planet', 'figuria': 'Figuria', 'dens-crevice': "Den's Crevice", 'heliumdrum': 'Heliumdrum', 'washy-washy-ii': 'Washy Washy II', 'yarnia': 'Yarnia', 'hungary': 'Hungary', 'guffaw-7': 'Guffaw-7', 'spee-ider-grove': 'Spee-ider Grove' };

/* the plates on the seams of the site (a trophy back, a win card, the preview box) */
export const DECKS = [
  { n: '4', name: 'Atrium', v: 'f08d21_bf2c1e1b8d6d497891708d2434369cd4' },
  { n: '7', name: 'Recreatainment', v: 'f08d21_6b298074e6ad4d00852ce91cc14aef69' },
  { n: '12', name: 'PTU Radio', v: 'f08d21_b327eb573f7a42c6a2daaa6b0e103b9b' },
  { n: '3', name: 'Guest Services', v: '6c593b_58366022a00b4a72a459f144d1b0a8bf' },
  { n: '8', name: 'Casino', v: '0caac7_aaafc1c0d88045429563de022604ef17' },
  { n: '16', name: 'Observation Deck', v: '6c593b_a4c1b2ba9e324bcb89f3f701358878dc' },
];
export const LINES = FLOORS.map(f => ({ top: f.h1, line: f.h2 }));
const SEAM = { trophies: 1, games: 4, preview: 0, submit: 3, music: 2 };
export function plate(kind, o = {}) {
  const d = DECKS[SEAM[kind] ?? 0];
  return `<span class="spon${o.cls ? ' ' + o.cls : ''}"><span class="by">Brought to you by</span><b>SOLACE</b><small>Deck ${d.n} · ${esc(d.name)}</small></span>`;
}

/* the planet in view from the Observation Deck, named on the deck tag when the car arrives for a planet */
const viewOf = slug => NAMES[slug] ? { slug, name: NAMES[slug] } : null;

let primed = null;
/* start the door film loading early, and the deck behind it */
export function prime(kind = 'ident', planet = null) {
  const at = kind === 'preview' ? ATRIUM : OBSERVATION;
  const view = kind === 'preview' ? null : viewOf(planet);
  const q = quality();
  const door = document.createElement('video');
  door.muted = true; door.playsInline = true; door.preload = 'auto'; door.loop = true; door.setAttribute('disablepictureinpicture', '');
  door.src = vurl(skinOf(FLOORS[at], at), q); door.load();
  const imgs = [frame(skinOf(FLOORS[at], at)), frame(FLOORS[at].wall)].map(u => { const i = new Image(); i.src = u; return i; });
  primed = { kind, at, view, door, imgs };
  return primed;
}

/* ride the elevator. opts.onCovered fires once the doors are shut. Resolves when the car is gone. */
export function play(opts = {}) {
  const kind = opts.kind || 'ident';
  const P = primed && primed.kind === kind && (!opts.planet || (primed.view && primed.view.slug === opts.planet)) ? primed : prime(kind, opts.planet || null);
  primed = null;
  let { at, view, door } = P;
  const quick = calm();
  const el = document.createElement('div');
  el.id = 'bumper'; el.className = quick ? 'quick' : '';
  el.innerHTML = `<div class="floor" role="region" aria-label="The deck"></div>
    <div class="moses"><div class="tex"></div><i class="seam"></i></div>
    <div class="gate" role="dialog" aria-label="SOLACE"></div>
    <nav class="fl" aria-label="Decks"></nav><div class="tip"></div>
    <div class="ind" aria-hidden="true"><span class="deckno">Deck 1</span><span class="arrow">▲</span></div>
    <div class="tag" aria-hidden="true"><b></b><i></i></div>
    <button class="enter cta" type="button">${esc(opts.enter || (kind === 'preview' ? 'Watch the preview' : 'Enter FictionVision'))}</button>
    <button class="skip" type="button">Skip</button>`;
  const floorEl = el.querySelector('.floor'), gate = el.querySelector('.gate'), nav = el.querySelector('.fl'), tip = el.querySelector('.tip'), ind = el.querySelector('.ind .deckno'), tag = el.querySelector('.tag'), enterBtn = el.querySelector('.enter');
  // the Moses gate: ONE video of the deck's film, the doors are a mask with an animated gap down the middle (no seam at rest, no paint loop)
  const tex = el.querySelector('.moses .tex');
  const setSkin = id => { tex.style.backgroundImage = `url(${frame(id)})`; };
  setSkin(skinOf(FLOORS[at], at));
  tex.appendChild(door);
  let raf = 0;
  document.body.appendChild(el);
  door.play().catch(() => { });

  let done = false, covered = false, state = 'closed', wall = null, autoT = 0;
  const timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const cover = () => { if (covered) return; covered = true; try { opts.onCovered && opts.onCovered(); } catch (e) { } };

  // ---- the gate card, Pierce's copy, as on the ship
  const renderGate = () => {
    const f = FLOORS[at];
    gate.innerHTML = `<div class="card"><div class="scroll">
        <h1 class="t"><span class="l">${esc(f.h1)}</span><span class="l nf">${esc(f.h1b)}</span></h1>
        <h2 class="s">${esc(f.h2)}</h2>
        <p class="b">${esc(f.body)}</p>
        <div class="tagline">There's SOLACE in that.</div>
        <div class="brand"><span>Aboard TFRTA-operated</span><img src="${SOLACE_LOGO}" alt="SOLACE"></div>
      </div><div class="act"><button class="more" type="button">Read more</button><button class="open" type="button">${esc(f.cta || 'Open the doors')}</button></div></div>`;
    gate.querySelector('.open').addEventListener('click', () => openDoors(true));
    const more = gate.querySelector('.more'), body = gate.querySelector('.b');
    more.addEventListener('click', () => { const open = body.classList.toggle('open'); more.textContent = open ? 'Less' : 'Read more'; });
    gate.classList.remove('hide');
    nav.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === at));
    arm();
  };
  // the deck's name, low on the screen, fading on its own
  const showTag = () => { const f = FLOORS[at]; tag.querySelector('b').textContent = f.name; tag.querySelector('i').textContent = `DECK ${f.label}${view && at === OBSERVATION ? ` · ${view.name.toUpperCase()} IN VIEW` : ''}`; tag.classList.add('on'); later(() => tag.classList.remove('on'), 4200); };
  // the reader opens the doors when ready; if nobody is reading, the car opens them after a while
  const arm = () => { clearTimeout(autoT); autoT = later(() => openDoors(false), opts.gateHold || 14000); };

  // ---- the floor controller on the right
  FLOORS.forEach((f, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = f.label; b.setAttribute('aria-label', `Deck ${f.label}, ${f.name}`);
    b.addEventListener('mouseenter', () => { tip.textContent = `${f.label}  ${f.name}`; tip.style.top = (b.getBoundingClientRect().top + b.offsetHeight / 2) + 'px'; tip.classList.add('on'); });
    b.addEventListener('mouseleave', () => tip.classList.remove('on'));
    b.addEventListener('click', () => travelTo(i));
    nav.appendChild(b);
  });
  const travelTo = i => {
    if (done || i === at || state === 'riding') return;
    const from = at; at = i; state = 'riding'; clearTimeout(autoT);
    gate.classList.add('hide'); tag.classList.remove('on');
    if (state !== 'closed' && wall) { el.classList.remove('open', 'show'); hush(); }
    sfxEv('doors');
    // re-skin the doors for where we are going, and tick the indicator from here to there
    const id = skinOf(FLOORS[i], i); setSkin(id); try { door.src = vurl(id, quality()); door.load(); door.play().catch(() => { }); } catch (e) { }
    const steps = Math.max(2, Math.min(10, Math.abs(i - from))), RIDE = 1100 + steps * 90;
    el.classList.add('riding');
    for (let s = 1; s <= steps; s++) { const idx = Math.round(from + (i - from) * (s / steps)); later(() => { ind.textContent = 'Deck ' + FLOORS[idx].label; ind.classList.remove('tick'); void ind.offsetWidth; ind.classList.add('tick'); }, Math.round(RIDE * s / (steps + 1))); }
    later(() => { ind.textContent = `Deck ${FLOORS[i].label} · ${FLOORS[i].name}`; el.classList.add('ding'); sfxEv('ding'); }, RIDE);
    later(() => { el.classList.remove('riding', 'ding'); state = 'closed'; renderGate(); }, RIDE + 700);
  };

  // ---- the deck behind the doors, built when the doors open: the deck's own film, full bleed. On 16 that film is "We're Grand", the
  // ship's asteroid show; it starts a few seconds in so the asteroids are already flying when the doors part.
  const buildDeck = () => {
    floorEl.innerHTML = ''; wall = null;
    const f = FLOORS[at];
    floorEl.innerHTML = `<div class="sky" style="background-image:url(${frame(f.wall)})"></div>`;
    wall = document.createElement('video'); wall.muted = true; wall.playsInline = true; wall.preload = 'auto'; wall.loop = true; wall.setAttribute('disablepictureinpicture', '');
    wall.src = vurl(f.wall, quality()); floorEl.querySelector('.sky').appendChild(wall);
    if (at === OBSERVATION) wall.addEventListener('loadedmetadata', () => { try { wall.currentTime = 4; } catch (e) { } }, { once: true });
    wall.play().catch(() => { });
  };
  // one sound per floor, heard once the reader opens the doors: the deck's own film, "We're Grand" on 16.
  // Only when the sounds are on and nothing else is speaking; the button press is the gesture the browser wants.
  const hear = byReader => {
    if (!soundOn() || bus.claims.size || !byReader || !wall) return;
    bus.claim('elevator');
    wall.muted = false; wall.volume = 0.5; wall.play().catch(() => { wall.muted = true; bus.release('elevator'); });
  };
  const hush = () => {
    if (wall) { try { wall.muted = true; } catch (e) { } }
    bus.release('elevator');
  };
  const openDoors = byReader => {
    if (done || state !== 'closed') return;
    state = 'open'; clearTimeout(autoT);
    buildDeck(); gate.classList.add('hide'); tip.classList.remove('on');
    el.classList.add('open', 'show'); sfxEv('doors'); hear(byReader);
    later(showTag, 500);
    later(() => el.classList.add('entry'), 1400);
    later(finish, opts.hold || (byReader ? 12000 : 8000));
  };

  return new Promise(res => {
    const finish = () => {
      if (done) return; done = true;
      timers.forEach(clearTimeout); clearTimeout(autoT); cancelAnimationFrame(raf); cover(); hush();
      el.classList.add('fade');
      setTimeout(() => { [door, wall].forEach(v => { if (!v) return; try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { } }); el.remove(); res(); }, quick ? 250 : 650);
    };
    el.__finish = finish;
    el.querySelector('.skip').addEventListener('click', finish);
    enterBtn.addEventListener('click', finish);
    const onKey = e => { if (e.key === 'Escape') { finish(); removeEventListener('keydown', onKey); } }; addEventListener('keydown', onKey);
    if (quick) { cover(); state = 'closed'; renderGate(); return; }
    later(() => { el.classList.add('shut'); sfxEv('doors'); }, 30);           // the doors close over the logo, wearing the deck's film
    later(() => { cover(); renderGate(); }, 930);                              // the gate card, the floor controller: the reader opens the doors when ready
  }).finally(() => { });

  function finish() { el.__finish && el.__finish(); }
}
