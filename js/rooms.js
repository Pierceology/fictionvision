/* The staterooms, as Pierce built them on the ship (solace-ship v0.7.0, decks 5A to 5M): two rooms a planet, each a picture (Planet Zee's are films),
   and the planet's lullaby, which is the room's sound. On every planet page the rooms replace the names; "Open the room" fills the screen with
   it and plays the lullaby (Pierce, 2026-10-21: "i dont hear my stateroom audio... i also have images and videos for stateroom").
   Sound follows the bar's switch, and the room has its own button too. */
import { bus } from './bus.js';
import * as sfx from './sfx.js';

export const ROOMS = {
  "planet-zee": { lull: "f08d21_f86fdb1a0d924c2993cae32b8c3eeb00", rooms: [{"name": "Velvet Curtain Crypts", "v": "0caac7_283e536b4ef741b7b8576c8283952ab0"}, {"name": "Gilded Coffin Cabins", "v": "0caac7_7c4174d7d05e494e9ad4c417ededea2f"}] },
  "yaaarghs-revenge": { lull: "f08d21_29a86dd99fb740f7ab3d89c9647287f6", rooms: [{"name": "Guilded Galleon Suites", "i": "0caac7_c2b38103e8d8416aa467ff92db065697", "x": "png"}, {"name": "Satin & Skull Suites", "i": "0caac7_019d899c4d92496c9c300691b1177a45", "x": "png"}] },
  "oogh-iv": { lull: "f08d21_eed9d547402c435ea3038f050e36eef3", rooms: [{"name": "Wooly Mammoth Rooms", "i": "0caac7_3902023d7a1a481ca50acc5b43ee683a", "x": "png"}, {"name": "Saber Tooth Rooms", "i": "0caac7_af8b5a4775c94434b1ead8ec57ccf3f3", "x": "png"}] },
  "prearth": { lull: "f08d21_87dec9e3564b43c288ab4bef4e300763", rooms: [{"name": "Primeval Drift Pods", "i": "0caac7_dc6ff4b5ce5347478042ff5550582596", "x": "png"}, {"name": "Carnivore Cloud Pods", "i": "0caac7_31513b32458b48cd90852d4817a31eef", "x": "png"}] },
  "that-other-planet": { lull: "f08d21_00e884a292e74d3ba6c86d94c1de2dd2", rooms: [{"name": "Nebula Dream Chambers", "i": "0caac7_b1bf35ae68a04f25a91fae222f9e1211", "x": "png"}, {"name": "Plasma Drift Chambers", "i": "0caac7_743df36860334a7da4bdd72593899094", "x": "png"}] },
  "figuria": { lull: "f08d21_021526f9513b4512986dce999324cc24", rooms: [{"name": "Echo Mold Quarters", "i": "0caac7_d4ed11495a8547338ae4a7d36cdb28f4", "x": "png"}, {"name": "Joint Sector Bays", "i": "0caac7_c01e2d6c0f5e44b79f3fa745dcc9041b", "x": "png"}] },
  "dens-crevice": { lull: "f08d21_f3b9e755bdd74380aedfb65a1b7e4606", rooms: [{"name": "Ancient Pyre Chambers", "i": "0caac7_1479fdd9dac244e59c6be50ac13cd1e2", "x": "png"}, {"name": "Molten Sky Quarters", "i": "0caac7_b5434fccd855492c9e78f5e0b971276d", "x": "png"}] },
  "heliumdrum": { lull: "f08d21_8c96a03a359b43e9a06e47605c807aa8", rooms: [{"name": "Ethereal Drift Suites", "i": "0caac7_5881786d4bbe4c32a3899f8179167f2b", "x": "png"}, {"name": "Tethered Serenity Pods", "i": "0caac7_fd032763dbf74efead717ad201016ba3", "x": "png"}] },
  "washy-washy-ii": { lull: "f08d21_21c3e532107a46439c5ca24b3d2889f9", rooms: [{"name": "Sock Drawer Suites", "i": "0caac7_d82acb6a16fd4155b009624505c20d42", "x": "png"}, {"name": "Googly Eye Grottos", "i": "0caac7_7bb13cd40df84d67a813df3f72c8dbac", "x": "png"}] },
  "yarnia": { lull: "f08d21_69a535c192f94bf6a76c8f33759af1dd", rooms: [{"name": "Twin Needle Nests", "i": "0caac7_8cba8ed943c146469c7abcb09ebb207a", "x": "png"}, {"name": "Skein Escape Cabins", "i": "0caac7_38572e00b5964b52bf8ac816a560332a", "x": "png"}] },
  "hungary": { lull: "f08d21_c1e1608374c4493991700f607c629a93", rooms: [{"name": "The Stalk Market Suites", "i": "0caac7_d5a930dd5a7740699d94f55f8aef9ec0", "x": "png"}, {"name": "The Chlorophyll Chambers", "i": "0caac7_a4de73af45084bcd86c53ea953ba3f2e", "x": "png"}] },
  "guffaw-7": { lull: "f08d21_ac547c649edb4cafa7fa8497f0599da5", rooms: [{"name": "Talky Talk Cabins", "i": "0caac7_4ffa5f4257fb47929d409f3483aa0d23", "x": "png"}, {"name": "Silent Rebellion Suites", "i": "0caac7_f82fd27977b84db295042ab7e4a2ec5f", "x": "png"}] },
  "spee-ider-grove": { lull: "f08d21_d901dddc37fa49f3be9252a122a7ee35", rooms: [{"name": "Silken Spire Suites", "i": "0caac7_33b6802628b54128a409278251bb76d5", "x": "png"}, {"name": "Webwork Chambers", "i": "0caac7_0381a0c98c8e4795bd8262b10e947104", "x": "png"}] },
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pic = (r, w, h) => r.v ? `https://static.wixstatic.com/media/${r.v}f000.jpg/v1/fill/w_${w},h_${h},q_82/p.jpg` : `https://static.wixstatic.com/media/${r.i}~mv2.${r.x}/v1/fill/w_${w},h_${h},q_82/room.jpg`;
const film = id => `https://video.wixstatic.com/video/${id}/${innerWidth < 760 ? 480 : 720}p/mp4/file.mp4`;
const mp3 = id => `https://static.wixstatic.com/mp3/${id}.mp3`;

export function roomsHTML(slug) {
  const R = ROOMS[slug]; if (!R) return '';
  return `<div class="sec-label">Staterooms aboard SOLACE</div>
    <div class="rooms">${R.rooms.map((r, i) => `<button type="button" class="room" data-room="${i}"><span class="pic"><img src="${pic(r, 960, 540)}" alt="" loading="lazy" decoding="async"></span>
      <span class="cap"><b>${esc(r.name)}</b><span class="go">Open the room</span></span></button>`).join('')}</div>`;
}
export function mountRooms(root, slug, planetName) {
  const R = ROOMS[slug]; if (!R || !root) return () => { };
  let close = null;
  root.querySelectorAll('.room[data-room]').forEach(b => b.addEventListener('click', () => { close = open(R, R.rooms[+b.dataset.room], planetName); }));
  return () => { if (close) close(); };
}
function open(R, r, planetName) {
  const box = document.createElement('div');
  box.className = 'room-view'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', r.name);
  box.innerHTML = `${r.v ? '<video playsinline muted></video>' : `<img src="${pic(r, 1920, 1080)}" alt="">`}
    <div class="cap"><span class="kicker">${esc(planetName)} staterooms · aboard SOLACE</span><b>${esc(r.name)}</b></div>
    <div class="ctl"><button type="button" class="snd"></button><button type="button" class="x">Back</button></div>`;
  document.body.appendChild(box);
  const a = new Audio(mp3(R.lull)); a.preload = 'auto'; a.volume = 0.6;
  let loud = sfx.isOn(), done = false;
  const snd = box.querySelector('.snd');
  const sound = () => {
    snd.textContent = loud ? 'Sound off' : 'Sound on';
    if (loud) { bus.claim('room'); a.play().catch(() => { loud = false; snd.textContent = 'Sound on'; bus.release('room'); }); }
    else { a.pause(); bus.release('room'); }
  };
  const v = box.querySelector('video');
  if (v) { v.src = film(r.v); v.play().catch(() => { }); }   // once through, then it holds its last frame: never a hard loop
  const key = e => { if (e.key === 'Escape') close(); };
  const close = () => {
    if (done) return; done = true;
    a.pause(); a.removeAttribute('src'); bus.release('room');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    box.classList.remove('on'); setTimeout(() => box.remove(), 400); removeEventListener('keydown', key);
  };
  snd.addEventListener('click', () => { loud = !loud; sound(); });
  box.querySelector('.x').addEventListener('click', close);
  a.addEventListener('ended', () => { bus.release('room'); snd.textContent = 'Sound on'; loud = false; });
  addEventListener('keydown', key);
  requestAnimationFrame(() => box.classList.add('on'));
  sound();
  return close;
}
