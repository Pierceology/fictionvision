/* The Games cards for DEAD ENDS and IN PIECES, and all three together (the home row and the Games page).
   Its own file on purpose: app.js imports it by a URL no visitor has cached, so a stale card.js can never miss an export. */
import { otbCard } from './chess/card.js';

/* DEAD ENDS: the thirteen round mazes. The card shows the ring of beings around a nebula. */
export const DE_HREF = '#/games/dead-ends';
const RING = ['ledger-de-mort', 'calico-jack', 'zug', 'rapour-riptalon', 'unit-7', 'stu', 'ignis-ignitus', 'patch-adams', 'argyle', 'bobbin-goodstitch', 'chip-o-block', 'finn-heckleberry', 'webebster-longstein'];
export function deadEndsCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  const faces = RING.map((f, i) => { const a = (i / 13) * Math.PI * 2 - Math.PI / 2; const x = 50 + 50 * Math.cos(a) - 13, y = 50 + 50 * Math.sin(a) - 13; return `<img src="img/crew/${f}.webp" alt="" width="360" height="351" loading="lazy" decoding="async" draggable="false" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">`; }).join('');
  return `<a class="card tile gcard" href="${DE_HREF}"${clone}>
    <span class="frame"><span class="de-art" aria-hidden="true">
      <img class="neb" src="img/neb/dens-crevice.webp" alt="" width="1280" height="720" loading="lazy" decoding="async">
      <span class="ring">${faces}</span>
      <span class="ttl">DEAD<br>ENDS</span>
    </span></span>
    <span class="cap"><b>Run DEAD ENDS</b><small><span>Thirteen round mazes, one per planet, each laid out by the being who lives there</span></small></span></a>`;
}

/* IN PIECES: the video puzzle. The card shows a planet still cut into twelve, one piece out of place. */
export const IP_HREF = '#/games/in-pieces';
export function inPiecesCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  const cells = Array.from({ length: 12 }, (_, i) => { const c = i % 4, r = Math.floor(i / 4); return `<i style="background-image:url(img/neb/heliumdrum.webp);background-position:${(c / 3 * 100).toFixed(1)}% ${(r / 2 * 100).toFixed(1)}%" class="${i === 6 ? 'out' : ''}"></i>`; }).join('');
  return `<a class="card tile gcard" href="${IP_HREF}"${clone}>
    <span class="frame"><span class="ip-art" aria-hidden="true">
      <span class="grid">${cells}</span>
      <span class="ttl">IN<br>PIECES</span>
    </span></span>
    <span class="cap"><b>Solve IN PIECES</b><small><span>A planet's video cut into pieces, every piece playing its own part. Put it back together</span></small></span></a>`;
}

/* TYPECAST: type what the beings say. The card is a line mid-typed on dark keys. */
export const TC_HREF = '#/games/typecast';
export function typecastCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  const keys = 'TYP WHAT'.split('').map(k => `<i class="${k === ' ' ? 'sp' : ''}">${k.trim()}</i>`).join('');
  return `<a class="card tile gcard" href="${TC_HREF}"${clone}>
    <span class="frame"><span class="tc-art" aria-hidden="true"><span class="keys">${keys}</span><span class="line">Type what I say. Every key counts.<i class="caret"></i></span><span class="ttl">TYPE<br>CAST</span></span></span>
    <span class="cap"><b>Type TYPECAST</b><small><span>Type what the beings say, as fast as you can, while they say worse things about your typing</span></small></span></a>`;
}

/* NAME THAT PLANET: twelve seconds of a song, four planets. The card is the dial with the marks around it. */
export const NP_HREF = '#/games/name-that-planet';
const DIAL = ['planet-zee', 'prearth', 'heliumdrum', 'guffaw-7', 'yarnia', 'dens-crevice', 'figuria', 'hungary'];
export function planetCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  const marks = DIAL.map((p, i) => { const a = (i / DIAL.length) * Math.PI * 2 - Math.PI / 2; return `<img src="img/mark/${p}.png" alt="" width="96" height="96" loading="lazy" decoding="async" style="left:${(50 + 44 * Math.cos(a) - 11).toFixed(1)}%;top:${(50 + 44 * Math.sin(a) - 11).toFixed(1)}%">`; }).join('');
  return `<a class="card tile gcard" href="${NP_HREF}"${clone}>
    <span class="frame"><span class="np-art" aria-hidden="true"><span class="dial">${marks}<b></b></span><span class="ttl">NAME THAT<br>PLANET</span></span></span>
    <span class="cap"><b>Play NAME THAT PLANET</b><small><span>Twelve seconds of a song from PTU Radio, four planets, pick the one it came from</span></small></span></a>`;
}

/* BRAIN BEAN COFFEE: Planet Zee's coffee shop, one in a hundred gets the cup */
export function beanCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  return `<a class="card tile gcard" href="#/games/brain-bean"${clone}>
    <span class="frame"><span class="bean-art" aria-hidden="true"><img src="img/bean/pam.webp" alt="" loading="lazy" decoding="async"><span class="ttl">BRAIN BEAN<br>COFFEE</span><span class="odds">1<small>in</small>100</span></span></span>
    <span class="cap"><b>Play BRAIN BEAN COFFEE</b><small><span>Order a coffee on Planet Zee. One in a hundred gets it. Pam almost hands it over a dozen ways</span></small></span></a>`;
}

/* the Asteroid Show: Pierce's own, thirteen skies; the card wears Planet Zee's nebula */
export function showCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  return `<a class="card tile gcard" href="#/show"${clone}>
    <span class="frame"><span class="show-art" aria-hidden="true"><img src="https://static.wixstatic.com/media/0caac7_1ad5486d6a4e468085a5f03c1679f4ddf000.jpg/v1/fill/w_640,h_360,q_80/p.jpg" alt="" loading="lazy" decoding="async"><span class="ttl">THE ASTEROID<br>SHOW</span></span></span>
    <span class="cap"><b>Watch the Asteroid Show</b><small><span>Thirteen skies, one per planet. The rocks fly to the music; drag the planet around</span></small></span></a>`;
}

/* all seven, for the Games page and the home row */
export function gameCards(o = {}) { return otbCard(o) + deadEndsCard(o) + inPiecesCard(o) + typecastCard(o) + planetCard(o) + beanCard(o) + showCard(o); }
export { otbCard };
