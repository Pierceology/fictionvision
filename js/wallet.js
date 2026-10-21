/* Wishbones: the planets pay, the ship charges (Pierce, 2026-10-21; the rates are his own Finding SOLACE rules where they exist).
   PREVIEW ONLY: app.js loads this file only in a browser that opened a ?wallet link, so nobody else sees a thing.
   Everything lives on this device (fv.wb). Wishbones are never sold and never cashed out: a ticket stub, not money.
   Earn: a song heard to the end, a champion beaten, the Duck held under, Pam's coffee, a trophy. Spend: Deck 14, Vigilant. */
import { mount as mountMedia, muteAll, speakerHTML, vplayHTML } from './media.js';
import { bus } from './bus.js';
import * as sfx from './sfx.js';

const KEY = 'fv.wb';
const COIN = 'https://static.wixstatic.com/media/c626e3_3084fcb3b7f64b0e80dd13df86fa5438~mv2.png/v1/fill/w_96,h_96/coin.png';
const HQ_FILM = 'f08d21_b327eb573f7a42c6a2daaa6b0e103b9b';   // PTU-Radio Headquarters: the dish on the asteroid
const still = id => `https://static.wixstatic.com/media/${id}f000.jpg/v1/fill/w_1280,h_720,q_80/p.jpg`;
const film = id => `https://video.wixstatic.com/video/${id}/${innerWidth < 760 ? 480 : 720}p/mp4/file.mp4`;

// what pays (gold = his Finding SOLACE numbers; the games had no rates, these are in the same scale: his radio pays ~67 a minute)
export const RATES = { song: 200, board: 200, chessWin: 2000, chessDraw: 600, duckSecond: 20, coffeeFirst: 10000, coffee: 1000, trophy: 1000 };
// what costs: Deck 14 is the one deck FictionVision never opened; the rest are his prices, shown so the ladder makes sense
const DECK14 = {
  id: 'deck14', price: 6000, name: 'Deck 14 · Vigilant',
  films: ['0caac7_79ab89c8ddc343108bbe2be1b1ef1d88', 'f08d21_a1a8be2b5f3a49a4a9b00d3e53ccad12', '0caac7_74423884fc7344e1a70940b53a7845d9'],
};
const LATER = [
  ['A stateroom on your planet\'s deck', 18000],
  ['Galax-O-Matic', 130000],
  ['Tornad-O-Matic', 130000],
  ['Blue Pill', 130000],
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = v => Math.round(v).toLocaleString('en-US');
let W = load();
function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && typeof v.bal === 'number') return v; } catch (e) { }
  return { bal: 0, log: [], once: {}, open: {} };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) { /* private mode: the wallet lasts the visit */ } }
export const balance = () => W.bal;

export function earn(amt, why, once) {
  amt = Math.round(amt);
  if (!(amt > 0) || (once && W.once[once])) return false;
  if (once) W.once[once] = 1;
  W.bal += amt;
  W.log.unshift({ at: Date.now(), n: amt, why });
  W.log.length = Math.min(W.log.length, 60);
  save(); paint(amt, why);
  return true;
}
function spend(amt, why) {
  if (W.bal < amt) return false;
  W.bal -= amt;
  W.log.unshift({ at: Date.now(), n: -amt, why });
  save(); paint();
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
  if (document.getElementById('wbLedger')) { ledger(); deck(); }
  if (amt && toast) {
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
  // the preview link with =test starts with enough to open Deck 14, so the whole loop can be seen in one sitting
  if (o.test) earn(6000, 'Test Wishbones (the preview link)', 'test');
  setTimeout(() => earn(RATES.board, 'Boarding pass: welcome aboard SOLACE', 'board'), 900);

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
      <div class="copy"><span class="kicker">PTU Radio HQ</span><h1><span id="wbBig">${n(W.bal)}</span> <span class="unit">Wishbones</span></h1>
        <p>Your Wishbones are banked here, at the dish on the asteroid. Everything you hear and play on FictionVision pays them, and they open the parts of SOLACE nobody else gets to see.</p></div>
    </section>
    <section class="wb-sec"><h2>How you earn them</h2>
      <div class="wb-earn">${EARN.map(([h, s, amt, href, tail]) => `<a class="wb-e" href="${href}"><b class="amt">+${n(amt)}<small>${tail || ''}</small></b><span class="h">${h}</span><span class="s">${s}</span></a>`).join('')}</div>
    </section>
    <section class="wb-sec"><h2>What they open</h2><div id="wbDeck"></div>
      <div class="wb-later">${LATER.map(([h, p]) => `<div class="wb-l"><span class="lock" aria-hidden="true"></span><span class="h">${esc(h)}</span><b>${n(p)}</b><small>Not open yet</small></div>`).join('')}</div>
    </section>
    <section class="wb-sec"><h2>Every Wishbone in and out</h2><ol class="wb-ledger" id="wbLedger"></ol>
      <p class="wb-fine">Wishbones live in this browser. They can't be bought and they can't be cashed out. A phone and a laptop each keep their own.${W.once.test ? ' <button type="button" class="wb-reset" id="wbReset">Start over</button>' : ''}</p>
    </section>
  </div>`;
  deck(); ledger();
  const r = el.querySelector('#wbReset');
  if (r) r.addEventListener('click', () => { W = { bal: 0, log: [], once: {}, open: {} }; save(); earn(6000, 'Test Wishbones (the preview link)', 'test'); earn(RATES.board, 'Boarding pass: welcome aboard SOLACE', 'board'); });
  const off = mountMedia(el);
  return () => { root = null; if (typeof off === 'function') off(); };
}
function deck() {
  const box = root && root.querySelector('#wbDeck'); if (!box) return;
  const owned = !!W.open[DECK14.id], short = DECK14.price - W.bal;
  box.innerHTML = `<div class="wb-deck${owned ? ' owned' : ''}">
    <div class="pic"><img src="${still(DECK14.films[2])}" alt="" loading="lazy"><span class="tag">${owned ? 'Yours' : n(DECK14.price) + ' Wishbones'}</span></div>
    <div class="txt"><span class="kicker">The one closed door on SOLACE</span><h3>${DECK14.name}</h3>
      <p>The elevator goes from 13 straight to 15. Deck 14 belongs to Vigilant, the crew in the yellow suits. Three films, never shown on FictionVision.</p>
      <button type="button" class="cta wb-open" id="wbOpen"${!owned && short > 0 ? ' disabled' : ''}>${owned ? 'Watch Deck 14 again' : short > 0 ? `${n(short)} more to open it` : `Open Deck 14 · ${n(DECK14.price)}`}</button></div></div>`;
  box.querySelector('#wbOpen').addEventListener('click', () => {
    if (!W.open[DECK14.id]) { if (!spend(DECK14.price, 'Opened Deck 14, Vigilant')) return; W.open[DECK14.id] = Date.now(); save(); deck(); }
    screening(DECK14.films);
  });
}
function ledger() {
  const ol = root && root.querySelector('#wbLedger'); if (!ol) return;
  ol.innerHTML = W.log.length ? W.log.slice(0, 15).map(x => `<li class="${x.n < 0 ? 'out' : ''}"><span>${esc(x.why)}</span><b>${x.n < 0 ? '−' : '+'}${n(Math.abs(x.n))}</b></li>`).join('')
    : '<li class="none"><span>Nothing yet. Put a song on.</span></li>';
}

// ---------- the screening: the deck's films one after another, full screen, then back to HQ. Sound follows the site's one switch
function screening(ids) {
  const box = document.createElement('div');
  box.className = 'wb-screen'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', DECK14.name);
  box.innerHTML = `<video playsinline></video><div class="cap"><span class="kicker">Deck 14</span><b>Vigilant</b></div><button type="button" class="wb-x" aria-label="Back to HQ">Back to HQ</button>`;
  document.body.appendChild(box);
  const v = box.querySelector('video'), loud = sfx.isOn();
  v.muted = !loud;
  if (loud) { muteAll(); bus.claim('wb'); }
  let i = 0, done = false;
  const close = () => { if (done) return; done = true; v.pause(); bus.release('wb'); box.classList.remove('on'); setTimeout(() => box.remove(), 400); removeEventListener('keydown', key); document.removeEventListener('visibilitychange', back); };
  const key = e => { if (e.key === 'Escape') close(); };
  // a phone pauses a film when you leave the tab; coming back picks it up where it stopped
  const back = () => { if (!document.hidden && !done && v.paused && !v.ended) v.play().catch(() => { }); };
  document.addEventListener('visibilitychange', back);
  const next = () => { if (i >= ids.length) return close(); v.src = film(ids[i++]); v.play().catch(() => { v.muted = true; v.play().catch(() => { }); }); };
  v.addEventListener('ended', next);
  box.querySelector('.wb-x').addEventListener('click', close);
  addEventListener('keydown', key);
  requestAnimationFrame(() => box.classList.add('on'));
  next();
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
.wb-deck { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(16px, 2.4vw, 36px); align-items: center; padding: clamp(14px, 1.6vw, 22px); border-radius: var(--radius); background: linear-gradient(120deg, rgba(255,214,0,.10), rgba(255,214,0,.02)); border: 1px solid rgba(255,214,0,.35); }
.wb-deck .pic { position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 16 / 9; max-width: 100%; }
.wb-deck .pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wb-deck .tag { position: absolute; left: 10px; top: 10px; font: 700 13px/1 var(--display); background: var(--gold); color: #07070b; padding: 6px 9px; border-radius: 4px; }
.wb-deck.owned .tag { background: var(--green); }
.wb-deck .txt { display: grid; gap: 10px; justify-items: start; min-width: 0; }
.wb-deck h3 { font: 700 clamp(24px, 2.4vw, 40px)/1.05 var(--display); margin: 0; }
.wb-deck p { margin: 0; max-width: 52ch; }
.wb-open[disabled] { opacity: .55; cursor: default; filter: grayscale(.6); }
@media (max-width: 700px) { .wb-deck { grid-template-columns: 1fr; } }
.wb-later { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 10px; }
.wb-l { display: grid; gap: 4px; padding: 14px 16px; border-radius: var(--radius); border: 1px dashed var(--line); opacity: .8; }
.wb-l .h { font-weight: 600; }
.wb-l b { font: 700 20px/1 var(--display); color: var(--gold); font-variant-numeric: tabular-nums; }
.wb-l small { font-size: var(--fs-small); opacity: .7; }
.wb-ledger { list-style: none; margin: 0; padding: 0; display: grid; max-width: 760px; }
.wb-ledger li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.wb-ledger li span { min-width: 0; }
.wb-ledger li b { color: var(--gold); font-variant-numeric: tabular-nums; white-space: nowrap; }
.wb-ledger li.out b { color: var(--orange); }
.wb-fine { font-size: var(--fs-small); opacity: .75; margin: 0 0 clamp(32px, 5vw, 72px); max-width: 65ch; }
.wb-reset { margin-left: 8px; text-decoration: underline; color: inherit; font: inherit; }
.wb-screen { position: fixed; inset: 0; z-index: 200; background: #000; display: grid; place-items: center; opacity: 0; transition: opacity .4s; }
.wb-screen.on { opacity: 1; }
.wb-screen video { width: 100%; height: 100%; object-fit: contain; }
.wb-screen .cap { position: absolute; left: max(16px, env(safe-area-inset-left, 0px)); bottom: calc(18px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 4px; }
.wb-screen .cap b { font: 700 clamp(22px, 2.4vw, 36px)/1 var(--display); color: #ffd600; }
.wb-x { position: absolute; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(16px + env(safe-area-inset-top, 0px)); padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.4); background: rgba(0,0,0,.5); color: #fff; font: 600 var(--fs-small)/1 var(--ui); }
@media (prefers-reduced-motion: reduce) { .wb-coin.hit, .wb-coin.hit img { animation: none; } }
`;
  document.head.appendChild(s);
}
