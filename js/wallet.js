/* Wishbones: the planets pay, the ship charges (Pierce, 2026-10-21; the rates are his own Finding SOLACE rules where they exist).
   PREVIEW ONLY: app.js loads this file only in a browser that opened a ?wallet link, so nobody else sees a thing.
   Everything lives on this device (fv.wb). Wishbones are never sold and never cashed out: a ticket stub, not money.
   Earn: a song heard to the end, a champion beaten, the Duck held under, Pam's coffee, a trophy.
   Spend: a planet's 50-50 slug, 1,000 a lick (Pierce's pick, 2026-10-21): his own pharmacy game, a happy face or a tripping face. */
import { mount as mountMedia, speakerHTML, vplayHTML } from './media.js?v=20261021a';
import * as sfx from './sfx.js';
import { bus } from './bus.js';

const KEY = 'fv.wb';
const COIN = 'https://static.wixstatic.com/media/c626e3_3084fcb3b7f64b0e80dd13df86fa5438~mv2.png/v1/fill/w_96,h_96/coin.png';
const HQ_FILM = 'f08d21_b327eb573f7a42c6a2daaa6b0e103b9b';   // PTU-Radio Headquarters: the dish on the asteroid
const still = id => `https://static.wixstatic.com/media/${id}f000.jpg/v1/fill/w_1280,h_720,q_80/p.jpg`;
const film = (id, q) => `https://video.wixstatic.com/video/${id}/${q || (innerWidth < 760 ? 480 : 720)}p/mp4/file.mp4`;

// Brad's 50-50 slugs: Pierce's own game (the pharmacy deck of his Finding SOLACE design test, PHARMACY_SLUGS). Every planet has its slug;
// it lands on the being's happy face or its tripping face, each with that planet's own sound first. The first lick of a slug is a coin flip,
// then that slug takes turns, the way his game did it. Ids are Wix: the slug PNG, the two 8 s films, the good and bad sounds.
const SLUG_PRICE = 1000, BRAD = 'ptu-oogh-iv-3';
const SLUGS = {
  "planet-zee": { img: "0caac7_00f82c8eab164ac7bb49a8233ddd9823", happy: "0caac7_f8f35bde0ab642de97414fe747de5050", trippy: "0caac7_338d10bfd3c640d0a0110f966bc9c6d6", good: ["f08d21_9484577c99c1480dbd494f82985a9be3","f08d21_7838ce13abfc4109acea2044adb688aa","f08d21_def9f0a4154a45ab849166ec65d23d1a"], bad: ["f08d21_bee5cdee310d4929b5fbb2e67078b08a","f08d21_50c56f24fb9346a4853c79d329334372","f08d21_39779a13dbab4e1189b1004de085d11c"] },
  "yaaarghs-revenge": { img: "0caac7_8d6de6db308241a4bffbe4a9bd0edec7", happy: "0caac7_21e05932387445d6a3c4bcd6320e058d", trippy: "0caac7_379ea01d3f434b1c8ffe3bd0121d5184", good: ["f08d21_d8429a89cc6344b6b5f18ae50d50ab05","f08d21_c35a85c555d8453ca573ac174d4ed31e","f08d21_14f257703ead494fa92473e59aadaa57"], bad: ["f08d21_eec553d692ae494ab7d68b8dfec97723","f08d21_049506329d834e688b52186e8adbeb70","f08d21_839f1e191bfd4931bdf14c066d6ee74e"] },
  "oogh-iv": { img: "0caac7_26aa68b493384664854b5a8445a93d9e", happy: "0caac7_78e65d6c8e3e4df194ae440bba93212d", trippy: "0caac7_c7a3c6fd804d457e9e0eda2f949a97fe", good: ["f08d21_657f1df48d574b82ac82dd9f30718d47","f08d21_4bce7bb03dfe474bb95a193701a1ac7b","f08d21_062c52bcd2cd442bbf6e6415b26b8f36"], bad: ["f08d21_cdd3de9e18b84dd1a030dcdd670ae4c0","f08d21_52fd0830863c4b0d89837d8a0564ed27","f08d21_6446d63e580e4f1eb9e6ae1c14aa9c1e"] },
  "prearth": { img: "0caac7_f0b0373d1cdc4862bd16a2dd63c911d0", happy: "0caac7_754c8661be794e829f5610e49b269162", trippy: "0caac7_33f71d9bd1594358bc6ae22c6497f32b", good: ["f08d21_18e8a261058b4060a6add54611a3a092","f08d21_683ac3b0d14f4626a2b79545fddc1e68","f08d21_7dfb51245631489f827d577b35848f4b"], bad: ["f08d21_17cff26d5fa347fbaadbe7e8799b7098","f08d21_bdf11a89e47d47bdb4a8fa2675cafa41","f08d21_4c779345b550457398486df803cceb31"] },
  "that-other-planet": { img: "0caac7_d78402ed11e348e9b91d5835036deb11", happy: "0caac7_5043fd1a4ba14988943431dee91ec25e", trippy: "0caac7_f1b6ce2e9e594cbabd83d263c2b2d59a", good: ["f08d21_cb107e9180bc4592b7f32eb7d2a6c0e0","f08d21_2a94f84d226949c1a693bc04fb5779f7","f08d21_1b301382f66e40c08b77aa319f4255f3"], bad: ["f08d21_c7dfcd2ec61a4ad6b5b08b918501b140","f08d21_0c0de18b4e4e4e85a7083b7775b20ff6","f08d21_de1e5f3a28444faf9be93d052931d409"] },
  "figuria": { img: "0caac7_d9c9598fa3cf40bc96cdad52ffb101db", happy: "0caac7_3fa00bf9dc664b60b6d903bda98b6281", trippy: "0caac7_ac8c83556b134cbeb814f3581b50ddc4", good: ["f08d21_7099a7175c5f40c6b0972b39db83307c","f08d21_52e35599829341a7b34518f69eceaaa7","f08d21_b810cdfa6ffb4644b331bf34e44eaa70"], bad: ["f08d21_3dc31c8fd0f34a63b07fe35458c3a4ba","f08d21_a8ff6f1c8a084ef98dd94606c6bcacbc","f08d21_af957adae4064865bf2b4929faae12a5"] },
  "dens-crevice": { img: "0caac7_ec00ea0d73054c79b081640a90728591", happy: "0caac7_481a6458c5124a9e85b498143a519f65", trippy: "0caac7_6ce27152209e401ea39336cc7f31ca8f", good: ["f08d21_9eaf1cc7e57f42a18df15b0b2e143f45","f08d21_e20a0367af4a446bbe655dc967a224b8","f08d21_779436b09a2740dfb089c277f8f37ccd"], bad: ["f08d21_d4a2e30c9b974375a7699dfe0b2f8f86","f08d21_bda1fa0c00e44005878860c852e1829b","f08d21_d77d4a1d9b85440d9bf882ce566b54de"] },
  "heliumdrum": { img: "0caac7_4057a73138324825b159e8867b68af57", happy: "0caac7_7ee16266a4ae4ab69e05c23d0a9626e4", trippy: "0caac7_036b8b79e47141e5abeb6f52977effc3", good: ["f08d21_aa21836e64144cea8eb700384cad1987","f08d21_a9fac69892e6464bbb6f9230d8acab52","f08d21_c4bf23b5d7e141febdb48dc7d61f20de"], bad: ["f08d21_48d081bf2c454c9ba798466f34f6485b","f08d21_b4161c36a8f74493afaa05093a6299f9","f08d21_ff443595702b4623bcb8afbafa2f497a"] },
  "washy-washy-ii": { img: "0caac7_34c7aa3c33f74d45b592fdf45a208600", happy: "0caac7_c88b1d2b2ed94df9907cd64f89339656", trippy: "0caac7_1a1960db3fa140b2862f7c03107a81c6", good: ["f08d21_324f8a09c1c14596b1390bfdfe2589af","f08d21_2c92ce9d6c974520bf450956d115fe40","f08d21_00d67979b06b440f9bcc1f1206107e29"], bad: ["f08d21_48c7a9e49374451b9b98b0ac10d56e5d","f08d21_b3ef825d4ef64c0c8f91f27a5c29bcad","f08d21_e5daa9d6c6634cb9b6ef443006a23af1"] },
  "yarnia": { img: "0caac7_944c0e904e5b4d3691e46a4f3ed47fed", happy: "0caac7_7c24eb1145e44baa8cf6113529c1dfc9", trippy: "0caac7_eb7943ee6317469ea480d331a7ea9f6b", good: ["f08d21_d9a4d4b1aef54dad8bd85ff32eb9c32a","f08d21_b9fca96c1a524bd499ade48c2a42280f","f08d21_5453701813824fd1ab7f39af2c02e753"], bad: ["f08d21_5e8975a6e3eb4a5baa7aa1461a13762f","f08d21_ccbd9f44d2974de2a3b58f67dcfbcca2","f08d21_f83bba45c37043388a62774dccd15d97"] },
  "hungary": { img: "0caac7_5c903a8966ea4ae689c8137f306b4f3b", happy: "0caac7_3dee0b85b79d4cbca5dfa7351dc0d6e2", trippy: "0caac7_89cf779bea0147b9ab17fb90be6acedd", good: ["f08d21_ab4806a361664f17ae0b800cf4752a94","f08d21_6ff0f233049c41c3b54726f0227ede98","f08d21_5f6bc8072c384e02ad4c249346c15e15"], bad: ["f08d21_5d047e442b0a488a9cf2ea3c4ccf5d6c","f08d21_49e66054f6ba4e45881ac6d864352c72","f08d21_220fc5f9c606458bbc106a38d991bfee"] },
  "guffaw-7": { img: "0caac7_75895f49a249472f9fb441ba765ae4f4", happy: "0caac7_99e45fb77b4d472db760b804ef7fa16b", trippy: "0caac7_7be73188ff424b5e8b65d4c2c88757f4", good: ["f08d21_86e3075b945b49e69abde5d0b6602b35","f08d21_d71415a4abb643dd8f663f1b7f3ce8da","f08d21_b9c61c9cc9ec49b8bb87ff4c0f5cad7a"], bad: ["f08d21_5414093efc66446cae592b0f2e1aa656","f08d21_0b0bea94ace24f48b5946cbd3bf3a69b","f08d21_04ef80f7854240ee98f7b9d4a065f413"] },
  "spee-ider-grove": { img: "0caac7_0d5c8ad99a0840afb44a610f68080337", happy: "0caac7_ebfdba49d6a84810a2a1c54134b7ae19", trippy: "0caac7_3207d8f6e81e41578cdab5c9f77ff246", good: ["f08d21_e47b6f2254ea4a0ab969a9564f3be2ed","f08d21_fd58663075ea42c2a6247d4fe668bc97","f08d21_b9d933395ae1472281cfe0c6981881bf"], bad: ["f08d21_2d077180af1e49109090b79010aa54ac","f08d21_a822dea7cad84da39603c1a91bb2f20f","f08d21_7a714298c5bd42a8a737922fb840a41f"] },
};
const pname = slug => ((window.FV && FV.planets.find(p => p.slug === slug)) || {}).name || slug;
const pbeing = slug => { const b = ((window.FV && FV.planets.find(p => p.slug === slug)) || {}).being || ''; return b.charAt(0) + b.slice(1).toLowerCase(); };
const slugPng = (id, w) => `https://static.wixstatic.com/media/${id}~mv2.png/v1/fit/w_${w},h_${w}/slug.png`;
const mp3 = id => `https://static.wixstatic.com/mp3/${id}.mp3`;

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
  if (o.test) setTimeout(() => earn(SLUG_PRICE, 'Test Wishbones from the preview link', 'test'), 5200);   // enough for one lick, once

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
    <p>Hear a song all the way through: +200. Beat a chess champion: +2,000. Spend 1,000 to lick a planet's 50-50 slug. The coin up top keeps your total.</p>
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
      <a class="wb-buy" href="#/t/${BRAD}"><span class="slugs">${['oogh-iv', 'planet-zee', 'heliumdrum'].map(k => `<img src="${slugPng(SLUGS[k].img, 160)}" alt="">`).join('')}</span><span class="tx"><span class="kicker">Brad's "Pharmacy" · every planet has one</span><b>Lick a 50-50 slug</b><span>Half the time you get the happy result. Half the time you trip balls. Thirteen slugs, one on every planet, all of them at Brad's.</span></span><span class="price">${n(SLUG_PRICE)}</span></a>
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
// ---------- the slug: on every planet page (its own), and on Brad's page (all thirteen to pick from)
export function slug(where, planet, o = {}) {
  if (!where || !SLUGS[planet]) return () => { };
  const box = document.createElement('div');
  box.className = 'wb-slug' + (o.label ? ' wb-planet' : ''); box.dataset.p = planet;
  box.innerHTML = `${o.label ? '<div class="sec-label wb-sl">Brad\'s 50-50 slug</div>' : ''}<div class="in"><img class="pic" alt=""><div class="tx"><span class="kicker"></span>
    <p>Half the time you get the happy result. Half the time you trip balls. Either way, Brad insists this is medicine.</p>
    <div class="go"><button type="button" class="cta wb-lick"></button><small class="have"></small></div></div>
    ${o.all ? `<div class="pick" role="group" aria-label="Pick a planet's slug">${Object.keys(SLUGS).map(k => `<button type="button" data-k="${k}" title="${esc(pname(k))}"><img src="${slugPng(SLUGS[k].img, 96)}" alt="${esc(pname(k))} slug"></button>`).join('')}</div>` : ''}</div>`;
  if (o.after) where.after(box); else where.appendChild(box);
  box.querySelector('.wb-lick').addEventListener('click', () => lick(box.dataset.p));
  box.querySelectorAll('.pick button').forEach(b => b.addEventListener('click', () => { box.dataset.p = b.dataset.k; slugPaint(box); }));
  slugPaint(box);
  return () => box.remove();
}
function slugPaint(box) {
  const k = box.dataset.p, b = box.querySelector('.wb-lick'), have = box.querySelector('.have'), short = SLUG_PRICE - W.bal;
  box.querySelector('.pic').src = slugPng(SLUGS[k].img, 400);
  box.querySelector('.kicker').textContent = `The ${pname(k)} slug · ${n(SLUG_PRICE)} Wishbones`;
  box.querySelectorAll('.pick button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.k === k)));
  b.disabled = short > 0;
  b.textContent = `Lick the ${pname(k)} slug`;
  const songs = Math.ceil(short / RATES.song);
  have.innerHTML = short > 0 ? `You have ${n(W.bal)}. ${n(short)} more: hear ${songs} song${songs === 1 ? '' : 's'} to the end. <a href="#/hq">More ways</a>` : `You have ${n(W.bal)}.`;
}
const sfxAt = {};
function lick(k) {
  const S = SLUGS[k]; if (!S || !spend(SLUG_PRICE, `Licked the ${pname(k)} slug`)) return;
  W.slugs = W.slugs || {};
  const last = W.slugs[k], res = last ? (last === 'happy' ? 'trippy' : 'happy') : (crypto.getRandomValues(new Uint8Array(1))[0] < 128 ? 'happy' : 'trippy');
  W.slugs[k] = res;
  W.log[0].why = `Licked the ${pname(k)} slug: ${res === 'happy' ? 'happy' : 'tripped balls'}`; save(); paint();
  // the planet's own sound lands first, the face 520 ms later (his timing); both only with the bar's switch on
  const list = res === 'happy' ? S.good : S.bad, key = k + res, i = (sfxAt[key] || 0) % (list.length || 1);
  sfxAt[key] = i + 1;
  if (sfx.isOn() && list.length) { try { const a = new Audio(mp3(list[i])); a.volume = res === 'happy' ? 0.72 : 0.58; a.play().catch(() => { }); } catch (e) { } }
  setTimeout(() => screening([res === 'happy'
    ? { id: S.happy, kicker: `The ${pname(k)} slug · the ${pbeing(k)}`, big: 'Happy result', line: 'I felt better, which made me suspicious. Then I remembered suspicion is also a feeling. Nice slug.' }
    : { id: S.trippy, kicker: `The ${pname(k)} slug · the ${pbeing(k)}`, big: 'Tripping balls', line: 'Saw colors file taxes. Woke up knowing less than before. Brad called that growth.' }]), 520);
}

// the films one after another, full screen, then back to the page. Sound follows the bar's switch, and a button turns it on here too
function screening(parts) {
  const box = document.createElement('div');
  box.className = 'wb-screen'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', parts[0].big);
  box.innerHTML = `<video playsinline></video><div class="cap"><span class="kicker"></span><b></b><span class="ln"></span></div>
    <div class="ctl"><button type="button" class="wb-snd"></button><button type="button" class="wb-x">Back</button></div>`;
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
.wb-buy { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 18px; align-items: center; padding: 14px; border-radius: var(--radius); background: linear-gradient(120deg, rgba(255,200,87,.12), rgba(255,200,87,.03)); border: 1px solid rgba(255,200,87,.45); max-width: 980px; transition: border-color .2s; }
.wb-buy:hover { border-color: var(--gold); }
.wb-buy .slugs { display: flex; }
.wb-buy .slugs img { width: 76px; height: 76px; object-fit: contain; margin-right: -14px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.6)); }
.wb-buy .tx { display: grid; gap: 4px; min-width: 0; }
.wb-buy .tx b { font: 700 clamp(20px, 1.8vw, 28px)/1.1 var(--display); }
.wb-buy .price { font: 700 clamp(22px, 2vw, 32px)/1 var(--display); color: var(--gold); font-variant-numeric: tabular-nums; padding-right: 8px; }
@media (max-width: 640px) { .wb-buy { grid-template-columns: 1fr; } .wb-buy .price { padding: 0; } }
.wb-sl { padding: 0 !important; margin: 0 0 8px !important; }
.wb-slug > .in { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 18px; align-items: center; padding: 14px 18px; border-radius: 12px; background: radial-gradient(120% 140% at 0% 50%, rgba(255,200,87,.16), rgba(255,200,87,.03) 60%); border: 1px solid rgba(255,200,87,.45); }
.wb-slug .pic { width: 100%; aspect-ratio: 1; object-fit: contain; filter: drop-shadow(0 10px 18px rgba(0,0,0,.6)); }
.wb-slug .tx { display: grid; gap: 6px; min-width: 0; }
.wb-slug p { margin: 0; max-width: 60ch; }
.wb-slug .go { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; }
.wb-slug .have { font-size: var(--fs-small); opacity: .85; }
.wb-slug .have a { color: var(--gold); text-decoration: underline; }
/* all thirteen on Brad's page: seven and six, across the whole panel, so none sits alone */
.wb-slug .pick { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.wb-slug .pick button { width: 100%; aspect-ratio: 1; max-height: 64px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,.04); display: grid; place-items: center; padding: 3px; }
.wb-slug .pick button img { width: 100%; height: 100%; object-fit: contain; }
.wb-slug .pick button[aria-pressed="true"] { border-color: var(--gold); background: rgba(255,200,87,.16); }
.wb-slug.wb-planet { padding: clamp(24px, 3.4vw, 56px) var(--gutter) 0; }
.tp-info .wb-slug { margin: 14px 0 18px; }
@media (max-width: 520px) { .wb-slug > .in { grid-template-columns: 1fr; } .wb-slug .pic { width: 60%; margin: 0 auto; } }
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
