/* BRAIN BEAN COFFEE. Planet Zee's coffee shop, where 1 in 100 customers actually gets a coffee and the wait has become the attraction
   (Pierce, 2026-10-08). Pam works the counter, Craig the register, Barry waits in line. You order; the roll is honest, one in a hundred,
   from the browser's own random bytes; Pam almost hands it over a dozen different ways; and if you are the one, a zombie celebration of
   dopamine the likes of which the world has never seen, in first person. The button is Pierce's living button: thin white outline,
   transparent inside, white text, width animating on 400ms, a narrator as much as a control: press, it answers, holds 2.4 seconds, leaves,
   and the next line arrives. Test mode (#/games/brain-bean/test) sets the odds to 1 in 5 and can run a thousand customers to check the math. */
import { MAZE_ASSETS } from '../maze/assets.js';

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
function roll(odds) {
  const a = new Uint32Array(1); crypto.getRandomValues(a);
  return a[0] % odds === 0;
}

/* the faces: Pierce's official images land here; until then the counter stands in for them */
export const FACES = {
  barry: 'https://static.wixstatic.com/media/c626e3_d92d4c1e7d3444c78d629d775cb62708~mv2.png/v1/fit/w_600,h_600,q_85/p.png',
  // Pierce's own Pam and Craig (PamPhotoshop.png and CraigMain.png from his Wix library), resized only
  pam: 'img/bean/pam.webp', craig: 'img/bean/craig.webp',
};
const STILL = 'img/full/ptu-zee-3.webp';
/* a url inside a style attribute's custom property resolves against the stylesheet, not the page: make it absolute */
const abs = u => /^https?:|^data:/.test(u) ? u : new URL(u, document.baseURI).href;
/* Pam: the right one is Pierce's PamPhotoshop.png, the diner Pam at her counter under the sign (Pierce, 2026-10-08: "you got the right
   craig but not the right pam"). She is the scene. Her films come from this frame, first and last (his technique), and land in the
   map below as they are made; until then she holds the counter as a still, and the drawn cup does the almost-giving. The 2024
   apron clips were a different Pam and are out. */
const PAM = {
  still: 'https://static.wixstatic.com/media/6c593b_fdfd6e5873d44fd28b4adf464325e6a2~mv2.png/v1/fit/w_1600,h_900,q_85/p.png',
  idle: '',
};
const FILMED = ['slide', 'hand', 'pour'];                 // gestures whose film carries the cup, so the drawn cup stays off
const GESTURES = ['hands', 'point', 'slide', 'hand', 'pour', 'twirl'].filter(k => PAM[k]);
const WIN_VIDEO = 'vid/brain-bean-win.mp4';     // the first-person celebration, when it lands (Flow)

/* the almost-gives: twelve ways Pam does not hand it over. `cup` is how the cup moves. */
const ALMOST = [
  { pam: "Here you g— oh. That one's for the gentleman who's been here since Tuesday.", cup: 'slide', clip: 'slide', aside: 'Barry nods. Barry has been here since several Tuesdays.' },
  { pam: "Decaf? We don't do decaf. We don't do caf either, mostly.", cup: 'lift', aside: 'Craig rings up nothing, out of habit.' },
  { pam: "Craig, is this the winner? Craig says no.", cup: 'register', aside: 'Craig did not look up.' },
  { pam: "So close. The foam said no.", cup: 'tilt', aside: 'The foam had drawn a heart, then thought better of it.' },
  { pam: "I'm legally required to pour this one out. Planet Zee statute one-in-a-hundred.", cup: 'pour', clip: 'pour', aside: 'The sink is the most popular customer.' },
  { pam: "You're ninety-nine. Ninety-nine is the best number that isn't a hundred.", cup: 'slide', clip: 'point', aside: 'A Zeeombie behind you crumbles a little, politely.' },
  { pam: "Barry says you have the look of someone who gets coffee. Barry has said that every day for a decade.", cup: 'lift', aside: 'Barry gives you a thumbs up with the arm he has.' },
  { pam: "Hold this. No, give it back. Policy.", cup: 'hand', clip: 'hand', aside: 'For one second it was warm.' },
  { pam: "This one's a tester. Testers go to the sink. The sink is doing great.", cup: 'pour', clip: 'pour', aside: 'Craig writes TESTER on a cup that is already in the sink.' },
  { pam: "I'd give it to you, but this cup is already assigned to a ghost.", cup: 'slide', clip: 'slide', aside: 'The ghost is also waiting. The ghost is fine with it.' },
  { pam: "That was the one. I felt it. Craig didn't ring it up. Craig.", cup: 'register', clip: 'hands', aside: 'Craig rings up the next one instead, which is also not yours.' },
  { pam: "Come back tomorrow. Tomorrow has the same odds, but the lighting's better.", cup: 'tilt', aside: 'The lighting is, in fairness, very good.' },
];
const WIN = {
  pam: "That's a coffee. That's an actual coffee. CRAIG.",
  aside: 'Craig rang it up. Barry stood. The line applauded like a thing had happened, because a thing had happened.',
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

export function mount(root, slug) {
  const test = slug === 'test';
  const odds = test ? 5 : ODDS;
  const S = { orders: store.get('orders', 0), wins: store.get('wins', 0), seen: store.get('seen', []), dry: store.get('dry', 0) };
  let dead = false, beat = 0;
  root.innerHTML = `<div class="bean-page">
    <div class="bean-head"><span class="kicker">Planet Zee · Brain Bean Coffee</span><h1>BRAIN BEAN COFFEE</h1>
      <p>One in a hundred customers gets the coffee. The wait has become the attraction.${test ? ' <b class="test">TEST MODE · 1 in 5</b>' : ''}</p></div>
    <div class="bean-stage">
      <div class="scene">
        <div class="shop" style="background-image:url(${STILL})"></div>
        <div class="pam-film" style="background-image:url(${PAM.still})">${PAM.idle ? `<video class="pamv on" muted playsinline preload="auto" src="${PAM.idle}"></video>` : ''}${GESTURES.map(k => `<video class="pamg" data-k="${k}" muted playsinline preload="auto" src="${PAM[k]}"></video>`).join('')}</div>
        <div class="counter"><div class="cup" aria-hidden="true"><i class="lid"></i><i class="sleeve"></i><em class="steam"></em></div></div>
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
        ${test ? '<div class="sim"><button type="button" class="ghostbtn" id="beanSim">Run 1,000 customers</button><span id="beanSimOut"></span></div>' : ''}
      </div>
    </div>
    <div class="win" id="beanWin" hidden><video class="winv" playsinline muted preload="none"></video><div class="burst" aria-hidden="true"></div><div class="wincopy"><span class="kicker">Customer #<b id="beanWinNo"></b></span><h2>You got the coffee.</h2><p>The one in a hundred. Pam is still looking at the cup. Craig rang it up twice to be sure.</p><div class="winbtn" id="beanWinBtn"></div></div></div>
  </div>`;
  const pamEl = $('#beanPam', root), asideEl = $('#beanAside', root), cup = $('.cup', root), stage = $('.bean-stage', root);
  const btn = livingButton($('#beanBtn', root));
  btn.reserve(['Order a coffee', 'Pam heard you', 'Order another', 'Try your luck again', 'Drink it']);
  btn.next('Order a coffee');
  const paint = () => { $('#beanNo', root).textContent = '#' + (S.orders + 1); $('#beanOrders', root).textContent = S.orders; $('#beanWins', root).textContent = S.wins; };
  const save = () => { store.set('orders', S.orders); store.set('wins', S.wins); store.set('seen', S.seen); store.set('dry', S.dry); };
  const move = how => { cup.className = 'cup'; void cup.offsetWidth; cup.classList.add(how); };
  // Pam: the idle film forward, then stepped back to its start, never a hard loop; a gesture starts on the idle's first frame and ends on it
  const pamv = $('.pamv', root); let pamRev = false, pamRaf = 0, pamBusy = false, pamStep = 1 / 50;
  const pamTick = () => {
    pamRaf = requestAnimationFrame(pamTick);
    if (dead || pamBusy || !pamv || pamv.readyState < 2) return;
    if (pamRev) { pamv.currentTime = Math.max(0, pamv.currentTime - pamStep); if (pamv.currentTime <= 0.04) { pamRev = false; if (!maybeTwirl()) pamv.play().catch(() => { }); } }
    else if (pamv.ended || (isFinite(pamv.duration) && pamv.currentTime >= pamv.duration - 0.06)) { pamRev = true; pamv.pause(); }
  };
  if (pamv) { pamv.play().catch(() => { }); pamRaf = requestAnimationFrame(pamTick); }
  const kick = () => { if (!dead && pamv && pamv.paused && !pamBusy) pamv.play().catch(() => { }); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, kick, { passive: true }));
  document.addEventListener('visibilitychange', kick);
  const films = {}; root.querySelectorAll('.pamg').forEach(v => { films[v.dataset.k] = v; });
  // before a gesture the idle is stepped back to its first frame, a little faster than usual, so the cut lands frame on frame
  const rewind = () => new Promise(res => {
    if (!pamv || pamv.readyState < 2 || pamv.currentTime <= 0.05) return res();
    pamRev = true; pamStep = 1 / 8; pamv.pause();
    const t0 = Date.now();
    const poll = () => { if (dead || !pamRev || pamv.currentTime <= 0.05 || Date.now() - t0 > 2600) { pamStep = 1 / 50; res(); } else requestAnimationFrame(poll); };
    requestAnimationFrame(poll);
  });
  // a gesture: its own preloaded film, shown over the idle for its length, then the idle again from its first frame (the same frame);
  // onStart fires when the film is actually showing, so the words can land on the picture
  const pamPlay = async (key, onStart) => {
    const g = films[key];
    if (!g || !pamv) { if (onStart) onStart(); return false; }
    await rewind();
    if (dead) { if (onStart) onStart(); return false; }
    pamBusy = true; pamRev = false; lastTwirl = Date.now();
    return new Promise(res => {
      let done = false;
      const back = () => {
        if (done) return; done = true; g.onended = null; g.onerror = null;
        try { pamv.pause(); pamv.currentTime = 0; } catch (e) { }
        pamv.classList.add('on'); g.classList.remove('on');
        pamv.play().catch(() => { }); pamBusy = false; res(true);
      };
      const show = () => { g.classList.add('on'); pamv.classList.remove('on'); try { pamv.pause(); } catch (e) { } if (onStart) onStart(); };
      g.onended = back; g.onerror = () => { if (onStart) onStart(); back(); };
      try { g.currentTime = 0; } catch (e) { }
      const p = g.play();
      if (p && p.then) p.then(show).catch(() => { if (onStart) onStart(); back(); }); else show();
      setTimeout(() => { if (!done) back(); }, 9500);
    });
  };
  // her idle has a hair twirl in it: now and then, as the idle steps back onto its first frame, she twirls once and lands on that frame again
  let lastTwirl = Date.now();
  const maybeTwirl = () => { if (Date.now() - lastTwirl > 14000 && Math.random() < 0.5) { pamPlay('twirl'); return true; } return false; };

  const almost = async () => {
    // a dozen almost-gives, each seen once before any repeats
    if (S.seen.length >= ALMOST.length) S.seen = [];
    let i; do { i = Math.floor(Math.random() * ALMOST.length); } while (S.seen.includes(i) && S.seen.length < ALMOST.length);
    S.seen.push(i);
    const a = ALMOST[i];
    const filmed = a.clip && FILMED.includes(a.clip) && films[a.clip];
    stage.classList.add('serving'); stage.classList.toggle('filmed', !!filmed); sfx('pop');
    let started; const onFilm = new Promise(r => { started = r; });
    const gesture = a.clip && films[a.clip] ? pamPlay(a.clip, started) : null;
    if (filmed) {
      // the cup is in her hands on film, so the drawn one stays off; the line lands as she brings it up, the aside as she takes it back
      move('off');
      await onFilm; await sleep(1600);
      pamEl.textContent = a.pam; asideEl.textContent = '';
      await sleep(3600);
      asideEl.textContent = a.aside;
      await gesture;
      await sleep(400);
      move('rest');
    } else {
      move('come');
      await sleep(900);
      pamEl.textContent = a.pam; asideEl.textContent = '';
      move(a.cup);
      await sleep(1400);
      if (gesture) await gesture;
      asideEl.textContent = a.aside;
      await sleep(900);
      move('rest');
    }
    stage.classList.remove('serving', 'filmed');
  };
  const celebrate = async () => {
    const win = $('#beanWin', root); win.hidden = false; requestAnimationFrame(() => win.classList.add('on'));
    $('#beanWinNo', root).textContent = S.orders;
    const v = $('.winv', win);
    v.src = WIN_VIDEO; v.muted = false; v.volume = 0.7; v.play().catch(() => { v.muted = true; v.play().catch(() => { }); });
    v.addEventListener('error', () => win.classList.add('novideo'), { once: true });
    sfx('chime'); setTimeout(() => sfx('chime'), 400); setTimeout(() => sfx('ding'), 900);
    document.dispatchEvent(new CustomEvent('fv:unlock', { detail: { key: 'brain-bean' } }));
    const wb = livingButton($('#beanWinBtn', win)); wb.reserve(['Drink it', 'Back to the line']); wb.next('Drink it');
    wb.press(async () => { await wb.say('Tastes like a Tuesday.'); win.classList.add('sipped'); wb.next('Back to the line'); wb.press(async () => { win.classList.remove('on'); await sleep(500); win.hidden = true; try { v.pause(); } catch (e) { } pamEl.textContent = 'What can I almost get you?'; asideEl.textContent = ''; move('rest'); btn.next('Order a coffee'); btn.unlock(); }); });
  };

  btn.press(async () => {
    if (dead) return;
    S.orders++; paint();
    await btn.say('Pam heard you.');
    const won = roll(odds);
    if (won) {
      S.wins++; S.dry = 0; save(); paint();
      stage.classList.add('serving'); move('come'); await sleep(900);
      pamEl.textContent = WIN.pam; asideEl.textContent = ''; move('give'); await sleep(1200);
      asideEl.textContent = WIN.aside; await sleep(1200);
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
  }
  // the planet's own sound on arrival, if the sounds are on and the clips are there
  try { const z = MAZE_ASSETS && MAZE_ASSETS['planet-zee']; if (z && z.sounds) document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind: 'planet', slug: 'planet-zee' } })); } catch (e) { }
  return () => { dead = true; cancelAnimationFrame(pamRaf); ['pointerdown', 'keydown', 'touchstart'].forEach(ev => removeEventListener(ev, kick)); document.removeEventListener('visibilitychange', kick); try { if (pamv) { pamv.pause(); pamv.removeAttribute('src'); pamv.load(); } Object.values(films).forEach(g => { g.pause(); g.removeAttribute('src'); g.load(); }); } catch (e) { } };
}
