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
/* the euphoria. The float (the old win) keeps the nebula, the disco and the five floating windows. The dance (2026-10-11, Pierce: "the old
   version but fullscreen videos, fast paced") puts his dancers full screen and cuts between them on the beat of Pulse. */
const TRIP = {
  sky: '0caac7_1ad5486d6a4e468085a5f03c1679f4dd',          // Planet Zee's nebula, from the Asteroid Show
  disco: '6c593b_d039e77764fb4c8cab94b3b64d26e2fc',        // aliens dancing under lasers
  floats: ['6c593b_848efa75153e463594cb32954850b167', '6c593b_8e01f70aaaef4430adffa4d43f10ff14', '6c593b_319ef0dbbf1f43859898065e2c6b03a1', '6c593b_b83415c9d2234dabac94b021f590f9d2', '6c593b_1a1e152c84ce4fca930b14d25b9e8d5b'],
  song: 'https://static.wixstatic.com/mp3/f08d21_c324c5edd2b84e20b2a926ccceb3ff13.mp3',   // "Pulse", Planet Zee Radio, Vol. 1
  wash: '6c593b_9f5a70e45b9644b389ef3acc6d279cf9',         // his retro colours, the colour layer over the sky
};
/* the dancers, full screen: the eight Brain Bean zombie clips shot in Flow on 2026-10-11 (Veo 3.1, a chorus line with BRAIN BEAN cups) and
   his six originals. Each clip was measured once (frame-to-frame motion at 12 fps): `peaks` are the seconds where its biggest moves
   land, so a cut can start where the next big move falls on the next beat. Choreography by editing. The coffee zombies from Flow join here. */
const DANCE = [
  { id: '6c593b_f8a3952e1ab943f8847c781c5c659ea7', dur: 8, peaks: [3.42, 3.92, 4.5, 5.25] },   // Brain Bean zombies: the barista toast (Flow, 2026-10-11)
  { id: '6c593b_499aaece47fc4bda80b1f100721e6c60', dur: 8, peaks: [1.08, 1.58, 1.92, 2.25, 2.92, 3.17, 3.92, 5.5, 6.08, 6.75, 7.33] },   // Brain Bean zombies: the dance-off, cups on heads (Flow, 2026-10-11)
  { id: '6c593b_7e256ca099e7400d98cfb99fbe1f7fc1', dur: 8, peaks: [1.58, 3.92] },   // Brain Bean zombies: the overhead kaleidoscope (Flow, 2026-10-11)
  { id: '6c593b_5ae53a3bb98b4291983e21045c31eff4', dur: 8, peaks: [2.42, 5.67, 6.67] },   // Brain Bean zombies: the body roll and the clap (Flow, 2026-10-11)
  { id: '6c593b_fcf3b452cb7948a5a08d1aab1902870e', dur: 8, peaks: [1.83, 2.33, 3.0, 3.25, 3.67, 4.0, 4.83] },   // Brain Bean zombies: the confetti line (Flow, 2026-10-11)
  { id: '6c593b_684c97c079584b1cbd55441c195e2651', dur: 8, peaks: [2.58, 3.42, 3.92, 5.92, 6.25, 7.25] },   // Brain Bean zombies: the gulp, arms up (Flow, 2026-10-11)
  { id: '6c593b_4ad9cb9c146d4d0aae8f119b33f1684d', dur: 8, peaks: [2.25, 3.17, 4.0, 4.42, 4.92] },   // Brain Bean zombies: the shimmy, coffee flying (Flow, 2026-10-11)
  { id: '6c593b_43b993b59e9c441e8128ce956fc090e3', dur: 8, peaks: [0.75, 1.33, 2.58, 3.5, 7.25] },   // Brain Bean zombies: the chorus line (Flow, 2026-10-11)
  { id: '6c593b_848efa75153e463594cb32954850b167', dur: 5.3, peaks: [0.84, 1.35, 2.69, 3.2, 3.87, 4.71] },   // zombie one
  { id: '6c593b_8e01f70aaaef4430adffa4d43f10ff14', dur: 10.7, peaks: [0.42, 0.75, 1.25, 1.67, 2.09, 3.51, 5.02, 5.43] },   // zombie two
  { id: '6c593b_319ef0dbbf1f43859898065e2c6b03a1', dur: 5.3, peaks: [0.59, 0.93, 1.43, 1.93, 2.61, 3.03, 3.95, 4.29] },   // zombie three
  { id: '6c593b_b83415c9d2234dabac94b021f590f9d2', dur: 10.7, peaks: [1.25, 1.67, 2.17, 3.09, 3.26, 3.68, 4.6, 8.61] },   // guitar zombie
  { id: '6c593b_1a1e152c84ce4fca930b14d25b9e8d5b', dur: 20.5, peaks: [12.33, 12.67, 13.25, 13.5, 14.17, 14.58, 15.33, 15.83, 16.42, 17.25, 18.25, 18.75, 18.92, 19.25, 20.08] },   // the band
  { id: '6c593b_d039e77764fb4c8cab94b3b64d26e2fc', dur: 10.5, peaks: [0.17, 1.0, 1.58, 2.0, 2.5, 3.42, 3.58, 4.83, 5.17, 5.92, 6.33, 8.42, 8.83, 9.25, 10.17] },   // aliens disco
];

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
/* the beat of the song, read from the song itself: the file is fetched and decoded once; every jump in energy at least a quarter second
   after the last is an onset; the tempo is the median gap between onsets and the grid is phased to sit on as many onsets as it can.
   Null when the file cannot be read (then a clock at Pulse's tempo stands in). */
async function beatMap(url) {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const buf = await (await fetch(url, { mode: 'cors' })).arrayBuffer();
  const ctx = new AC(); let audio; try { audio = await ctx.decodeAudioData(buf); } finally { try { ctx.close(); } catch (e) { } }
  const ch = audio.getChannelData(0), sr = audio.sampleRate, W = 1024, N = Math.floor(ch.length / W);
  const E = new Float32Array(N); for (let i = 0; i < N; i++) { let a = 0; for (let j = i * W, e = j + W; j < e; j++) a += ch[j] * ch[j]; E[i] = a / W; }
  const on = []; let avg = 0, last = -1;
  for (let i = 0; i < N; i++) { const t = i * W / sr; avg = i < 20 ? (avg * i + E[i]) / (i + 1) : avg * 0.97 + E[i] * 0.03; if (E[i] > avg * 1.6 && E[i] > 1e-4 && t - last > 0.28) { on.push(t); last = t; } }
  if (on.length < 16) return null;
  const gaps = on.slice(1).map((t, i) => t - on[i]).filter(g => g > 0.3 && g < 1.0).sort((a, b) => a - b);
  if (!gaps.length) return null;
  const period = gaps[Math.floor(gaps.length / 2)];
  let best = 0, phase = 0;
  for (let k = 0; k < 24; k++) { const ph = period * k / 24; let hits = 0; for (const t of on) { const d = Math.abs(((t - ph) % period + period) % period); if (Math.min(d, period - d) < 0.06) hits++; } if (hits > best) { best = hits; phase = ph; } }
  return { period, phase, onsets: on.length };
}
/* onBeat on every beat of the grid as the song plays, or on a 104 bpm clock when the song cannot be read; returns the stop */
function beatClock(song, grid, onBeat, isDead) {
  let raf = 0, timer = 0, n = -1;
  if (grid && song) {
    const tick = () => { if (isDead()) return; raf = requestAnimationFrame(tick); const t = song.currentTime; const k = Math.floor((t - grid.phase) / grid.period); if (k > n) { n = k; if (t - (grid.phase + k * grid.period) < 0.2) onBeat(); } };
    raf = requestAnimationFrame(tick);
  } else { const T = 576; const tick = () => { if (isDead()) return; onBeat(); timer = setTimeout(tick, T); }; timer = setTimeout(tick, T); }
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
  const odds = ODDS;   // the real odds in test mode too (Pierce, 2026-10-11); the win is on demand there anyway
  const S = { orders: store.get('orders', 0), wins: store.get('wins', 0), dry: store.get('dry', 0), deck: store.get('deck', null), last: store.get('last', '') };
  let dead = false;
  const filmKeys = Object.keys(FILMS).filter(k => FILMS[k]);
  root.innerHTML = `<div class="bean-page">
    <div class="bean-head"><span class="kicker">Planet Zee · Brain Bean Coffee</span><h1>BRAIN BEAN COFFEE</h1>
      <p>One in a hundred customers gets the coffee. The wait has become the attraction.${test ? ' <b class="test">TEST MODE</b>' : ''}</p></div>
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
        ${test ? '<div class="sim"><button type="button" class="ghostbtn" id="beanSim">Run 1,000 customers</button><button type="button" class="ghostbtn" id="beanSim2">Run 100,000 customers</button><button type="button" class="ghostbtn" id="beanShowWin">Show me the win</button><button type="button" class="ghostbtn" id="beanShowOld">Show me the old win</button><span id="beanSimOut"></span></div>' : ''}
      </div>
    </div>
    <div class="win" id="beanWin" hidden>
      <video class="sky" muted playsinline preload="none"></video>
      <video class="wash" muted playsinline preload="none"></video>
      <div class="trip" aria-hidden="true"></div>
      <div class="cuts" aria-hidden="true"></div>
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

  // ---- the euphoria. 'dance' (2026-10-11): his dancers full screen, cut on the beat of Pulse, fast: a beat a cut, half beats at the end
  // of every bar, a two-beat hold now and then; each cut starts where the dancer's next big move lands on the next beat. 'old': the float
  // alone (the nebula, the disco, the five windows), kept so the two can be compared in test mode.
  let tripStops = [], song = null, confettiRaf = 0;
  const stopAll = () => { tripStops.forEach(f => { try { f(); } catch (e) { } }); tripStops = []; };
  const celebrate = async (mode = 'dance') => {
    const win = $('#beanWin', root); win.hidden = false;
    win.classList.remove('float', 'dance', 'sipped', 'beat'); win.classList.toggle('v2', mode === 'dance');
    requestAnimationFrame(() => win.classList.add('on'));
    $('#beanWinNo', root).textContent = S.orders;
    const isDead = () => dead || win.hidden;
    const q = innerWidth < 760 ? 480 : 720;
    const sky = $('.sky', win), disco = $('.disco', win), wash = $('.wash', win), cutsEl = $('.cuts', win);
    sky.src = vurl(TRIP.sky, q); tripStops.push(pingpong(sky, isDead));
    wash.src = vurl(TRIP.wash, 480); tripStops.push(pingpong(wash, isDead));
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
    const floatOn = () => {
      win.classList.add('float');
      disco.src = vurl(TRIP.disco, q); tripStops.push(pingpong(disco, isDead));
      win.querySelectorAll('.fl video').forEach((v, i) => { v.src = vurl(v.dataset.id, 480); setTimeout(() => { if (!isDead()) tripStops.push(pingpong(v, isDead)); }, 300 + i * 350); });
    };
    if (mode === 'dance' && !calmer()) {
      win.classList.add('dance');
      const pool = DANCE.map(k => { const v = document.createElement('video'); v.className = 'cut'; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = vurl(k.id, 480); cutsEl.appendChild(v); return { k, v }; });
      let gap = 0.576, lastI = -1, nb = 0, pat = 0, hold = 0, ready = null, cur = null;
      const BAR = [1, 1, 1, 1, 1, 1, 0.5, 0.5], BAR2 = [2, 1, 1, 1, 2, 1, 0.5, 0.5], LATE = [2, 2, 1, 1, 2, 2, 1, 1];
      const pick = () => { let i; do { i = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && i === lastI); lastI = i; return pool[i]; };
      // a cut of `len` seconds, started so that one of the dancer's big moves lands one beat in
      const prepare = len => {
        const c = pick(), k = c.k;
        const ok = k.peaks.filter(p => p - gap >= 0 && p - gap + len <= k.dur - 0.15);
        const s = ok.length ? ok[Math.floor(Math.random() * ok.length)] - gap : Math.random() * Math.max(0, k.dur - len - 0.3);
        try { c.v.currentTime = s; } catch (e) { }
        return c;
      };
      const show = c => { pool.forEach(x => { if (x !== c) { x.v.classList.remove('on'); if (!x.v.paused) x.v.pause(); } }); c.v.classList.add('on'); c.v.play().catch(() => { }); cur = c; };
      const onBeat = () => {
        if (isDead()) return;
        nb++; win.classList.add('beat'); setTimeout(() => win.classList.remove('beat'), 100);
        if (hold > 0) { hold--; return; }
        const bar = nb > 64 ? LATE : (Math.floor(nb / 8) % 4 === 3 ? BAR2 : BAR);
        const len = bar[pat % bar.length]; pat++;
        if (len === 0.5) {
          pat++;                                                   // the two halves of this beat
          show(ready || prepare(gap / 2)); const half = prepare(gap / 2);
          const t = setTimeout(() => { if (!isDead()) show(half); }, gap * 500); tripStops.push(() => clearTimeout(t));
          ready = prepare(gap);
        } else {
          show(ready || prepare(gap * len)); hold = len - 1;
          ready = prepare(gap * (bar[pat % bar.length] === 0.5 ? 0.5 : bar[pat % bar.length]));
        }
      };
      const ok = await songOn; if (isDead()) return;
      const grid = ok ? await beatMap(TRIP.song).catch(() => null) : null;
      if (isDead()) return;
      if (grid) gap = grid.period;
      ready = prepare(gap); show(ready); ready = prepare(gap);
      tripStops.push(beatClock(ok ? song : null, grid, onBeat, isDead));
    } else {
      floatOn();
    }
    const host = $('#beanWinBtn', win); host.innerHTML = '';
    const wb = livingButton(host); wb.reserve(['Drink it', 'Back to the line']); wb.next('Drink it');
    wb.press(async () => { await wb.say('Tastes like everything at once.'); win.classList.add('sipped'); wb.next('Back to the line'); wb.press(async () => { await comeDown(); }); });
    const comeDown = async () => {
      if (song) { const s = song; song = null; let v = s.volume; const f = setInterval(() => { v -= 0.06; if (v <= 0) { clearInterval(f); try { s.pause(); } catch (e) { } } else s.volume = v; }, 60); }
      win.classList.remove('on'); await sleep(600); win.hidden = true;
      stopAll();
      win.querySelectorAll('video').forEach(v => { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { } v.classList.remove('on'); }); cutsEl.innerHTML = '';
      win.classList.remove('float', 'dance', 'v2', 'beat', 'sipped');
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
    const sim = N => { let w = 0; for (let i = 0; i < N; i++) if (roll(odds)) w++; $('#beanSimOut', root).textContent = `${w.toLocaleString()} coffees in ${N.toLocaleString()} customers at 1 in ${odds} (expect about ${(N / odds).toLocaleString()}, give or take ${Math.round(2 * Math.sqrt(N / odds))}).`; };
    $('#beanSim', root).addEventListener('click', () => sim(1000));
    $('#beanSim2', root).addEventListener('click', () => sim(100000));
    $('#beanShowWin', root).addEventListener('click', () => { btn.lock(); celebrate('dance'); });
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
