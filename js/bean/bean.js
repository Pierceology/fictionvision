/* BRAIN BEAN COFFEE. Planet Zee's coffee shop, where 1 in 100 customers actually gets a coffee and the wait has become the attraction
   (Pierce, 2026-10-08/09). Pam works the counter, Craig the register, Barry waits in line. You order; the roll is honest, one in a
   hundred, from the browser's own random bytes. Pam is on film: every film starts and ends on her own frame (Pierce's first-frame,
   last-frame technique), so she does a thing and is back at her counter with no seam. Twenty ways of not giving it, dealt from a
   shuffled deck so a repeat is rare; the one time she hands it over, the screen goes to euphoria: the Planet Zee nebula, his zombies
   dancing, the aliens' disco, confetti, and "Pulse" from Planet Zee Radio. The button is his living button. Test mode
   (#/games/brain-bean/test) sets the odds to 1 in 5, can run a thousand customers to check the math, and can show the win. */
import { MAZE_ASSETS } from '../maze/assets.js';
import { bus } from '../bus.js';

const ODDS = 100;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.bean.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.bean.' + k, JSON.stringify(v)); } catch (e) { } },
};
const sfx = kind => document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind } }));
/* an honest roll: one chance in `odds`, from the browser's random bytes */
function roll(odds) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % odds === 0; }
const vurl = (id, q = 720) => `https://video.wixstatic.com/video/${id}/${q}p/mp4/file.mp4`;

/* the faces: Pierce's own, resized only */
export const FACES = {
  barry: 'https://static.wixstatic.com/media/c626e3_d92d4c1e7d3444c78d629d775cb62708~mv2.png/v1/fit/w_600,h_600,q_85/p.png',
  pam: 'img/bean/pam.webp', craig: 'img/bean/craig.webp',
};
const abs = u => /^https?:|^data:/.test(u) ? u : new URL(u, document.baseURI).href;
/* Pam: PamPhotoshop.png, the diner Pam at her counter under the sign. Her frame is the scene; her films start and end on it. */
const PAM_STILL = 'img/bean/pam-scene.webp';   // the idle film's own first frame, so the scene and the films are one picture (2026-10-10)
/* her films, by key: Wix video ids as they come out of Flow (2026-10-09). A key with no id plays as words over her still. */
export const FILMS = {
  // 2026-10-10: only the films Pierce kept on the review page (Keep / Not approved per film, read back from its db); nine were cut
  idle: '6c593b_792c44f5c11e4f1abd048f6b51be7e88', give: '6c593b_6f2d64322c624cfca0ec750cb6bc1705', give2: '6c593b_1155bc3b4c374c428e8c1520efc34888',
  pour: '6c593b_cec9c63dc00c4bd785b02973cb1d31a1', hand: '6c593b_eeb92cc63fdd491082f10cf03b6bee62', sip: '6c593b_1d39c8b27c5f4da3b5c0a6fcfddf9e20',
  shrug: '6c593b_35e3ab2ae9544ba2ad7d5c0c9882c355', sniff: '6c593b_eb31b07cb5e148568248ab1990dcb325', stare: '6c593b_53c01de5c5684c1eade899a44057c93d',
  twirl: '6c593b_cd56d90c695b4f8190e116bd79301f33', two: '6c593b_1f3b5713363f4b28a3b97a09b791498c', ceiling: '6c593b_c3d083c341914ec6adbf4a305ff38505',
  laugh: '6c593b_b71a5fdabec2419a8cab0ee78d3c000e', push: '6c593b_f808a6b5788e4aba8996a3a775d2f484',
};
/* the twenty ways she does not hand it over, and the one time she does. The line lands as she moves, the aside as she comes back. */
const ALMOST = [   // eleven, the ones Pierce kept (2026-10-10)
  { k: 'pour', pam: "I'm legally required to pour this one out. Planet Zee statute one-in-a-hundred.", aside: 'The counter is the most popular customer.' },
  { k: 'hand', pam: 'Hold this. No, give it back. Policy.', aside: 'For one second it was warm.' },
  { k: 'sip', pam: "Let me make sure it's good.", aside: 'It was good.' },
  { k: 'shrug', pam: "Craig says no. I don't argue with Craig.", aside: 'Craig did not look up.' },
  { k: 'sniff', pam: 'Hm. Let me check that one.', aside: 'She checked it. It was hers after all.' },
  { k: 'stare', pam: '…', aside: 'She blinked once. That was the whole transaction.' },
  { k: 'twirl', pam: 'Was there something?', aside: 'There was. It was coffee. It was yours.' },
  { k: 'two', pam: 'Both hands. Still no.', aside: 'She considered it with both hands. Both hands said no.' },
  { k: 'ceiling', pam: 'Give me a second.', aside: 'The second has been going on since Tuesday.' },
  { k: 'laugh', pam: 'Ha.', aside: "That was the laugh. It's gone now." },
  { k: 'push', pam: 'This far. No further.', aside: 'She brought it over. She brought it back. That was the visit.' },
];
const WIN = { pam: "That's a coffee. That's an actual coffee. CRAIG.", aside: 'Craig rang it up. Barry stood. The line applauded, because a thing had happened.' };
/* the euphoria (2026-10-10): the hit, the montage on the beat, then the float. Every clip is Pierce's own, from his libraries. */
const TRIP = {
  sky: '0caac7_1ad5486d6a4e468085a5f03c1679f4dd',          // Planet Zee's nebula, from the Asteroid Show
  disco: '6c593b_d039e77764fb4c8cab94b3b64d26e2fc',        // aliens dancing under lasers
  floats: ['6c593b_848efa75153e463594cb32954850b167', '6c593b_8e01f70aaaef4430adffa4d43f10ff14', '6c593b_319ef0dbbf1f43859898065e2c6b03a1', '6c593b_b83415c9d2234dabac94b021f590f9d2', '6c593b_1a1e152c84ce4fca930b14d25b9e8d5b'],
  song: 'https://static.wixstatic.com/mp3/f08d21_c324c5edd2b84e20b2a926ccceb3ff13.mp3',   // "Pulse", Planet Zee Radio, Vol. 1
  hit: '6c593b_a3182a06bc7040b3802ad6d1d0516dd0',          // Zombie Brew: SCREAM FOR YOUR CREAM
  smoke: '6c593b_abef282565c447efb048ade54c8b33f9',        // green smoke rolling in
  fire: '6c593b_a1b092584cb54e74a8f7b3a078707638',         // flames on black, lit over everything
  wash: '6c593b_9f5a70e45b9644b389ef3acc6d279cf9',         // his retro colours, the trip layer
  // the montage, in order: light = on black, lit over the sky; wide = a banner, shown whole
  cuts: [
    { id: '6c593b_127fa847c7df49e29c5766dd16da44c5' },                 // the beings, dancing
    { id: '6c593b_02e3a036ea0d400bb2e3e7799d704d87', wide: 1 },        // the 753rd Planet Zee Beauty Pageant
    { id: '6c593b_848efa75153e463594cb32954850b167' },                 // zombie one
    { id: '6c593b_73afabfe66a44f2e8f95163f9259b7f1', light: 1 },       // DANCE, in neon
    { id: '6c593b_f3250b9b96ff4d8787dcf9f693e8c63c' },                 // the beings' string section
    { id: '6c593b_8e01f70aaaef4430adffa4d43f10ff14' },                 // zombie two
    { id: '6c593b_a0134b02178c414a8edd35048809ea28', light: 1 },       // the robot in the shirt, dancing like a night
    { id: '6c593b_79482a1e700843e08464c50db54f9f70' },                 // Planet Zee itself, molten, in a hand
    { id: '6c593b_9153801ec9b84b9289002019c0bc9b17' },                 // the beings again
    { id: '6c593b_319ef0dbbf1f43859898065e2c6b03a1' },                 // zombie three
    { id: '6c593b_a79afa0b35784a178117cd9fb6fb2418', light: 1 },       // the dancing silhouettes
    { id: '6c593b_b83415c9d2234dabac94b021f590f9d2' },                 // the guitar zombie
    { id: '6c593b_39c7528dae6d4e9ea296433dd412d7a0' },                 // the universe, floating
    { id: '6c593b_1a1e152c84ce4fca930b14d25b9e8d5b' },                 // the band
    { id: '6c593b_d039e77764fb4c8cab94b3b64d26e2fc' },                 // the aliens' disco
    { id: '6c593b_ef1e4bfb733646a588cbe60454428b4e', light: 1 },       // the robot again
  ],
};

/* the living button: thin white outline, transparent inside, white text; width animates on 400ms; a narrator. */
function livingButton(host) {
  const el = document.createElement('button');
  el.type = 'button'; el.className = 'living';
  el.innerHTML = '<span class="ghost" aria-hidden="true"></span><span class="label"></span>';
  host.appendChild(el);
  const label = $('.label', el), ghost = $('.ghost', el);
  let onPress = null, busy = false;
  const reserve = words => { ghost.textContent = words.slice().sort((a, b) => b.length - a.length)[0] || ''; };
  const say = async (text, { hold = 2400, answer = true } = {}) => {
    el.classList.add('answering'); label.textContent = text;
    await sleep(hold);
    if (answer) { el.classList.add('gone'); await sleep(400); el.classList.remove('answering', 'gone'); }
  };
  const next = text => { label.textContent = text; el.classList.remove('answering', 'gone'); el.classList.add('arrive'); setTimeout(() => el.classList.remove('arrive'), 450); busy = false; };
  el.addEventListener('click', async () => { if (busy || !onPress) return; busy = true; await onPress(); });
  return { el, say, next, reserve, press(fn) { onPress = fn; }, lock() { busy = true; }, unlock() { busy = false; } };
}
/* a film that never hard-loops: forward to the end, then stepped back to the start, then forward again */
function pingpong(v, isDead) {
  let rev = false, raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (isDead() || v.readyState < 2) return;
    if (rev) { v.currentTime = Math.max(0, v.currentTime - 1 / 50); if (v.currentTime <= 0.04) { rev = false; v.play().catch(() => { }); } }
    else if (v.ended || (isFinite(v.duration) && v.currentTime >= v.duration - 0.06)) { rev = true; v.pause(); }
  };
  v.play().catch(() => { }); raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
/* the beat of the song, read from the song itself: the file is fetched and decoded once, and every jump in energy that is at least
   a quarter second after the last one is a beat. Null when the file cannot be read (then a clock at Pulse's tempo stands in). */
async function beatMap(url) {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const buf = await (await fetch(url, { mode: 'cors' })).arrayBuffer();
  const ctx = new AC(); let audio; try { audio = await ctx.decodeAudioData(buf); } finally { try { ctx.close(); } catch (e) { } }
  const ch = audio.getChannelData(0), sr = audio.sampleRate, W = 1024, N = Math.floor(ch.length / W);
  const E = new Float32Array(N); for (let i = 0; i < N; i++) { let a = 0; for (let j = i * W, e = j + W; j < e; j++) a += ch[j] * ch[j]; E[i] = a / W; }
  const beats = []; let avg = 0, last = -1;
  for (let i = 0; i < N; i++) { const t = i * W / sr; avg = i < 20 ? (avg * i + E[i]) / (i + 1) : avg * 0.97 + E[i] * 0.03; if (E[i] > avg * 1.6 && E[i] > 1e-4 && t - last > 0.28) { beats.push(t); last = t; } }
  return beats.length > 8 ? beats : null;
}
/* onBeat on every beat of the playing song, or on a 128 bpm clock when the beats are not known; returns the stop */
function beatClock(song, beats, onBeat, isDead) {
  let raf = 0, timer = 0, k = 0;
  if (beats && song) {
    const tick = () => { if (isDead()) return; raf = requestAnimationFrame(tick); const t = song.currentTime; while (k < beats.length && beats[k] <= t) { k++; if (t - beats[k - 1] < 0.25) onBeat(); } };
    raf = requestAnimationFrame(tick);
  } else { const T = 60000 / 128; const tick = () => { if (isDead()) return; onBeat(); timer = setTimeout(tick, T); }; timer = setTimeout(tick, T); }
  return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
}
const calmer = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/* the deck: all twenty, shuffled, dealt one at a time; a new shuffle when it runs out, never starting on the card it just ended on */
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function deal(S) {
  if (!S.deck || !S.deck.length) { let d = shuffle(ALMOST.map(a => a.k)); if (S.last && d[0] === S.last && d.length > 1) d.push(d.shift()); S.deck = d; }
  const k = S.deck.shift(); S.last = k; store.set('deck', S.deck); store.set('last', k);
  return ALMOST.find(a => a.k === k) || ALMOST[0];
}

export function mount(root, slug) {
  const test = slug === 'test';
  const odds = test ? 5 : ODDS;
  const S = { orders: store.get('orders', 0), wins: store.get('wins', 0), dry: store.get('dry', 0), deck: store.get('deck', null), last: store.get('last', '') };
  let dead = false;
  const filmKeys = Object.keys(FILMS).filter(k => FILMS[k]);
  root.innerHTML = `<div class="bean-page">
    <div class="bean-head"><span class="kicker">Planet Zee · Brain Bean Coffee</span><h1>BRAIN BEAN COFFEE</h1>
      <p>One in a hundred customers gets the coffee. The wait has become the attraction.${test ? ' <b class="test">TEST MODE · 1 in 5</b>' : ''}</p></div>
    <div class="bean-stage">
      <div class="scene">
        <div class="pam-film" style="background-image:url(${PAM_STILL})">${filmKeys.map(k => `<video class="pamg${k === 'idle' ? ' on' : ''}" data-k="${k}" muted playsinline preload="${k === 'idle' ? 'auto' : 'metadata'}" src="${vurl(FILMS[k])}"></video>`).join('')}</div>
        <div class="crew">
          <div class="who barry"${FACES.barry ? ` style="--pic:url(${abs(FACES.barry)})"` : ''}><i></i><b>Barry</b><small>in line, since Tuesday</small></div>
          <div class="who pam"><b>Pam</b><small>the counter</small></div>
          <div class="who craig"${FACES.craig ? ` style="--pic:url(${abs(FACES.craig)})"` : ''}><i></i><b>Craig</b><small>the register</small></div>
        </div>
        <div class="ticket"><span>Customer</span><b id="beanNo">#${S.orders + 1}</b></div>
      </div>
      <div class="panel">
        <div class="say" id="beanSay" aria-live="polite"><span class="nm">Pam</span><p id="beanPam">What can I almost get you?</p><p class="aside" id="beanAside"></p></div>
        <div class="board"><span>Your orders <b id="beanOrders">${S.orders}</b></span><span>Your coffees <b id="beanWins">${S.wins}</b></span><span>The odds <b>1 in ${odds}</b></span></div>
        <div class="btnrow" id="beanBtn"></div>
        ${test ? '<div class="sim"><button type="button" class="ghostbtn" id="beanSim">Run 1,000 customers</button><button type="button" class="ghostbtn" id="beanShowWin">Show me the win</button><button type="button" class="ghostbtn" id="beanShowOld">Show me the old win</button><span id="beanSimOut"></span></div>' : ''}
      </div>
    </div>
    <div class="win" id="beanWin" hidden>
      <video class="sky" muted playsinline preload="none"></video>
      <video class="wash" muted playsinline preload="none"></video>
      <div class="trip" aria-hidden="true"></div>
      <div class="cuts" aria-hidden="true"></div>
      <video class="hitv" muted playsinline preload="none"></video>
      <video class="fx smoke" muted playsinline preload="none"></video>
      <video class="fx fire light" muted playsinline preload="none"></video>
      <video class="disco" muted playsinline preload="none"></video>
      <div class="orbit" aria-hidden="true">${TRIP.floats.map((id, i) => `<div class="fl f${i + 1}"><video muted playsinline preload="none" data-id="${id}"></video></div>`).join('')}</div>
      <canvas class="confetti" aria-hidden="true"></canvas>
      <div class="flash" aria-hidden="true"></div>
      <div class="wincopy"><span class="kicker">Customer #<b id="beanWinNo"></b></span><h2>YOU GOT<br>THE COFFEE</h2><p>One in a hundred. Planet Zee Radio is playing Pulse. The zombies are dancing for you, specifically.</p><div class="winbtn" id="beanWinBtn"></div></div>
    </div>
  </div>`;
  const pamEl = $('#beanPam', root), asideEl = $('#beanAside', root), stage = $('.bean-stage', root);
  const btn = livingButton($('#beanBtn', root));
  btn.reserve(['Order a coffee', 'Pam heard you', 'Order another', 'Try your luck again']);
  btn.next('Order a coffee');
  const paint = () => { $('#beanNo', root).textContent = '#' + (S.orders + 1); $('#beanOrders', root).textContent = S.orders; $('#beanWins', root).textContent = S.wins; };
  const save = () => { store.set('orders', S.orders); store.set('wins', S.wins); store.set('dry', S.dry); };

  // ---- Pam on film: the idle ping-pongs on her frame; a gesture shows over it for its length, then the idle again from its first frame
  const films = {}; root.querySelectorAll('.pamg').forEach(v => { films[v.dataset.k] = v; });
  const idle = films.idle || null; let idleRev = false, idleRaf = 0, pamBusy = false, idleStep = 1 / 50;
  const idleTick = () => {
    idleRaf = requestAnimationFrame(idleTick);
    if (dead || pamBusy || !idle || idle.readyState < 2) return;
    if (idleRev) { idle.currentTime = Math.max(0, idle.currentTime - idleStep); if (idle.currentTime <= 0.04) { idleRev = false; idle.play().catch(() => { }); } }
    else if (idle.ended || (isFinite(idle.duration) && idle.currentTime >= idle.duration - 0.06)) { idleRev = true; idle.pause(); }
  };
  if (idle) { idle.play().catch(() => { }); idleRaf = requestAnimationFrame(idleTick); }
  const kick = () => { if (!dead && idle && idle.paused && !pamBusy) idle.play().catch(() => { }); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, kick, { passive: true }));
  document.addEventListener('visibilitychange', kick);
  const rewind = () => new Promise(res => {
    if (!idle || idle.readyState < 2 || idle.currentTime <= 0.05) return res();
    idleRev = true; idleStep = 1 / 8; idle.pause();
    const t0 = Date.now();
    const poll = () => { if (dead || !idleRev || idle.currentTime <= 0.05 || Date.now() - t0 > 2600) { idleStep = 1 / 50; res(); } else requestAnimationFrame(poll); };
    requestAnimationFrame(poll);
  });
  /* play one of her films; onStart fires when it is on screen, so the words land on the picture; resolves when she is back */
  const pamPlay = async (key, onStart, { hold = false } = {}) => {
    const g = films[key];
    if (!g) { if (onStart) onStart(); return false; }
    await rewind();
    if (dead) { if (onStart) onStart(); return false; }
    pamBusy = true; idleRev = false;
    return new Promise(res => {
      let done = false;
      const back = () => {
        if (done) return; done = true; g.onended = null; g.onerror = null;
        if (!hold) { if (idle) { try { idle.pause(); idle.currentTime = 0; } catch (e) { } idle.classList.add('on'); idle.play().catch(() => { }); } g.classList.remove('on'); pamBusy = false; }
        res(true);
      };
      const show = () => { g.classList.add('on'); if (idle) { idle.classList.remove('on'); try { idle.pause(); } catch (e) { } } if (onStart) onStart(); };
      g.onended = back; g.onerror = () => { if (onStart) onStart(); back(); };
      try { g.currentTime = 0; } catch (e) { }
      const p = g.play();
      if (p && p.then) p.then(show).catch(() => { if (onStart) onStart(); back(); }); else show();
      setTimeout(() => { if (!done) back(); }, 9500);
    });
  };
  const pamReset = () => { Object.values(films).forEach(g => { if (g !== idle) { g.classList.remove('on'); try { g.pause(); } catch (e) { } } }); if (idle) { idle.classList.add('on'); try { idle.currentTime = 0; } catch (e) { } idle.play().catch(() => { }); } pamBusy = false; };

  // ---- an almost: one card off the deck; her film if it exists, her words either way
  const almost = async () => {
    const a = deal(S);
    stage.classList.add('serving'); sfx('pop');
    let started; const onFilm = new Promise(r => { started = r; });
    const film = films[a.k] ? pamPlay(a.k, started) : null;
    if (film) {
      await onFilm; await sleep(1500);
      pamEl.textContent = a.pam; asideEl.textContent = '';
      await sleep(3500);
      asideEl.textContent = a.aside;
      await film; await sleep(300);
    } else {
      await sleep(700);
      pamEl.textContent = a.pam; asideEl.textContent = '';
      await sleep(2200);
      asideEl.textContent = a.aside;
      await sleep(1600);
    }
    stage.classList.remove('serving');
  };

  // ---- the euphoria. 'new' (2026-10-10): the flash and Zombie Brew with smoke and flames for eight beats, then the montage cut on the
  // beat of Pulse, the floats arriving halfway, then everything at once. 'old': the float alone, kept so the two can be compared in test mode.
  let tripStops = [], song = null, confettiRaf = 0;
  const stopAll = () => { tripStops.forEach(f => { try { f(); } catch (e) { } }); tripStops = []; };
  const celebrate = async (mode = 'new') => {
    const win = $('#beanWin', root); win.hidden = false;
    win.classList.remove('hit', 'montage', 'float', 'sipped', 'beat'); win.classList.toggle('v2', mode === 'new');
    requestAnimationFrame(() => win.classList.add('on'));
    $('#beanWinNo', root).textContent = S.orders;
    const isDead = () => dead || win.hidden;
    const q = innerWidth < 760 ? 480 : 720;
    const sky = $('.sky', win), disco = $('.disco', win), wash = $('.wash', win), hit = $('.hitv', win), smoke = $('.smoke', win), fire = $('.fire', win), cutsEl = $('.cuts', win);
    sky.src = vurl(TRIP.sky, q); tripStops.push(pingpong(sky, isDead));
    let floated = false;
    const floatsOn = () => {
      if (floated) return; floated = true;
      disco.src = vurl(TRIP.disco, q); tripStops.push(pingpong(disco, isDead));
      win.querySelectorAll('.fl video').forEach((v, i) => { v.src = vurl(v.dataset.id, 480); setTimeout(() => { if (!isDead()) tripStops.push(pingpong(v, isDead)); }, 300 + i * 350); });
    };
    // the song: Pulse, over everything else that was playing
    bus.claim('bean'); song = new Audio(TRIP.song); song.volume = 0;
    const songOn = song.play().then(() => { let v = 0; const f = setInterval(() => { v = Math.min(0.85, v + 0.05); if (song) song.volume = v; if (v >= 0.85 || isDead()) clearInterval(f); }, 80); return true; }).catch(() => false);
    // confetti: coffee-coloured and gold, falling through it all
    const c = $('.confetti', win), ctx = c.getContext('2d'); const fit = () => { c.width = win.clientWidth; c.height = win.clientHeight; }; fit(); addEventListener('resize', fit);
    const P = Array.from({ length: 160 }, () => ({ x: Math.random() * c.width, y: Math.random() * -c.height, r: 3 + Math.random() * 6, s: 1 + Math.random() * 3, a: Math.random() * 6.28, w: 0.02 + Math.random() * 0.06, col: ['#ffc857', '#fa6010', '#f1e9dc', '#6b3e1e', '#ff2d95'][Math.floor(Math.random() * 5)] }));
    const draw = () => { if (isDead()) return; ctx.clearRect(0, 0, c.width, c.height); for (const p of P) { p.y += p.s; p.a += p.w; p.x += Math.sin(p.a) * 0.8; if (p.y > c.height + 10) { p.y = -10; p.x = Math.random() * c.width; } ctx.fillStyle = p.col; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.a, 0, 6.28); ctx.fill(); } confettiRaf = requestAnimationFrame(draw); };
    tripStops.push(() => { cancelAnimationFrame(confettiRaf); removeEventListener('resize', fit); });
    draw();
    sfx('win'); setTimeout(() => sfx('chime'), 500);
    document.dispatchEvent(new CustomEvent('fv:unlock', { detail: { key: 'brain-bean' } }));
    if (mode === 'new' && !calmer()) {
      // THE HIT: the flash, Zombie Brew, the smoke, the flames
      hit.src = vurl(TRIP.hit, q); smoke.src = vurl(TRIP.smoke, 480); fire.src = vurl(TRIP.fire, 480);
      win.classList.add('hit');
      [hit, smoke, fire].forEach(v => { v.classList.add('on'); v.loop = true; v.play().catch(() => { }); });
      // the cuts, loading while the hit plays
      const cuts = TRIP.cuts.slice(0, innerWidth < 760 ? 10 : TRIP.cuts.length).map(k => { const v = document.createElement('video'); v.className = 'cut' + (k.light ? ' light' : '') + (k.wide ? ' wide' : ''); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = true; v.src = vurl(k.id, 480); cutsEl.appendChild(v); return v; });
      let n = 0, i = -1, held = 0, phase = 'hit';
      const show = k => cuts.forEach((v, j) => { v.classList.toggle('on', j === k); if (j === k) { try { v.currentTime = 0; } catch (e) { } v.play().catch(() => { }); } else if (!v.paused) v.pause(); });
      const toMontage = () => { if (phase !== 'hit') return; phase = 'montage'; win.classList.remove('hit'); win.classList.add('montage'); hit.classList.remove('on'); smoke.classList.remove('on'); };
      const toFloat = () => { if (phase === 'float') return; phase = 'float'; win.classList.remove('montage'); win.classList.add('float'); cuts.forEach(v => v.classList.remove('on')); fire.classList.remove('on'); floatsOn(); setTimeout(() => cuts.forEach(v => { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { } v.remove(); }), 1400); };
      const onBeat = () => {
        if (isDead() || phase === 'float') return;
        n++; win.classList.add('beat'); setTimeout(() => win.classList.remove('beat'), 110);
        if (phase === 'hit') { if (n >= 8) toMontage(); return; }
        if (held > 0) { held--; return; }
        i++;
        if (i === 7) floatsOn();                                   // the floats come in halfway through the montage
        if (i >= cuts.length) { toFloat(); return; }
        show(i); held = i < 6 ? 1 : 0;                             // two beats a cut, then one
      };
      const ok = await songOn; if (isDead()) return;
      const beats = ok ? await beatMap(TRIP.song).catch(() => null) : null;
      if (isDead()) return;
      tripStops.push(beatClock(ok ? song : null, beats, onBeat, isDead));
      const t1 = setTimeout(toMontage, 6000), t2 = setTimeout(toFloat, 24000);   // whatever the song does, the montage starts by six seconds and ends by twenty-four
      tripStops.push(() => { clearTimeout(t1); clearTimeout(t2); });
    } else {
      win.classList.add('float'); floatsOn();
    }
    wash.src = vurl(TRIP.wash, 480); tripStops.push(pingpong(wash, isDead));
    const host = $('#beanWinBtn', win); host.innerHTML = '';
    const wb = livingButton(host); wb.reserve(['Drink it', 'Back to the line']); wb.next('Drink it');
    wb.press(async () => { await wb.say('Tastes like everything at once.'); win.classList.add('sipped'); wb.next('Back to the line'); wb.press(async () => { await comeDown(); }); });
    const comeDown = async () => {
      if (song) { const s = song; song = null; let v = s.volume; const f = setInterval(() => { v -= 0.06; if (v <= 0) { clearInterval(f); try { s.pause(); } catch (e) { } } else s.volume = v; }, 60); }
      win.classList.remove('on'); await sleep(600); win.hidden = true;
      stopAll();
      win.querySelectorAll('video').forEach(v => { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { } v.classList.remove('on'); }); cutsEl.innerHTML = '';
      win.classList.remove('hit', 'montage', 'float', 'v2', 'beat', 'sipped');
      bus.release('bean');
      pamReset(); pamEl.textContent = 'What can I almost get you?'; asideEl.textContent = ''; btn.next('Order a coffee'); btn.unlock();
    };
  };

  btn.press(async () => {
    if (dead) return;
    S.orders++; paint();
    await btn.say('Pam heard you.');
    const won = roll(odds);
    if (won) {
      S.wins++; S.dry = 0; save(); paint();
      stage.classList.add('serving');
      let started; const onFilm = new Promise(r => { started = r; });
      const gk = films.give2 && Math.random() < 0.5 ? 'give2' : 'give';   // the two gives he kept, at random
      const give = films[gk] ? pamPlay(gk, started, { hold: true }) : null;
      if (give) { await onFilm; await sleep(1800); pamEl.textContent = WIN.pam; asideEl.textContent = ''; await sleep(2600); asideEl.textContent = WIN.aside; await give; }
      else { await sleep(700); pamEl.textContent = WIN.pam; asideEl.textContent = ''; await sleep(1600); asideEl.textContent = WIN.aside; await sleep(1400); }
      stage.classList.remove('serving');
      btn.lock(); await celebrate();
      return;
    }
    S.dry++; save();
    await almost();
    btn.next(S.dry % 3 === 0 ? 'Try your luck again' : 'Order another');
  });

  if (test) {
    $('#beanSim', root).addEventListener('click', () => {
      let w = 0; const N = 1000; for (let i = 0; i < N; i++) if (roll(odds)) w++;
      $('#beanSimOut', root).textContent = `${w} coffees in ${N} customers (expected about ${Math.round(N / odds)} at 1 in ${odds}). At the real 1 in 100, expect about 10.`;
    });
    $('#beanShowWin', root).addEventListener('click', () => { btn.lock(); celebrate('new'); });
    $('#beanShowOld', root).addEventListener('click', () => { btn.lock(); celebrate('old'); });
  }
  // the planet's own sound on arrival, if the sounds are on and the clips are there
  try { const z = MAZE_ASSETS && MAZE_ASSETS['planet-zee']; if (z && z.sounds) document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind: 'planet', slug: 'planet-zee' } })); } catch (e) { }
  return () => {
    dead = true; cancelAnimationFrame(idleRaf); cancelAnimationFrame(confettiRaf); stopAll();
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => removeEventListener(ev, kick)); document.removeEventListener('visibilitychange', kick);
    if (song) { try { song.pause(); } catch (e) { } song = null; bus.release('bean'); }
    try { Object.values(films).forEach(g => { g.pause(); g.removeAttribute('src'); g.load(); }); root.querySelectorAll('#beanWin video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); } catch (e) { }
  };
}
