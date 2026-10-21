/* Wishbones: the planets pay, the ship charges (Pierce, 2026-10-21; the rates are his own Finding SOLACE rules where they exist).
   PREVIEW ONLY: app.js loads this file only in a browser that opened a ?wallet link, so nobody else sees a thing.
   Everything lives on this device (fv.wb). Wishbones are never sold and never cashed out: a ticket stub, not money.
   Earn: a song heard to the end, a champion beaten, the Duck held under, Pam's coffee, a trophy. What they buy is Pierce's call. */
import { mount as mountMedia, speakerHTML, vplayHTML } from './media.js';
import * as sfx from './sfx.js';

const KEY = 'fv.wb';
const COIN = 'https://static.wixstatic.com/media/c626e3_3084fcb3b7f64b0e80dd13df86fa5438~mv2.png/v1/fill/w_96,h_96/coin.png';
const HQ_FILM = 'f08d21_b327eb573f7a42c6a2daaa6b0e103b9b';   // PTU-Radio Headquarters: the dish on the asteroid
const still = id => `https://static.wixstatic.com/media/${id}f000.jpg/v1/fill/w_1280,h_720,q_80/p.jpg`;
const film = id => `https://video.wixstatic.com/video/${id}/${innerWidth < 760 ? 480 : 720}p/mp4/file.mp4`;

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
  if (amt && why && toast) {
    toast.innerHTML = `<img src="${COIN}" alt=""><b>+${n(amt)}</b><span>${esc(why)}</span>`;
    toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 3600);
    sfx.play('chime');
  }
}

export function init() {
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
    <p>Hear a song all the way through: +200. Beat a chess champion: +2,000. Hold the Duck under: +20 a second. The coin up top keeps your total.</p>
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
    <section class="wb-sec"><h2>What you've earned</h2><ol class="wb-ledger" id="wbLedger"></ol>
      <p class="wb-fine">Wishbones aren't money: nobody can buy them or cash them out. They're kept in this browser, so a phone and a laptop each have their own. <button type="button" class="wb-reset" id="wbReset">Start over</button></p>
    </section>
  </div>`;
  ledger();
  el.querySelector('#wbReset').addEventListener('click', () => { W = { bal: 0, log: [], once: {}, open: {} }; save(); earn(RATES.board, 'Your first Wishbones. Listen and play to get more.', 'board'); });
  const off = mountMedia(el);
  return () => { root = null; if (typeof off === 'function') off(); };
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
