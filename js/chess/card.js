/* The Games card: "Play OVER THE BOARD". Small and static, so the home page can show it without loading the game. */
export const OTB_HREF = '#/games/over-the-board';
const FACES = ['ledger-de-mort', 'zug', 'unit-7', 'ignis-ignitus', 'webebster-longstein'];

export function otbCard(o = {}) {
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  return `<a class="card tile gcard" href="${OTB_HREF}"${clone}>
    <span class="frame"><span class="otb-art" aria-hidden="true">
      <span class="faces">${FACES.map(f => `<img src="img/crew/${f}.webp" alt="" width="360" height="351" loading="lazy" decoding="async" draggable="false">`).join('')}</span>
      <span class="ttl">OVER THE<br>BOARD</span>
    </span></span>
    <span class="cap"><b>Play OVER THE BOARD</b><small><span>Chess against the thirteen beings of the Pool Table Universe</span></small></span></a>`;
}

