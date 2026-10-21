/* Wishbones: the planets pay, the ship charges (Pierce, 2026-10-21; the rates are his own Finding SOLACE rules where they exist).
   PREVIEW ONLY: app.js loads this file only in a browser that opened a ?wallet link, so nobody else sees a thing.
   Everything lives on this device (fv.wb). Wishbones are never sold and never cashed out: a ticket stub, not money.
   Earn: a song heard to the end, a champion beaten, the Duck held under, Pam's coffee, a trophy.
   Spend: Brad's 50-50 slug, 1,000 a lick (Pierce's pick, 2026-10-21). His canon: half the time transcendence, half the time the cave, alternating, not random. */
import { mount as mountMedia, speakerHTML, vplayHTML } from './media.js';
import * as sfx from './sfx.js';
import { bus } from './bus.js';

const KEY = 'fv.wb';
const COIN = 'https://static.wixstatic.com/media/c626e3_3084fcb3b7f64b0e80dd13df86fa5438~mv2.png/v1/fill/w_96,h_96/coin.png';
const HQ_FILM = 'f08d21_b327eb573f7a42c6a2daaa6b0e103b9b';   // PTU-Radio Headquarters: the dish on the asteroid
const still = id => `https://static.wixstatic.com/media/${id}f000.jpg/v1/fill/w_1280,h_720,q_80/p.jpg`;
const film = (id, q) => `https://video.wixstatic.com/video/${id}/${q || (innerWidth < 760 ? 480 : 720)}p/mp4/file.mp4`;

// Brad's 50-50 slug. Both halves are his own films; after each one, a being's testimonial from Brad's deck (with sound), a different one every lick
const SLUG = {
  price: 1000, page: '#/t/ptu-oogh-iv-3', pic: '6c593b_872b7771c45747f4b95af5fcdb64fd5b',
  up: { id: '0caac7_fea62d2fa12a4263831c87b9dbfaa3f3', big: 'Transcendence', line: 'Half the time, it\'s transcendence.' },
  cave: { id: '6c593b_936432e157574d7bb92f7b597002da27', big: 'The cave', line: 'The other half, you wake up three days later in a cave you don\'t remember entering.' },
  said: [['0caac7_03477a2b15b847e88aaca0eff89b54a9', 'The Comediums'], ['0caac7_66b957b3524c4c1ab7255a546255770f', 'The Copycats'], ['0caac7_5f2751214589497db5a7ecbb8e0791ef', 'The Yarnians'],
    ['0caac7_55c0db47c4674a819d124435d4d97fc6', 'The Stringers'], ['0caac7_f860a7ef20bd48198cc6a90fc77bf8c4', 'The Hungarians'], ['0caac7_d409269d3ed5451984fc1985d01e752f', 'The Figurians'],
    ['0caac7_af01d99b21684c94ae683060d75e03b1', 'The Zeeombies'], ['0caac7_69c9c7d1160d496a9e5bc9b824c826e2', 'The Tikatikatikas'], ['0caac7_afa9ed189c7d409792064e5de028a758', 'The Aptors'],
    ['0caac7_8aa286c302af4ae687a7b2f2eda4ca7e', 'The Dragoons'], ['0caac7_02647a44abca460b85cd559afe104fff', 'The Poppies'], ['0caac7_d28c736c81ed42d1b2f8f59d9f11a3c6', 'The Stoners']],
};

// what pays (gold = his Finding SOLACE numbers; the games had no rates, these are in the same scale: his radio pays ~67 a minute)
export const RATES = { song: 200, board: 200, chessWin: 2000, chessDraw: 600, duckSecond: 20, coffeeFirst: 10000, coffee: 1000, trophy: 1000 };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = v => Math.round(v).toLocaleString('en-US');
let W = load();
function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && typeof v.bal === 'number') return v; } catch (e) { }
  return { bal: 0, log: [], once: {}, open: {} };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) { /* private mode: the wallet lasts the visit */ } }
export const balance = () => W.bal;
function spend(amt, why) {
  if (W.bal < amt) return false;
  W.bal -= amt;
  W.log.unshift({ at: Date.now(), n: -amt, why });
  W.log.length = Math.min(W.log.length, 60);
  save(); paint();
  return true;
}

export function earn(amt, why, once, quiet) {
  amt = Math.round(amt);
  if (!(amt > 0) || (once && W.once[once])) return false;
  if (once) W.once[once] = 1;
  W.bal += amt;
  W.log.unshift({ at: Date.now(), n: amt, why });
  W.log.length = Math.min(W.log.length, 60);
  save(); paint(amt, quiet ? '' : why);
  return true;
}
// ---------- the coin in the bar: his Wishbones & TEE-HEES coin and the balance; it pulses and says +N when something pays
let coin, toast, toastT;
function paint(amt, why) {
  document.querySelectorAll('.wb-dn').forEach(x => { x.textContent = n(W.bal); });
  if (coin) {
    coin.querySelector('.n').textContent = n(W.bal);
    if (amt) { coin.classList.remove('hit'); void coin.offsetWidth; coin.classList.add('hit'); }
  }
  const big = document.getElementById('wbBig');
  if (big) big.textContent = n(W.bal);
  if (document.getElementById('wbLedger')) ledger();
  document.querySelectorAll('.wb-slug').forEach(slugPaint);
  if (amt && why && toast) {
    toast.innerHTML = `<img src="${COIN}" alt=""><b>+${n(amt)}</b><span>${esc(why)}</span>`;
    toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 3600);
    sfx.play('chime');
  }
}

export function init(o = {}) {
  css();
  const tools = document.querySelector('#bar .tools');
  coin = document.createElement('a');
  coin.className = 'wb-coin'; coin.href = '#/hq'; coin.title = 'Your Wishbones, at PTU Radio HQ';
  coin.innerHTML = `<img src="${COIN}" alt="" width="48" height="48"><span class="n">0</span><span class="sr">Wishbones</span>`;
  tools.prepend(coin);
  toast = document.createElement('div');
  toast.className = 'wb-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  paint();
  // the first Wishbones and the card that explains them wait for the logo reveal to fold into the bar
  const first = () => document.body.classList.contains('ident-on') ? setTimeout(first, 400) : setTimeout(() => { if (earn(RATES.board, 'Your first Wishbones. Listen and play to get more.', 'board', true)) intro(); }, 700);
  setTimeout(first, 600);
  if (o.test) setTimeout(() => earn(SLUG.price, 'Test Wishbones from the preview link', 'test'), 5200);   // enough for one lick, once

  document.addEventListener('fv:event', e => {
    const d = e.detail || {};
    if (d.kind === 'song') earn(RATES.song, `A full song${d.title ? ': ' + d.title : ''}`);
    else if (d.kind === 'duck') { const s = Math.floor((d.ms || 0) / 1000); if (s > 0) earn(s * RATES.duckSecond, `The Duck, ${s} second${s === 1 ? '' : 's'} under`); }
    else if (d.kind === 'chess' && d.result === 'win') earn(RATES.chessWin, `Beat ${d.name || 'a champion'} at Over the Board`);
    else if (d.kind === 'chess' && d.result === 'draw') earn(RATES.chessDraw, `A draw with ${d.name || 'a champion'}`);
    else if ((d.kind === 'award' || d.kind === 'secret') && d.fresh && d.key !== 'brain-bean') earn(RATES.trophy, `A trophy: ${trophyName(d.key)}`);
  });
  // Pam's coffee: the 1 in 100. The first one is the big one (his "gift shop credit" number), every one after pays too
  document.addEventListener('fv:unlock', e => {
    if ((e.detail || {}).key !== 'brain-bean') return;
    if (!earn(RATES.coffeeFirst, 'Pam gave you the coffee. One in a hundred.', 'coffee')) earn(RATES.coffee, 'Pam gave you the coffee again');
  });
}
// the first time only: one card under the coin that says what this is, in plain words
function intro() {
  const box = document.createElement('div');
  box.className = 'wb-intro'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'What Wishbones are');
  box.innerHTML = `<img src="${COIN}" alt=""><div><b>These are Wishbones, FictionVision's points.</b>
    <p>Hear a song all the way through: +200. Beat a chess champion: +2,000. Spend 1,000 at Brad's Pharmacy to lick his 50-50 slug. The coin up top keeps your total.</p>
    <div class="row"><a class="cta small" href="#/hq">See mine</a><button type="button" class="ghost small">Got it</button></div></div>`;
  document.body.appendChild(box);
  const go = () => { box.classList.remove('on'); setTimeout(() => box.remove(), 400); };
  box.querySelector('a').addEventListener('click', go);
  box.querySelector('button').addEventListener('click', go);
  requestAnimationFrame(() => box.classList.add('on'));
}
function trophyName(key) {
  const T = (window.FV && FV.trophies) || {};
  for (const k of Object.keys(T)) { const x = Array.isArray(T[k]) && T[k].find(t => t.key === key); if (x && x.name) return x.name; }
  return String(key || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---------- PTU Radio HQ: where your Wishbones live
const EARN = [
  ['Every song you hear to the end', 'Any station on PTU Radio', RATES.song, '#/music'],
  ['Beat a planet\'s champion', 'Over the Board, thirteen champions', RATES.chessWin, '#/games/over-the-board'],
  ['Hold the Duck under', 'Every second it stays down', RATES.duckSecond, '#/games/the-duck', ' a second'],
  ['Get Pam to give you the coffee', 'Brain Bean, one in a hundred', RATES.coffeeFirst, '#/games/brain-bean', ' the first time'],
  ['Earn a trophy', 'Any one in the Trophy Room', RATES.trophy, '#/trophies'],
];
let root = null;
export function page(el) {
  root = el;
  el.innerHTML = `<div class="wb-hq">
    <section class="mast mv wb-mast">
      <div class="vwrap"><div class="vstage" data-vid="${HQ_FILM}" data-kind="main"><img class="still" src="${still(HQ_FILM)}" alt="" width="1280" height="720" decoding="async"><video muted playsinline preload="none" aria-hidden="true"></video>${speakerHTML}${vplayHTML}</div></div>
      <div class="shade"></div>
      <div class="copy"><span class="kicker">PTU Radio HQ · your Wishbones</span><h1><span id="wbBig">${n(W.bal)}</span> <span class="unit">Wishbones</span></h1>
        <p>Wishbones are FictionVision's points. You get them for listening and playing, and this is where your total lives.</p></div>
    </section>
    <section class="wb-sec"><h2>How to get more</h2>
      <div class="wb-earn">${EARN.map(([h, s, amt, href, tail]) => `<a class="wb-e" href="${href}"><b class="amt">+${n(amt)}<small>${tail || ''}</small></b><span class="h">${h}</span><span class="s">${s}</span></a>`).join('')}</div>
    </section>
    <section class="wb-sec"><h2>What they buy</h2>
      <a class="wb-buy" href="${SLUG.page}"><img src="${still(SLUG.pic)}" alt="" loading="lazy"><span class="tx"><span class="kicker">Brad's "Pharmacy" · OOGH-IV</span><b>Lick Brad's 50-50 slug</b><span>Half the time, it's transcendence. The other half, you wake up in a cave. Then one of the beings tells you how theirs went.</span></span><span class="price">${n(SLUG.price)}</span></a>
    </section>
    <section class="wb-sec"><h2>What you've earned</h2><ol class="wb-ledger" id="wbLedger"></ol>
      <p class="wb-fine">Wishbones aren't money: nobody can buy them or cash them out. They're kept in this browser, so a phone and a laptop each have their own. <button type="button" class="wb-reset" id="wbReset">Start over</button></p>
    </section>
  </div>`;
  ledger();
  el.querySelector('#wbReset').addEventListener('click', () => { W = { bal: 0, log: [], once: {}, open: {} }; save(); earn(RATES.board, 'Your first Wishbones. Listen and play to get more.', 'board'); });
  const off = mountMedia(el);
  return () => { root = null; if (typeof off === 'function') off(); };
}
// ---------- Brad's page: the slug, right under his buttons
export function slug(info) {
  const row = info && info.querySelector('.mrow'); if (!row) return () => { };
  const box = document.createElement('div');
  box.className = 'wb-slug';
  box.innerHTML = `<img class="pic" src="${still(SLUG.pic)}" alt="" loading="lazy"><div class="tx"><span class="kicker">Brad's 50-50 slug · ${n(SLUG.price)} Wishbones</span>
    <p>Half the time, it's transcendence. The other half, you wake up three days later in a cave.</p>
    <div class="go"><button type="button" class="cta wb-lick">Lick the slug</button><small class="have"></small></div></div>`;
  row.after(box);
  box.querySelector('.wb-lick').addEventListener('click', lick);
  slugPaint(box);
  return () => box.remove();
}
function slugPaint(box) {
  const b = box.querySelector('.wb-lick'), have = box.querySelector('.have'), short = SLUG.price - W.bal;
  b.disabled = short > 0;
  b.textContent = short > 0 ? 'Lick the slug' : `Lick the slug · ${n(SLUG.price)}`;
  const songs = Math.ceil(short / RATES.song);
  have.innerHTML = short > 0 ? `You have ${n(W.bal)}. ${n(short)} more: hear ${songs} song${songs === 1 ? '' : 's'} to the end. <a href="#/hq">More ways</a>`
    : `You have ${n(W.bal)}.${W.licks ? ` Licked ${W.licks} time${W.licks === 1 ? '' : 's'}.` : ''}`;
}
function lick() {
  if (!spend(SLUG.price, 'Licked Brad\'s 50-50 slug')) return;
  const k = W.licks || 0;
  W.licks = k + 1; save();
  const half = k % 2 === 0 ? SLUG.up : SLUG.cave, [sid, who] = SLUG.said[k % SLUG.said.length];
  W.log[0].why = `Licked Brad's 50-50 slug: ${half.big.toLowerCase()}`; save(); paint();
  screening([{ id: half.id, kicker: 'Brad\'s 50-50 slug', big: half.big, line: half.line }, { id: sid, kicker: 'Brad\'s testimonials', big: who, line: 'One lick later.' }]);
}
// the films one after another, full screen, then back to the page. Sound follows the bar's switch, and a button turns it on here too
function screening(parts) {
  const box = document.createElement('div');
  box.className = 'wb-screen'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', parts[0].big);
  box.innerHTML = `<video playsinline></video><div class="cap"><span class="kicker"></span><b></b><span class="ln"></span></div>
    <div class="ctl"><button type="button" class="wb-snd"></button><button type="button" class="wb-x">Back to Brad's</button></div>`;
  document.body.appendChild(box);
  const v = box.querySelector('video'), snd = box.querySelector('.wb-snd');
  let loud = sfx.isOn(), i = 0, done = false;
  const sound = () => { v.muted = !loud; snd.textContent = loud ? 'Sound off' : 'Sound on'; if (loud) bus.claim('wb'); else bus.release('wb'); };
  const close = () => { if (done) return; done = true; v.pause(); bus.release('wb'); box.classList.remove('on'); setTimeout(() => box.remove(), 400); removeEventListener('keydown', key); document.removeEventListener('visibilitychange', back); };
  const key = e => { if (e.key === 'Escape') close(); };
  // a phone pauses a film when you leave the tab; coming back picks it up where it stopped
  const back = () => { if (!document.hidden && !done && v.paused && !v.ended) v.play().catch(() => { }); };
  const next = () => {
    if (i >= parts.length) return close();
    const p = parts[i++];
    box.querySelector('.kicker').textContent = p.kicker; box.querySelector('b').textContent = p.big; box.querySelector('.ln').textContent = p.line;
    v.onerror = () => { v.onerror = null; v.src = film(p.id, 480); v.play().catch(() => { }); };   // some of the older films only come in 480p
    v.src = film(p.id);
    v.play().catch(() => { loud = false; sound(); v.play().catch(() => { }); });
  };
  v.addEventListener('ended', next);
  snd.addEventListener('click', () => { loud = !loud; sound(); });
  box.querySelector('.wb-x').addEventListener('click', close);
  addEventListener('keydown', key);
  document.addEventListener('visibilitychange', back);
  sound();
  requestAnimationFrame(() => box.classList.add('on'));
  next();
}

function ledger() {
  const ol = root && root.querySelector('#wbLedger'); if (!ol) return;
  ol.innerHTML = W.log.length ? W.log.slice(0, 15).map(x => `<li class="${x.n < 0 ? 'out' : ''}"><span>${esc(x.why)}</span><b>${x.n < 0 ? '−' : '+'}${n(Math.abs(x.n))}</b></li>`).join('')
    : '<li class="none"><span>Nothing yet. Put a song on and let it play to the end.</span></li>';
}

function css() {
  if (document.getElementById('wb-css')) return;
  const s = document.createElement('style'); s.id = 'wb-css';
  s.textContent = `
.wb-coin { display: flex; align-items: center; gap: 6px; padding: 4px 10px 4px 4px; border-radius: 999px; border: 1px solid rgba(255,200,87,.45); background: rgba(255,200,87,.08); font: 600 var(--fs-small)/1 var(--display); color: var(--gold); font-variant-numeric: tabular-nums; white-space: nowrap; }
.bar .mylist-link { white-space: nowrap; }
.wb-coin img { width: 26px; height: 26px; border-radius: 50%; }
.wb-coin:hover { background: rgba(255,200,87,.16); }
.wb-coin.hit img { animation: wbSpin .9s cubic-bezier(.2,.8,.2,1); }
.wb-coin.hit { animation: wbGlow 1.2s ease-out; }
@keyframes wbSpin { from { transform: rotateY(0) scale(1.25); } to { transform: rotateY(720deg) scale(1); } }
@keyframes wbGlow { 0% { box-shadow: 0 0 0 0 rgba(255,200,87,.7); } 100% { box-shadow: 0 0 0 14px rgba(255,200,87,0); } }
/* phones: the bar stays exactly as it was (the logo needs the room); the balance sits in the menu and the +N still pops */
@media (max-width: 560px) { .bar .wb-coin { display: none; } }
.wb-dn { color: var(--gold); font-variant-numeric: tabular-nums; margin-left: 6px; }
.wb-toast { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(var(--bar-h) + 10px); z-index: 60; display: flex; align-items: center; gap: 10px; padding: 10px 16px 10px 10px; border-radius: 12px; background: #1c1c26; border: 1px solid rgba(255,200,87,.5); box-shadow: 0 20px 40px -20px #000; transform: translateY(-12px); opacity: 0; visibility: hidden; transition: opacity .3s, transform .35s cubic-bezier(.2,.8,.2,1), visibility .3s; max-width: min(420px, calc(100vw - 32px)); }
.wb-toast.on { opacity: 1; transform: none; visibility: visible; }
.wb-toast img { width: 32px; height: 32px; border-radius: 50%; flex: none; }
.wb-toast b { font: 700 20px/1 var(--display); color: var(--gold); font-variant-numeric: tabular-nums; }
.wb-toast span { font-size: var(--fs-small); }
.wb-mast .copy h1 { font-size: var(--fs-bb); font-variant-numeric: tabular-nums; }
.wb-mast .copy h1 #wbBig { color: var(--gold); }
.wb-mast .copy h1 .unit { font-size: .45em; letter-spacing: .02em; }
.wb-sec { padding: clamp(24px, 3vw, 48px) var(--gutter) 0; display: grid; gap: 16px; }
.wb-sec h2 { font: 700 clamp(20px, calc(10px + 1.1vw), 32px)/1.1 var(--display); margin: 0; }
.wb-earn { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.wb-e { display: grid; gap: 4px; align-content: start; padding: 16px; border-radius: var(--radius); background: var(--bg-2); border: 1px solid var(--line); transition: border-color .2s, transform .2s; }
.wb-e:hover { border-color: var(--gold); transform: translateY(-2px); }
.wb-e .amt { font: 700 clamp(22px, 2vw, 30px)/1 var(--display); color: var(--gold); font-variant-numeric: tabular-nums; }
.wb-e .amt small { font: 500 13px/1 var(--ui); color: var(--gold); opacity: .8; }
.wb-e .h { font-weight: 600; }
.wb-e .s { font-size: var(--fs-small); opacity: .75; }
@media (max-width: 960px) { .wb-earn { grid-template-columns: 1fr; gap: 0; } .wb-e { grid-template-columns: 6.5em 1fr; gap: 2px 14px; border-radius: 0; border-width: 0 0 1px; background: none; padding: 12px 0; } .wb-e .amt { grid-row: span 2; align-self: center; font-size: 22px; } .wb-e .amt small { display: block; margin-top: 4px; } .wb-e:hover { transform: none; } }
.wb-ledger { list-style: none; margin: 0; padding: 0; display: grid; max-width: 760px; }
.wb-ledger li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.wb-ledger li span { min-width: 0; }
.wb-ledger li b { color: var(--gold); font-variant-numeric: tabular-nums; white-space: nowrap; }
.wb-ledger li.out b { color: var(--orange); }
.wb-fine { font-size: var(--fs-small); opacity: .75; margin: 0 0 clamp(32px, 5vw, 72px); max-width: 65ch; }
.wb-reset { margin-left: 8px; text-decoration: underline; color: inherit; font: inherit; }
.wb-buy { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr) auto; gap: 18px; align-items: center; padding: 14px; border-radius: var(--radius); background: linear-gradient(120deg, rgba(255,200,87,.12), rgba(255,200,87,.03)); border: 1px solid rgba(255,200,87,.45); max-width: 980px; transition: border-color .2s; }
.wb-buy:hover { border-color: var(--gold); }
.wb-buy img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; display: block; }
.wb-buy .tx { display: grid; gap: 4px; min-width: 0; }
.wb-buy .tx b { font: 700 clamp(20px, 1.8vw, 28px)/1.1 var(--display); }
.wb-buy .price { font: 700 clamp(22px, 2vw, 32px)/1 var(--display); color: var(--gold); font-variant-numeric: tabular-nums; padding-right: 8px; }
@media (max-width: 640px) { .wb-buy { grid-template-columns: 1fr; } .wb-buy .price { padding: 0; } }
.wb-slug { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 16px; align-items: center; margin: 14px 0 18px; padding: 12px; border-radius: 12px; background: linear-gradient(120deg, rgba(255,200,87,.12), rgba(255,200,87,.03)); border: 1px solid rgba(255,200,87,.45); }
.wb-slug .pic { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; display: block; }
.wb-slug .tx { display: grid; gap: 6px; min-width: 0; }
.wb-slug p { margin: 0; }
.wb-slug .go { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; }
.wb-slug .have { font-size: var(--fs-small); opacity: .85; }
.wb-slug .have a { color: var(--gold); text-decoration: underline; }
.wb-lick[disabled] { opacity: .5; cursor: default; filter: grayscale(.5); }
@media (max-width: 520px) { .wb-slug { grid-template-columns: 1fr; } }
.wb-screen { position: fixed; inset: 0; z-index: 200; background: #000; display: grid; place-items: center; opacity: 0; transition: opacity .4s; }
.wb-screen.on { opacity: 1; }
.wb-screen video { width: 100%; height: 100%; object-fit: contain; }
.wb-screen .cap { position: absolute; left: max(16px, env(safe-area-inset-left, 0px)); right: max(16px, env(safe-area-inset-right, 0px)); bottom: calc(20px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 4px; text-shadow: 0 2px 12px #000; pointer-events: none; }
.wb-screen .cap b { font: 700 clamp(26px, 3vw, 48px)/1 var(--display); color: var(--gold); }
.wb-screen .cap .ln { font-size: var(--fs-body); max-width: 50ch; }
.wb-screen .ctl { position: absolute; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(16px + env(safe-area-inset-top, 0px)); display: flex; gap: 8px; }
.wb-screen .ctl button { padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.4); background: rgba(0,0,0,.5); color: #fff; font: 600 var(--fs-small)/1 var(--ui); }
.wb-intro { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(var(--bar-h) + 10px); z-index: 61; display: flex; gap: 14px; align-items: flex-start; width: min(400px, calc(100vw - 32px)); padding: 16px; border-radius: 14px; background: #1c1c26; border: 1px solid rgba(255,200,87,.6); box-shadow: 0 30px 60px -20px #000; opacity: 0; transform: translateY(-12px); transition: opacity .35s, transform .35s cubic-bezier(.2,.8,.2,1); }
.wb-intro.on { opacity: 1; transform: none; }
.wb-intro img { width: 48px; height: 48px; border-radius: 50%; flex: none; }
.wb-intro b { font: 700 17px/1.25 var(--display); display: block; }
.wb-intro p { margin: 6px 0 12px; font-size: var(--fs-small); line-height: 1.45; }
.wb-intro .row { display: flex; gap: 8px; flex-wrap: wrap; }
.wb-intro .ghost.small { height: 2.5em; padding: 0 1.1em; font-size: calc(var(--fs-small) * 1.1); }
@media (prefers-reduced-motion: reduce) { .wb-coin.hit, .wb-coin.hit img { animation: none; } }
`;
  document.head.appendChild(s);
}
