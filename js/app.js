/* FictionVision: ideas, streaming. The Pool Table Universe is underneath; people find it. */
import { mountStickers, stickerHTML } from './holo.js';
import { emblem } from './emblems.js';
import { mount as mountMedia, speakerHTML, vplayHTML } from './media.js';
import { bus } from './bus.js';
import * as radio from './radio.js';
import { otbCard, gameCards } from './cards.js';
import * as solace from './bumper.js';
import * as clippo from './clip.js';
import * as sfx from './sfx.js';
import { TFRTA } from './tfrta-data.js';
import * as rick from './rick.js';
const TF_BY_FV = Object.fromEntries(TFRTA.posts.filter(p => p.fvId).map(p => [p.fvId, p]));

const FV = window.FV;
const FVM = window.FVM || { albums: [], p: {}, v: {}, hq: '', atrium: '' };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nb = s => esc(s).replace(/-/g, '&#8209;');
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ------------------------------------------------------------------ storage (per viewer, never required)
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.' + k, JSON.stringify(v)); } catch (e) { /* private mode: fine */ } },
};
const sess = {
  get(k) { try { return sessionStorage.getItem('fv.' + k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem('fv.' + k, v); } catch (e) { } },
};

// ------------------------------------------------------------------ data
const T = Object.fromEntries(FV.titles.map(t => [t.id, t]));
const P = Object.fromEntries(FV.planets.map(p => [p.slug, p]));
const SOLACE = { slug: 'solace', name: 'SOLACE', mark: 'img/mark/rick.png', badge: 'img/badge/rick.png' };
const worldOf = t => t.planet === 'solace' ? SOLACE : (t.planet ? P[t.planet] : null);
const late = t => t.late && t.id !== 'bleep';
const by = ids => ids.map(i => T[i]).filter(Boolean);
const titlesOn = slug => ({
  ex: FV.titles.filter(t => t.src === 'ptu39' && t.planet === slug).sort((a, b) => a.slot - b.slot),
  more: FV.titles.filter(t => t.src === 'new' && t.planet === slug),
});
const GENRES = {
  comedy: ['Comedy', /comed|mockument|satire|sitcom/],
  scifi: ['Sci-fi', /sci/],
  horror: ['Horror', /horror/],
  thriller: ['Thriller and mystery', /thrill|heist|mystery|noir/],
  drama: ['Drama', /drama|biopic/],
  romance: ['Romance', /roman/],
  documentary: ['Documentary and reality', /document|reality/],
  adventure: ['Adventure and sports', /adventure|action|sport/],
};
const inGenre = (t, g) => GENRES[g][1].test((t.genre || '').toLowerCase());
const shown = FV.titles.filter(t => !late(t));
const ARCH = shown.filter(t => !t.planet);          // ideas from people
const UNIV = shown.filter(t => t.planet);           // titles that stream from the Pool Table Universe
function mix(a, b, every = 3) {                     // one era every few of the other, so no row is one tool's output
  const out = []; let i = 0, j = 0;
  while (i < a.length || j < b.length) { for (let k = 0; k < every && i < a.length; k++) out.push(a[i++]); if (j < b.length) out.push(b[j++]); }
  return out;
}
const firstSentences = (s, n = 2) => { const m = String(s || '').match(/[^.!?]+[.!?]+["”']?/g); return m ? m.slice(0, n).join(' ').trim() : String(s || ''); };

// ------------------------------------------------------------------ the universe is found, not pushed
// A new visitor sees ideas, music and games. Opening a title that streams from a planet, or coming back a few times,
// opens the Pool Table Universe up a little at a time. Remembered on this device only.
const disc = {
  visit() { if (sess.get('visit')) return; sess.set('visit', '1'); store.set('visits', store.get('visits', 0) + 1); },
  seen() { return store.get('ptuSeen', []); },
  mark(id) { const a = store.get('ptuSeen', []); if (!a.includes(id)) { const before = this.level(); a.push(id); store.set('ptuSeen', a); if (this.level() !== before) renderNav(); } },
  level() { const v = store.get('visits', 0), o = store.get('ptuSeen', []).length; return o >= 3 || v >= 6 ? 2 : (o >= 1 || v >= 3 ? 1 : 0); },
};

// ------------------------------------------------------------------ "I'd watch this", kept per viewer
let list = new Set(store.get('list', []));
function setWatch(id, on) {
  on ? list.add(id) : list.delete(id);
  if (on) document.dispatchEvent(new CustomEvent('fv:event', { detail: { kind: 'watch', count: list.size } }));
  store.set('list', [...list]);
  paintList();
  $$(`[data-watch="${CSS.escape(id)}"]`).forEach(paintWatchBtn);
  $$(`.card[data-id="${CSS.escape(id)}"]`).forEach(c => { c.querySelector('.ondeck')?.remove(); if (on) c.insertAdjacentHTML('beforeend', ONDECK); });
}
function paintList() { const n = $('#listN'); n.textContent = list.size; n.classList.toggle('on', list.size > 0); const n2 = $('#listN2'); if (n2) n2.textContent = list.size ? `(${list.size})` : ''; }
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
const ONDECK = `<span class="ondeck" title="On your list">${CHECK}</span>`;
function watchBtn(id) { return `<button class="ghost watch" data-watch="${esc(id)}"></button>`; }
function paintWatchBtn(b) {
  const on = list.has(b.dataset.watch);
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on);
  b.innerHTML = on ? `${CHECK}<span>You'd watch this</span>` : `${PLUS}<span>I'd watch this</span>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-watch]');
  if (!b) return;
  e.preventDefault();
  setWatch(b.dataset.watch, !list.has(b.dataset.watch));
});

// ------------------------------------------------------------------ cards: three shapes, one for each thing you do
// watch = 3:4 (portrait art whole; landscape art whole on a sleeve), listen = 1:1, explore and play = 16:9
document.addEventListener('load', e => { if (e.target.classList?.contains('poster')) e.target.classList.add('in'); }, true);
function dots(n, of = 5) { let s = '<span class="dots" aria-hidden="true">'; for (let i = 0; i < of; i++) s += `<i class="${i < n ? '' : 'off'}"></i>`; return s + '</span>'; }
function badgeHTML(t, big) {
  const w = worldOf(t);
  if (!w || !t.spot) return '';
  const [x, y, d] = t.spot;
  // one size on every card (Pierce, 2026-10-09: "different size icons"); the big poster keeps the size painted for its spot
  const dd = big ? clamp(d, 0.11, 0.28) : 0.17;
  return `<span class="badge" style="left:${x * 100}%;top:${y * 100}%;width:${dd * 100}%"><img src="${big ? w.badge : w.mark}" alt="" loading="lazy" decoding="async"></span>`;
}
function rateBadge(t) {
  if (t.pffffts) return `<span class="rt pf">${dots(t.pffffts, 3)}<span>${t.pffffts} PFFFFT${t.pffffts === 1 ? '' : 's'}</span></span>`;
  if (t.teehees != null) return `<span class="rt">${dots(t.teehees)}<span>${t.teehees} TEE-HEE${t.teehees === 1 ? '' : 's'}</span></span>`;
  return '';
}
function card(t, o = {}) {
  const w = worldOf(t);
  const clone = o.clone ? ' aria-hidden="true" tabindex="-1"' : '';
  const src = o.defer ? 'data-src' : 'src';
  const wl = list.has(t.id) ? ONDECK : '';
  if (t.orient === 'l') {
    return `<a class="card t sl" href="#/t/${t.id}" data-id="${t.id}" style="--ar:${t.img.w}/${t.img.h};--c1:${t.img.c1}"${clone}>
      <span class="frame"><img class="poster" ${src}="${t.img.row}" alt="" width="${t.img.w}" height="${t.img.h}" loading="lazy" decoding="async" draggable="false">
        <span class="panel"><i class="kick">${esc(t.genre || t.kind)}</i><b class="nm">${esc(t.title)}</b><i class="mt">${esc(t.kind)}</i>${rateBadge(t)}</span></span>${wl}</a>`;
  }
  const sub = [w ? w.name : null, t.kind].filter(Boolean).join(' · ');
  const ic = w ? `<img src="${w.mark}" alt="" loading="lazy">` : '';
  return `<a class="card t p" href="#/t/${t.id}" data-id="${t.id}" style="--ce:${t.img.ce}"${clone}>
    <span class="frame"><img class="poster" ${src}="${t.img.row}" alt="${esc(t.title)}" width="${t.img.w}" height="${t.img.h}" loading="lazy" decoding="async" draggable="false">${rateBadge(t)}</span>
    ${badgeHTML(t)}${o.xnum ? `<span class="xnum">Excurience ${t.slot}</span>` : ''}
    <span class="cap"><b>${esc(t.title)}</b><small>${ic}<span>${esc(sub)}</span></small></span>${wl}</a>`;
}
function tile(p, o = {}) {        // a place: 16:9. The planet's own card video plays muted under the pointer, or on the tile nearest the middle of a phone
  const vt = FVM.p[p.slug] && FVM.p[p.slug].tile;
  return `<a class="card tile" href="#/ptu/${p.slug}"${vt ? ` data-tile="${vt}"` : ''}${o.clone ? ' aria-hidden="true" tabindex="-1"' : ''}>
    <span class="frame"><img class="poster" ${o.defer ? 'data-src' : 'src'}="${p.still}" alt="" width="1280" height="720" loading="lazy" decoding="async" draggable="false"></span>
    <img class="mk" src="${p.mark}" alt="">
    <span class="cap"><b>${esc(p.name)}</b><small><span>${esc(p.being)}</span></small></span></a>`;
}
const ARROW_BACK = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
function rowHTML(label, inner, o = {}) {
  const more = o.more ? `<a class="more" href="${o.more}">${esc(o.moreLabel || 'See all')}</a>` : '';
  return `<section class="row"><div class="row-head"><h2>${esc(label)}</h2>${o.sub ? `<span class="sub">${esc(o.sub)}</span>` : ''}${more}</div>
    <div class="rail ${o.static ? 'static' : ''}" data-dir="${o.dir || 1}"><div class="track">${inner}</div></div></section>`;
}
function row(label, items, o = {}) {
  if (!items.length) return '';
  return rowHTML(label, items.map(t => card(t, { ...o, defer: !o.static && !calm() })).join(''), o);
}

// ------------------------------------------------------------------ rows that drift, and slow on hover
const drifts = [];
let rafOn = false;
function initRails(root) {
  $$('.rail', root).forEach(rail => {
    if (rail.classList.contains('static')) return;
    if (calm()) { rail.classList.add('static'); return; }
    drifts.push(makeDrift(rail));
  });
  // one loop for every drifting row. Rows left behind with their page are dropped, the loop stops when none are left,
  // and the drift (about 20px a second) is stepped at 30 frames a second, which looks the same and costs half.
  if (!rafOn && drifts.length) {
    rafOn = true; let last = performance.now();
    const tick = now => {
      if (now - last >= 30) {
        const dt = Math.min(0.1, (now - last) / 1000); last = now;
        for (let i = drifts.length - 1; i >= 0; i--) { if (!drifts[i].rail.isConnected) { drifts[i].destroy(); drifts.splice(i, 1); } else drifts[i].step(dt); }
        if (!drifts.length) { rafOn = false; return; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
function wake(root) { $$('img[data-src]', root).forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); }); }
function makeDrift(rail) {
  const track = rail.querySelector('.track');
  const dir = +rail.dataset.dir || 1;
  const originals = [...track.children];
  let setW = 1, pos = 0, v = 0, hover = false, drag = null, visible = false, suppress = false;
  const base = () => Math.max(16, innerWidth * 0.014) * dir;
  function build() {
    $$('.clone', track).forEach(n => n.remove());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const first = originals[0], lastC = originals[originals.length - 1];
    setW = lastC.offsetLeft + lastC.offsetWidth + gap - first.offsetLeft;
    const copies = Math.max(1, Math.ceil((rail.clientWidth * 1.5) / setW));
    for (let i = 0; i < copies; i++) originals.forEach(n => { const c = n.cloneNode(true); c.classList.add('clone'); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; c.querySelectorAll('a,button').forEach(x => { x.tabIndex = -1; }); track.appendChild(c); });
    if (!pos) pos = Math.random() * setW;
    paint();
  }
  function paint() { pos = ((pos % setW) + setW) % setW; track.style.transform = `translate3d(${-pos}px,0,0)`; }
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(track); }, { rootMargin: '300px 0px' });
  io.observe(rail);
  rail.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  rail.addEventListener('pointerleave', () => { hover = false; });
  rail.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, p: pos, moved: false, lx: e.clientX, lt: performance.now(), vx: 0, id: e.pointerId };
  });
  rail.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 7) { drag.moved = true; rail.classList.add('dragging'); try { rail.setPointerCapture(drag.id); } catch (_) { } }
    if (drag.moved) {
      const now = performance.now(), dt = Math.max(1, now - drag.lt);
      drag.vx = 0.7 * drag.vx + 0.3 * ((e.clientX - drag.lx) / dt * 1000);
      drag.lx = e.clientX; drag.lt = now;
      pos = drag.p - dx; paint();
    }
  });
  const end = () => {
    if (drag && drag.moved) { v = Math.max(-2500, Math.min(2500, -drag.vx)); suppress = true; setTimeout(() => { suppress = false; }, 50); }
    drag = null; rail.classList.remove('dragging');
  };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
  rail.addEventListener('click', e => { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
  rail.addEventListener('dragstart', e => e.preventDefault());
  rail.addEventListener('focusin', e => {
    const c = e.target.closest('.card'); if (!c) return;
    hover = true;
    const left = c.offsetLeft - pos, right = left + c.offsetWidth;
    if (left < 20) pos = Math.max(0, c.offsetLeft - 40);
    else if (right > rail.clientWidth - 20) pos = Math.max(0, c.offsetLeft + c.offsetWidth - rail.clientWidth + 40);
    rail.scrollLeft = 0; paint();
  });
  rail.addEventListener('focusout', () => { hover = false; });
  let rz; const ro = new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(build, 120); });
  ro.observe(rail);
  build();
  return {
    rail,
    step(dt) {
      if (!visible || drag && drag.moved) return;
      const target = base() * (hover ? 0.14 : 1);
      v += (target - v) * Math.min(1, dt * (Math.abs(v) > Math.abs(target) * 1.5 ? 1.6 : 2.4));
      pos += v * dt; paint();
    },
    destroy() { io.disconnect(); ro.disconnect(); },
  };
}

// ------------------------------------------------------------------ views
let cleanup = [];
const view = $('#view');

function rateHTML(t) {
  if (t.pffffts) return `<div class="rate pf">${dots(t.pffffts, 3)}<span>${t.pffffts} PFFFFT${t.pffffts === 1 ? '' : 's'}</span></div>`;
  if (t.teehees != null) return `<div class="rate">${dots(t.teehees)}<span>${t.teehees} TEE-HEE${t.teehees === 1 ? '' : 's'}</span></div>`;
  return '';
}
const HOW_HTML = `<div class="rick-how" hidden>${rick.HOW.map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
// Rick reviews the movie in question, from a seat, never from the ship. The excursion itself lives at TFRTA (Pierce, 2026-10-08).
function rickBox(t, o = {}) {
  const has = !!t.review;
  const post = t.id && TF_BY_FV[t.id];
  return `<div class="rick"><img class="av" src="img/mark/rick.png" alt="" width="96" height="96"><div><div class="who"><span>${esc(o.who || "Rick's review")}</span><button class="howrick" type="button" aria-expanded="false">How Rick rates</button></div>
    <blockquote${has ? '' : ' class="none"'}>${has ? esc(t.review) : "Rick hasn't been yet."}</blockquote>
    ${has ? rateHTML(t) : ''}${HOW_HTML}</div></div>
    ${post && !o.noPost ? `<p class="tfrta-link"><a href="#/tfrta/${post.id}"><b>TFRTA</b>The agency's post on this excurience, with Rick's other opinion.</a></p>` : ''}`;
}
function paras(s) { return String(s).split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join(''); }

// ---------- the trophy band's stickers, shared by the home page and the Trophy Room
function secretState() { return store.get('found', {}); }
/* the gold trophy renders (Pierce's, 2023) go in img/trophy/<file>.png as they are, resized only; list them here as they land */
/* Pierce's gold renders (2026-10-08), keyed by award name; unaltered, in img/trophy/. The rest wait on the next batch. */
const TROPHY_ART = {
  'Hilarious Genius': 'comedy.webp', 'Master Storyteller': 'drama.webp', 'Horror Maven': 'horror.webp', 'Visionary Futurist': 'sci-fi.webp',
  'Hopeless Romantic': 'romance.webp', 'Fearless Trailblazer': 'action.webp', 'Family-Friendly Wizard': 'family.webp', 'Informative Documentarian': 'documentary.webp',
  'Hidden Gem Hunter': 'hidden-gem-hunter.webp', 'Puzzle Master': 'puzzle-master.webp',
  // generated to match, 2026-10-08 (ChatGPT, house prompt in the trophy notes)
  'Suspenseful Maestro': 'thriller.webp', 'Best Animated Movie Idea': 'animation.webp', 'Golden Ticket': 'golden-ticket.webp',
  // the other twenty-eight, generated to match on 2026-10-08 (ChatGPT, the house prompt, one chat for one look)
  'Box of Popcorn': 'box-of-popcorn.webp', '3D Glasses': '3d-glasses.webp', 'Golden Statue': 'golden-statue.webp', 'Red Carpet': 'red-carpet.webp',
  'Lifetime Achievement': 'lifetime-achievement.webp', 'One Hit Wonder': 'one-hit-wonder.webp', 'The Silent Observer': 'silent-observer.webp', 'Finally Got It Right': 'finally-got-it-right.webp',
  'Idea Machine': 'idea-machine.webp', 'Unpopular Opinion': 'unpopular-opinion.webp', 'Social Butterfly': 'social-butterfly.webp', 'The Spammer': 'the-spammer.webp',
  'Master of Time': 'master-of-time.webp', 'Cinema Addict': 'cinema-addict.webp', 'Big Time Viewer': 'big-time-viewer.webp', '1 Hour on Fiction Vision': 'hours-1.webp',
  '10 Hours on Fiction Vision': 'hours-10.webp', '25 Hours on Fiction Vision': 'hours-25.webp', '100 Hours on Fiction Vision': 'hours-100.webp', '1000 Hours on Fiction Vision': 'hours-1000.webp',
  'Top Secret Society': 'top-secret-society.webp', 'The Secret Menu': 'secret-menu.webp', 'Reverse Vision': 'reverse-vision.webp', 'VIP Lounge': 'vip-lounge.webp',
  'Flipping Out': 'flipping-out.webp', 'Ctrl Yourself': 'ctrl-yourself.webp', 'Magic Wand': 'magic-wand.webp', 'Hidden Depths': 'hidden-depths.webp',
};
function stickerFor(kind, s, i, found) {
  const pad = n => String(n).padStart(3, '0');
  const rot = (((i * 53 + 17) % 41) - 20) / 10;
  const o = { rot, emblem: emblem(s.name) };
  const art = TROPHY_ART[s.name] ? 'img/trophy/' + TROPHY_ART[s.name] : '';
  const spon = solace.plate('trophies');
  if (kind === 'genre') return stickerHTML({ name: s.name, quote: s.quote, cat: s.genre, no: 'FV / ' + pad(i + 1), art, back: 'Awarded to the idea with the most clicks in ' + esc(s.genre.toLowerCase()) + '.' + spon }, o);
  if (kind === 'creator') return stickerHTML({ name: s.name, quote: s.quote, cat: s.line.replace(/[\u201c\u201d"]?I[\u2019']d Watch This[\u201c\u201d"]?\s*/i, '').replace(/\s+/g, ' ').trim(), no: 'FV / ' + pad(101 + i), back: 'Awarded at ' + esc(s.earn) + '.' + spon, art }, o);
  if (kind === 'mischief') {
    const key = Object.keys(AWARDS).find(k => AWARDS[k] === s.name), earned = key && secretState()[key];
    return stickerHTML({ name: s.name, quote: s.quote, cat: earned ? 'Earned' : 'Milestone', no: 'FV / ' + pad(201 + i), art, back: (earned ? 'You earned this one. ' : 'One of the original awards. ') + (key === 'one-hit-wonder' ? 'For saving your first idea on FictionVision.' : '') + spon, cls: earned ? 'got' : '' }, o);
  }
  const got = s.key && found[s.key];
  return got ? stickerHTML({ name: s.name, quote: s.quote, cat: 'Secret find', no: 'FV / ' + pad(301 + i), art, back: 'You found this one.' + spon, cls: 'got' }, o)
    : stickerHTML({ name: 'Not found yet', quote: 'Keep looking. It is somewhere on FictionVision.', cat: 'Secret find', no: 'FV / ' + pad(301 + i), back: 'Still hidden.', cls: 'locked' }, { ...o, emblem: emblem('Not found yet') });
}

// ---------- home
function home() {
  const lvl = disc.level();
  const favIds = ['mansquatch', 'fridge-raiders', 'the-invisible-giraffe-detective', 'bare-bread', 'alien-table-talk', 'intergalactic-mall-cop', 'greatest-pranks-in-the-multiverse', 'the-long-road', 'fortune-byte', 'night-riders', 'robot-toast-apocalypse', 'bleep'];
  const favs = by(favIds);
  const rest = ARCH.filter(t => !favIds.includes(t.id));
  const comedy = rest.filter(t => inGenre(t, 'comedy'));
  const scifi = rest.filter(t => inGenre(t, 'scifi') && !inGenre(t, 'comedy'));
  const dark = rest.filter(t => (inGenre(t, 'horror') || inGenre(t, 'thriller')) && !inGenre(t, 'comedy'));
  const other = rest.filter(t => ![comedy, scifi, dark].some(a => a.includes(t)));
  const ex = FV.titles.filter(t => t.src === 'ptu39').sort((a, b) => P[a.planet].order - P[b.planet].order || a.slot - b.slot);
  const anti = by(['the-feed', 'followed', 'going-viral', 'inflated']);
  const mq = T['mansquatch'];
  const tr = FV.trophies;
  const three = [[tr.creator[0], 'creator', 0], [tr.genre[7], 'genre', 7], [tr.genre[1], 'genre', 1]];
  const quiet = mix([], UNIV.filter(t => t.spot && !['the-feed', 'followed', 'going-viral', 'inflated'].includes(t.id)).slice(0, 12), 1);
  const yours = [...list].map(i => T[i]).filter(Boolean);

  return {
    html: `
    <section class="bb">
      <div class="art"><img src="${mq.img.full}" alt="${esc(mq.title)} poster" width="${mq.img.w}" height="${mq.img.h}" fetchpriority="high"></div>
      <div class="shade"></div>
      <div class="copy"><span class="kicker">Fan favorite</span>
        <h1>${esc(mq.title)}</h1><p>${esc(firstSentences(mq.lead, 2))}</p>
        <div class="btns"><a class="ghost" href="#/t/${mq.id}">More about it ${ARROW}</a>${watchBtn(mq.id)}</div></div>
    </section>
    <div class="rows">
      ${yours.length ? row('Your list', yours, { dir: 1, static: true, more: '#/list', moreLabel: 'Open' }) : ''}
      ${row('The ones people kept asking about', favs, { dir: -1 })}
      ${rowHTML('Games', gameCards(), { static: true, more: '#/games', moreLabel: 'All games' })}
      ${row('Comedy', comedy, { dir: 1, more: '#/ideas/comedy' })}
      ${row('Sci-fi', scifi, { dir: -1, more: '#/ideas/scifi' })}
      ${row('Horror and thrillers', dark, { dir: 1, more: '#/ideas/horror' })}
      ${row('Stranger still', other, { dir: -1 })}
      <section class="band nosocial">
        <h2>We're not on social media. Here's why.</h2>
        <p class="lede">Everybody out here tried it once. This is how that went.</p>
        <div class="grid4">${anti.map(t => `<div>${card(t)}<div class="line"><b>${esc(t.title)}</b>${esc(t.lead)}</div></div>`).join('')}</div>
      </section>
      <section class="band trophy-band" id="trophyBand">
        <div><h2>The Trophy Room</h2><p class="lede">The cards, for the ideas that earn them. Tap one to turn it over.</p>
          <p style="margin:16px 0 0"><a class="ghost" href="#/trophies">Go to the Trophy Room ${ARROW}</a></p></div>
        <div class="three">${three.map(([s, k, i], n) => stickerFor(k, s, i + n * 3, {})).join('')}</div>
      </section>
      ${rowHTML('PTU Radio', ALBUMS.map(albumCard).join(''), { dir: 1, more: '#/music', moreLabel: 'Open PTU Radio HQ' })}
      ${lvl >= 1 ? row('Thirty-nine excuriences', ex, { dir: -1, more: '#/ptu', moreLabel: 'See where they stream' }) : row('From the Pool Table Universe', quiet, { dir: -1, more: '#/ptu', moreLabel: 'See more' })}
      ${lvl >= 2 ? rowHTML('The route', FV.planets.map(p => tile(p, { defer: !calm() })).join(''), { dir: 1, more: '#/ptu', moreLabel: 'Open the route' }) : ''}
      <section class="band submit-band">
        <h2>Got an idea for a movie or a show?</h2>
        <p class="lede">You don't need to know a thing about AI. Tell us what happens in your own words and we'll put it where people who buy ideas are looking.</p>
        <a class="cta" href="#/submit">Submit your idea</a>
      </section>
    </div>`,
    after(root) {
      $$('[data-watch]', root).forEach(paintWatchBtn);
      initRails(root);
      cleanup.push(mountStickers($('#trophyBand', root)));
    },
  };
}

// ---------- ideas: rows by what is in them
function chipsHTML(f) {
  const filters = [['all', 'Everything'], ...(disc.level() >= 1 ? [['ptu', 'Pool Table Universe']] : []), ...Object.entries(GENRES).map(([k, v]) => [k, v[0]]), ['series', 'Series'], ...(store.get('found', {}).menu ? [['late', 'After dark']] : [])];
  return `<div class="chips" role="toolbar" aria-label="Filter">${filters.map(([k, l]) => `<a href="#/ideas${k === 'all' ? '' : '/' + k}" class="${k === f ? 'on' : ''}">${esc(l)}</a>`).join('')}</div>`;
}
function ideas(f) {
  if (f === 'late' && !store.get('found', {}).menu) f = '';
  if (f === 'all') f = '';
  const pass = t => {
    if (f === 'late') return late(t);
    if (late(t)) return false;
    if (f === 'ptu') return !!t.planet;
    if (f === 'series') return t.kind === 'Series';
    return GENRES[f] ? inGenre(t, f) : true;
  };
  if (f) {
    const items = mix(ARCH.filter(pass), UNIV.filter(pass), 3);
    const lateOnly = f === 'late' ? FV.titles.filter(late) : null;
    const all = lateOnly || items;
    const name = f === 'late' ? 'The Secret Menu' : f === 'ptu' ? 'Pool Table Universe' : f === 'series' ? 'Series' : (GENRES[f] ? GENRES[f][0] : 'Ideas');
    return {
      title: name,
      html: `<div class="page"><div class="page-head"><span class="kicker">Ideas</span><h1>${esc(name)}</h1>
        <p>${f === 'late' ? 'You clicked the logo ten times. These are the ones we keep in the back.' : `${all.length} titles. Tap any poster to open it.`}</p></div>
        ${chipsHTML(f)}
        ${all.length ? `<div class="grid">${all.map(t => card(t)).join('')}</div>` : '<p class="empty">Nothing here yet.</p>'}</div>`,
    };
  }
  const rows = Object.keys(GENRES).map((g, i) => {
    const a = ARCH.filter(t => inGenre(t, g)), b = UNIV.filter(t => inGenre(t, g));
    return row(GENRES[g][0], mix(a, b, 3).slice(0, 28), { dir: i % 2 ? -1 : 1, more: '#/ideas/' + g });
  }).join('') + row('Series', mix(ARCH.filter(t => t.kind === 'Series'), UNIV.filter(t => t.kind === 'Series'), 3), { dir: -1, more: '#/ideas/series' });
  return {
    title: 'Ideas',
    html: `<div class="page"><div class="page-head"><span class="kicker">Ideas</span><h1>Everything on FictionVision</h1>
      <p>${shown.length} titles, sorted by what they are. Tap any poster to open it.</p></div>
      ${chipsHTML('')}<div class="rows" style="margin-top:0">${rows}</div>
      <section class="band" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-top:0">
        <div><h2>The Trophy Room</h2><p class="lede">Stickers for the ideas that earn them.</p></div>
        <a class="ghost" href="#/trophies">Go to the Trophy Room ${ARROW}</a></section></div>`,
    after(root) { $$('[data-watch]', root).forEach(paintWatchBtn); initRails(root); },
  };
}

// ---------- video stages and mastheads: a 16:9 video at its own ratio, never cropped, fading into black on the left
function stageHTML(vid, still, o = {}) {
  return `<div class="vstage${o.cls ? ' ' + o.cls : ''}" data-vid="${vid}" data-kind="${o.kind || 'main'}">
    ${still ? `<img class="still" src="${still}" alt="" width="${o.sw || 1280}" height="${o.sh || 720}" decoding="async">` : ''}
    <video muted playsinline preload="none" aria-hidden="true"></video>${o.sound ? speakerHTML : ''}${vplayHTML}</div>`;
}
function mast(o) {
  return `<section class="mast mv ${o.cls || ''}"${o.id ? ` id="${o.id}"` : ''}>
    <div class="vwrap">${stageHTML(o.vid, o.still, { sound: true })}</div>
    <div class="shade"></div>
    <div class="copy">${o.kicker ? `<span class="kicker">${o.kicker}</span>` : ''}<h1>${esc(o.title)}</h1>${o.facts ? `<p class="facts">${esc(o.facts)}</p>` : ''}${o.text ? `<p>${esc(o.text)}</p>` : ''}<div class="btns">${o.btns || ''}</div></div>
  </section>`;
}
const SWITCH = `<button class="ghost switch" type="button" role="switch" aria-checked="false" data-ambient><span class="knob" aria-hidden="true"></span><span>Ambient</span><i class="st">Off</i></button>`;

// ---------- PTU Radio: thirteen stations, each a being in SOLACE headphones, ten songs on each
const ALBUMS = radio.albums;
const ALB = Object.fromEntries(ALBUMS.map(a => [a.slug, a]));
function albumCard(a) {
  const n = radio.songCount(a);
  return `<div class="card sq alb-card" data-slug="${a.slug}">
    <div class="cvw"><a class="cv" href="#/music/${a.slug}" aria-label="${esc(a.name)}"><span class="frame"><img class="poster in" src="${a.coverS}" alt="" width="400" height="400" loading="lazy" decoding="async" draggable="false"></span></a>
    <button class="cplay" type="button" data-play="${a.slug}:0" aria-label="Play ${esc(a.planet)} Radio">${PLAY}</button></div>
    <a class="albcap" href="#/music/${a.slug}"><b>${esc(a.planet)} Radio</b><small>Vol. 1 · ${n} songs</small></a></div>`;
}
function albumBlock(a, o = {}) {
  const w = P[a.slug];
  return `<section class="alb${o.small ? ' sm' : ''}" id="radio" data-slug="${a.slug}">
    <div class="alb-cv"><img src="${a.cover}" alt="${esc(a.name)} cover" width="1200" height="1200" decoding="async"></div>
    <div class="alb-main">
      <div class="alb-head">
        <span class="kicker">PTU Radio HQ · Deck ${a.deck}</span>
        ${o.h1 ? `<h1>${esc(a.name)}</h1>` : `<h2>${esc(a.name)}</h2>`}
        <p class="alb-st">${esc(a.sub)}</p>
        <div class="btns"><button class="ghost" type="button" data-playalb="${a.slug}" data-name="${esc(a.planet)}">${PLAY}<span>Play <span class="nm">${esc(a.planet)} </span>Radio</span></button>
          ${o.small ? `<a class="ghost" href="#/music/${a.slug}">Open the album</a>${SWITCH}` : `<a class="world-chip" href="#/ptu/${a.slug}"><img src="${w.mark}" alt=""><span>Go to <b>${esc(a.planet)}</b></span></a>`}</div>
      </div>
      <div class="alb-body">
        <div class="alb-vid">${stageHTML(FVM.p[a.slug].being, a.coverS, { cls: 'being', sw: 400, sh: 400 })}</div>
        <ol class="tracks">${radio.trackRows(a)}</ol>
      </div>
    </div></section>`;
}
function music() {
  const fs = T['ptu-prearth-2'];
  return {
    title: 'PTU Radio HQ',
    html: `
    ${mast({
      vid: FVM.hq, kicker: 'Deck 12 · aboard SOLACE', title: 'PTU Radio HQ',
      text: 'One station for each of the thirteen planets, and ten songs on each. Tap a face to hear it.',
      btns: `<button class="ghost" type="button" data-radio>${PLAY}<span>Play the radio</span></button>${SWITCH}`,
    })}
    <div class="sec-label">The stations</div>
    <div class="albums-grid">${ALBUMS.map(albumCard).join('')}</div>
    ${fs ? `<section class="studio"><div class="studio-in">${card(fs)}<div><span class="kicker" style="color:var(--green)">The field studio</span><h2>${nb(fs.title)}</h2>
      <p>PTU Radio broadcasts from Deck 12 of SOLACE. This is its field studio, straight from Prearth's molten core: ${esc(fs.subtitle_title || '')}.</p>
      <p><a class="ghost" href="#/t/${fs.id}">Open the title ${ARROW}</a></p></div></div></section>` : ''}
    ${door()}`,
    after(root) { $$('[data-watch]', root).forEach(paintWatchBtn); },
  };
}
function albumPage(slug) {
  const a = ALB[slug];
  if (!a) return notFound();
  const i = ALBUMS.indexOf(a), nx = ALBUMS[(i + 1) % ALBUMS.length], pv = ALBUMS[(i + ALBUMS.length - 1) % ALBUMS.length];
  return {
    title: a.name,
    html: `<div class="page album-page">
      <p class="crumbs"><a href="#/music">PTU Radio HQ</a><span aria-hidden="true">/</span>${esc(a.planet)}</p>
      ${albumBlock(a, { h1: true })}
      <div class="sec-label">Next on the dial</div>
      <div class="albums-grid two">${albumCard(pv)}${albumCard(nx)}</div>
      ${door()}</div>`,
  };
}

// ---------- Aboard SOLACE: the hub of the Pool Table Universe
function stop(p, label) {
  const vt = FVM.p[p.slug].tile;
  return `<a class="card tile" href="#/ptu/${p.slug}" data-tile="${vt}"><span class="frame"><img class="poster in" src="${p.still}" alt="" width="1280" height="720" loading="lazy"></span><img class="mk" src="${p.mark}" alt=""><span class="cap"><small>${esc(label)}</small><b>${esc(p.name)}</b></span></a>`;
}
function ptu() {
  disc.mark('hub');
  const ex = FV.titles.filter(t => t.src === 'ptu39').sort((a, b) => P[a.planet].order - P[b.planet].order || a.slot - b.slot);
  const fresh = FV.titles.filter(t => t.src === 'new' && !['the-feed', 'followed', 'going-viral', 'inflated'].includes(t.id));
  const aboard = FV.titles.filter(t => t.planet === 'solace');
  return {
    title: 'Aboard SOLACE',
    html: `
    ${mast({
      vid: FVM.atrium, kicker: 'The Pool Table Universe · Deck 4', title: 'Aboard SOLACE',
      text: 'SOLACE is the cruise line that runs between all thirteen planets. You board on Deck 4, the excursion desk is on Deck 15, and Rick reviews the excuriences before you spend a single Wishbone.',
      btns: `<a class="ghost" href="#/ptu/planet-zee">Start at Planet Zee ${ARROW}</a><button class="ghost" id="rand" type="button">Take me somewhere</button>`,
    })}
    <div class="sec-label" style="margin-top:clamp(18px,2.4vw,36px)">The route</div>
    <nav class="route" aria-label="Planets">${FV.planets.map(p => tile(p)).join('')}</nav>
    <div class="sec-label">The decks</div>
    <div class="doors">
      <a class="deck" href="#/music"><span class="kicker">Deck 12</span><b>PTU Radio HQ</b><span>Thirteen stations, one for each planet.</span></a>
      <button class="deck" type="button" data-scroll="ex39"><span class="kicker">Deck 15</span><b>Excuriences</b><span>The thirty-nine, in route order.</span></button>
      <button class="deck" type="button" data-scroll="aboard"><span class="kicker" style="color:var(--green)">Shot aboard</span><b>SOLACE</b><span>The ones that never left the ship.</span></button>
    </div>
    <div class="rows">
      <div id="ex39">${row('Thirty-nine excuriences', ex, { dir: 1, static: true })}</div>
      ${row('Brand new from the Pool Table Universe', fresh, { dir: -1, static: true })}
      ${rowHTML('PTU Radio', ALBUMS.map(albumCard).join(''), { static: true, more: '#/music', moreLabel: 'Open PTU Radio HQ' })}
      <div id="aboard">${row('Shot aboard SOLACE', aboard, { dir: 1, static: true })}</div>
    </div>`,
    after(root) {
      $('#rand', root).addEventListener('click', takeMeSomewhere);
      $$('[data-scroll]', root).forEach(b => b.addEventListener('click', () => { const n = document.getElementById(b.dataset.scroll); if (n) n.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' }); }));
      $$('[data-watch]', root).forEach(paintWatchBtn);
    },
  };
}
function takeMeSomewhere() {
  const ex = FV.titles.filter(t => t.src === 'ptu39');
  location.hash = '#/t/' + ex[Math.floor(Math.random() * ex.length)].id;
}

// ---------- a planet, built around its video
function channel(slug) {
  const p = P[slug];
  if (!p) return notFound();
  disc.mark('planet:' + slug);
  const { ex, more } = titlesOn(slug);
  const prev = FV.planets[(p.order - 2 + 13) % 13], next = FV.planets[p.order % 13];
  const al = ALB[slug];
  const listing = t => `<article class="listing">${card(t, { xnum: false })}
    <div><h3><a href="#/t/${t.id}">${esc(t.title)}</a></h3>${t.subtitle ? `<p class="subt">${esc(t.subtitle)}</p>` : ''}
    ${rateHTML(t)}
    ${t.aboard && t.planet ? `<p class="aboard"><span class="lbl">Aboard SOLACE:</span> <b>${esc(t.aboard)}</b></p>` : ''}${TF_BY_FV[t.id] ? `<p class="tfrta-link"><a href="#/tfrta/${TF_BY_FV[t.id].id}"><b>TFRTA</b>Read the post</a></p>` : ''}</div></article>`;
  return {
    title: p.name,
    html: `
    ${mast({
      id: 'hero', vid: FVM.p[slug].deck, still: p.still,
      kicker: `<img src="${p.mark}" alt="${esc(p.name)}">Pool Table Universe · Planet ${p.order} of 13`, title: p.name, facts: `${p.galaxy} · ${p.being}`,
      btns: `<button class="ghost" type="button" data-playalb="${slug}" data-name="${esc(p.name)}">${PLAY}<span>Play <span class="nm">${esc(p.name)} </span>Radio</span></button><a class="ghost" href="#/show/${slug}">${PLAY}<span>The asteroid show</span></a><a class="ghost nxt" href="#/ptu/${next.slug}">Next stop: ${esc(next.name)} ${ARROW}</a><button class="ghost" id="rand" type="button">Take me somewhere</button>`,
    })}
    <div class="sec-label" style="margin-top:clamp(18px,2.4vw,36px)">${ex.length === 3 ? 'The three excuriences' : 'The excuriences'}</div>
    <div class="listings">${ex.map(listing).join('')}</div>
    ${al ? `<div style="margin-top:clamp(24px,3.4vw,56px)">${albumBlock(al, { small: true })}</div>` : ''}
    ${more.length ? `<div style="margin-top:clamp(24px,3.4vw,56px)">${row('Also streaming from ' + p.name, more, { static: true })}</div>` : ''}
    <div class="sec-label">Staterooms aboard SOLACE</div>
    <div class="chips-row">${p.staterooms.map(s => `<span>${esc(s)}</span>`).join('')}</div>
    <nav class="stops" aria-label="SOLACE route">${stop(prev, 'Previous stop')}${stop(next, 'SOLACE departs for')}</nav>
    ${door()}`,
    after(root) {
      $$('[data-watch]', root).forEach(paintWatchBtn);
      $('#rand', root).addEventListener('click', takeMeSomewhere);
      const go = s => { location.hash = '#/ptu/' + s; };
      const key = e => { if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(document.activeElement.tagName)) return; if (e.key === 'ArrowRight') go(next.slug); else if (e.key === 'ArrowLeft') go(prev.slug); };
      addEventListener('keydown', key);
      let sx = null, sy = 0;
      const hero = $('#hero', root);
      hero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      hero.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(dx < 0 ? next.slug : prev.slug); }, { passive: true });
      cleanup.push(() => removeEventListener('keydown', key));
    },
  };
}

// ---------- title page: the poster and the writeup end together
function door() {
  return `<section class="door"><div><h3>Have one like this?</h3><p>Your idea, in your words. We make the poster and put it where buyers are looking.</p></div><a class="cta" href="#/submit">Submit your idea</a></section>`;
}
let originalsP = null;
const loadOriginals = () => originalsP || (originalsP = fetch('js/originals.json').then(r => r.json()).catch(() => ({})));

function titlePage(id) {
  id = FV.aliases[id] || id;
  const t = T[id];
  if (!t) return notFound();
  if (t.src === 'original') unlock('reverse');
  if (t.planet) disc.mark(t.id);
  const w = worldOf(t);
  const portrait = t.orient === 'p';
  const chip = w ? `<a class="world-chip" href="#/ptu/${w.slug}"><img src="${w.mark}" alt=""><span>Streaming from <b>${esc(w.name)}</b></span></a>` : '';
  const meta = [t.kind, t.genre].filter(Boolean);
  // Rick reviews every title. The Pool Table Universe stays on its own titles: an idea from the archive is never moved onto a planet by its page (Pierce, 2026-10-07)
  const link = id === 'bleep-the-guffaw-7-open' ? `<p class="note">This started as <a href="#/t/bleep">Bleep</a>, one of the older posters in the archive.</p>` : '';
  const sameWorld = w ? FV.titles.filter(x => x.planet === t.planet && x.id !== t.id) : [];
  const g = Object.keys(GENRES).find(k => inGenre(t, k));
  const sameGenre = g ? mix(ARCH.filter(x => x.id !== t.id && inGenre(x, g)), UNIV.filter(x => x.id !== t.id && inGenre(x, g) && !sameWorld.includes(x)), 3).slice(0, 24) : [];
  const preview = t.video || t.preview;
  const lead = t.lead || 'Only the poster made it out. If this one is yours, tell us what happens in it.';
  const rick = rickBox(t);
  const body = (t.body || []).map(b => `<p>${esc(b)}</p>`).join('');
  return {
    title: t.title,
    html: `<article class="tp ${portrait ? 'p' : 'l'}" data-id="${t.id}" data-r="${(t.img.w / t.img.h).toFixed(4)}">
      <div class="backdrop" aria-hidden="true"><img src="${t.img.row}" alt=""></div>
      <div class="tp-in">
        <div class="tp-left">
          <div class="poster" style="--ce:${t.img.ce}"><img src="${t.img.full}" alt="${esc(t.title)} poster" width="${t.img.w}" height="${t.img.h}">${badgeHTML(t, true)}</div>
          ${portrait ? '' : `<div class="under wide">${rick}</div>`}
        </div>
        <div class="tp-info" id="info">
          <a class="back-link" href="${w ? '#/ptu/' + w.slug : '#/ideas'}">${ARROW_BACK} ${w ? 'All of ' + esc(w.name) : 'All the ideas'}</a>
          ${chip}
          <h1>${nb(t.title)}</h1>
          ${t.subtitle_title ? `<p class="alt">${esc(t.subtitle_title)}</p>` : ''}
          ${t.subtitle ? `<p class="subt">${esc(t.subtitle)}</p>` : ''}
          <div class="mrow"><div class="meta">${meta.map(m => `<span>${esc(m)}</span>`).join('')}</div><span class="sp"></span>
            <div class="btns">${id === 'ptu-prearth-2' ? `<a class="ghost" href="#/music">Tune in at PTU Radio HQ</a>` : ''}${preview ? `<button class="ghost" id="prev">${PLAY}<span>Watch the preview</span></button>` : ''}${watchBtn(t.id)}<a class="cta" href="#/submit">Submit your idea</a></div></div>
          <p class="lead">${esc(lead)}</p>
          ${body ? `<div class="story">${body}</div>` : ''}
          ${t.orig ? `<button class="more-btn" id="more" aria-expanded="false" aria-controls="orig">Read the whole idea</button><div class="orig" id="orig" hidden></div>` : ''}
          ${portrait ? rick : `<div class="narrow">${rick}</div>`}
          ${link}
        </div>
      </div>
      ${sameWorld.length ? row('More from ' + w.name, sameWorld, { static: true }) : ''}
      ${sameGenre.length ? row(w ? 'More like this' : 'More ' + GENRES[g][0].toLowerCase(), sameGenre, { static: true }) : ''}
      ${door()}
    </article>`,
    after(root) {
      $$('[data-watch]', root).forEach(paintWatchBtn);
      const tp = $('.tp', root), info = $('#info', root);
      // ---- read more, in place
      const more = $('#more', root), box = $('#orig', root);
      if (more) {
        more.addEventListener('click', async () => {
          const open = more.getAttribute('aria-expanded') === 'true';
          if (!open && !box.dataset.ready) {
            const o = await loadOriginals();
            box.innerHTML = paras(o[t.id] || '') + `<button class="more-btn" id="less" aria-expanded="true" aria-controls="orig">Show less</button>`;
            box.dataset.ready = '1';
            $('#less', box).addEventListener('click', () => more.click());
          }
          more.setAttribute('aria-expanded', String(!open));
          more.firstChild.nodeValue = open ? 'Read the whole idea' : 'Hide the rest';
          box.hidden = open;
          tp.dataset.open = open ? '' : '1';
          if (open) { fitTitle(tp); more.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' }); }
        });
      }
      // ---- the preview opens over the page, so the text never moves under anyone
      const pv = $('#prev', root);
      if (pv) pv.addEventListener('click', async () => {
        await solace.play({ kind: 'preview', hold: 2200, gateHold: 700 });   // brought to you by SOLACE, before every preview: a plate, not a ride
        const box2 = document.createElement('div');
        box2.className = 'vbox';
        box2.innerHTML = `<div class="vin"><video src="${preview}" controls autoplay playsinline></video><button class="vx" aria-label="Close the preview">Close</button></div>`;
        document.body.appendChild(box2);
        bus.claim('preview');
        const close = () => { const v = $('video', box2); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } box2.remove(); removeEventListener('keydown', esc2); bus.release('preview'); };
        const esc2 = e => { if (e.key === 'Escape') close(); };
        addEventListener('keydown', esc2);
        box2.addEventListener('click', e => { if (e.target === box2 || e.target.classList.contains('vx')) close(); });
        $('.vx', box2).focus();
        cleanup.push(close);
      });
      // ---- the poster is sized to the writeup beside it
      let rz;
      const refit = () => { clearTimeout(rz); rz = setTimeout(() => fitTitle(tp), 100); };
      addEventListener('resize', refit);
      cleanup.push(() => removeEventListener('resize', refit));
      requestAnimationFrame(() => fitTitle(tp));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitTitle(tp));
      $$('img', tp).slice(0, 3).forEach(i => { if (!i.complete) i.addEventListener('load', refit, { once: true }); });
    },
  };
}
function fitTitle(tp) {
  if (!tp || !tp.isConnected) return;
  const info = $('#info', tp), left = $('.tp-left', tp);
  const r = parseFloat(tp.dataset.r) || 0.75;
  tp.style.removeProperty('--pw'); tp.style.removeProperty('--lw');
  if (innerWidth < 1000 || tp.dataset.open === '1') return;
  if (tp.classList.contains('p')) {
    let w = parseFloat(getComputedStyle(tp).getPropertyValue('--pw')) || 520;
    const maxW = Math.min(innerWidth * 0.46, 760);
    for (let k = 0; k < 4; k++) {
      const h = info.getBoundingClientRect().height;
      const nw = clamp(h * r, 300, maxW);
      if (Math.abs(nw - w) < 1.5) break;
      w = nw; tp.style.setProperty('--pw', w + 'px');
    }
  } else {
    const cs = getComputedStyle($('.tp-in', tp));
    const F = Math.min(parseFloat(cs.width) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), 1900);
    // the poster column (poster and review) and the writeup column should end on the same line. Widening the poster
    // narrows the text, so the heights do not move together: try each width and keep the one where they end closest.
    left.style.alignSelf = info.style.alignSelf = 'start';
    const tries = [];
    for (let k = 0; k <= 16; k++) {
      const w = F * (0.34 + 0.26 * k / 16); tp.style.setProperty('--lw', w + 'px');
      tries.push([w, Math.abs(left.getBoundingClientRect().height - info.getBoundingClientRect().height)]);
    }
    const near = Math.min(...tries.map(t => t[1])) + 10;          // within ten pixels of the best fit: take the biggest poster
    const best = Math.max(...tries.filter(t => t[1] <= near).map(t => t[0]));
    left.style.alignSelf = info.style.alignSelf = '';
    tp.style.setProperty('--lw', best + 'px');
  }
}

function myList() {
  const items = [...list].map(i => T[i]).filter(Boolean);
  return {
    title: "I'd watch",
    html: `<div class="page"><div class="page-head"><span class="kicker">Yours</span><h1>Titles you'd watch</h1>
      <p>${items.length ? `${items.length} so far. This list lives on this device.` : ''}</p></div>
      ${items.length ? `<div class="grid">${items.map(t => card(t)).join('')}</div>` : `<p class="empty">Nothing yet. Tap "I'd watch this" on anything and it lands here.</p>`}</div>`,
  };
}

// ---------- the Trophy Room: a binder of puffy holographic stickers
// ---------- the Asteroid Show: Pierce's own (patches/asteroid-show, the Wishbones custom element), brought in the way the games were.
// It keeps its sky, its rocks, its music and its planet card; FictionVision keeps the bar, the kicker and the way back. The show reads
// ?planet= once on its way in, so the planet is put in the address for that moment and taken out again.
let showLoad = null;
function loadShow() {
  if (!showLoad) showLoad = new Promise((res, rej) => {
    if (customElements.get('custom-asteroidshow')) return res();
    const sc = document.createElement('script'); sc.src = new URL('patches/asteroid-show/patch.js', document.baseURI).href; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc);
  });
  return showLoad;
}
function showPage(slug) {
  const p = slug ? P[slug] : null;
  if (slug && !p) return notFound();
  return {
    title: 'The Asteroid Show' + (p ? ' · ' + p.name : ''),
    html: `<div class="show-page"><div class="show-head"><a class="back-link" href="${p ? '#/ptu/' + p.slug : '#/ptu'}">${ARROW_BACK} ${p ? esc(p.name) : 'Pool Table Universe'}</a><span class="kicker">Pool Table Universe · The Asteroid Show</span>${p ? `<b>${esc(p.name)}</b>` : ''}</div>
      <div class="show-stage" id="showStage"><p class="show-wait">Clearing the sky.</p></div></div>`,
    after(root) {
      const stage = $('#showStage', root); let el = null, dead = false;
      document.body.classList.add('show-on');
      cleanup.push(() => { dead = true; document.body.classList.remove('show-on'); if (el) { try { el.shadowRoot && el.shadowRoot.querySelectorAll('audio, video').forEach(m => { m.pause(); m.removeAttribute('src'); m.load(); }); } catch (e) { } el.remove(); } });
      const clean = location.href.replace(/\?[^#]*/, '');
      loadShow().then(() => {
        if (dead) return;
        if (p) try { history.replaceState(history.state, '', clean.replace(/#.*$/, '') + '?planet=' + encodeURIComponent(p.name) + location.hash); } catch (e) { }
        stage.innerHTML = ''; el = document.createElement('custom-asteroidshow'); stage.appendChild(el);
        try { history.replaceState(history.state, '', clean); } catch (e) { }
        // the bar stays: the show's top-right docks sit under it, and the Wishbones coin stays home
        const sr = el.shadowRoot;
        if (sr) { const st = document.createElement('style'); st.textContent = '.as-share-dock,.as-ctl-dock{top:calc(var(--bar-h) + 10px)!important}.asteroid-home-coin{display:none!important}'; sr.appendChild(st); }
      }).catch(() => { if (!dead) stage.innerHTML = `<div class="page"><div class="page-head"><h1>The show did not load.</h1><p>Check your connection and <a href="#/show${slug ? '/' + slug : ''}" style="color:var(--orange);border-bottom:1px solid currentColor">try again</a>.</p></div></div>`; });
    },
  };
}
function trophies() {
  const tr = FV.trophies, found = secretState();
  const live = tr.secret.filter(s => s.key);
  const sec = (title, sub, html) => `<section class="binder"><h2>${title}</h2><p class="sub">${sub}</p><div class="stickers">${html}</div></section>`;
  return {
    title: 'Trophy Room',
    html: `<div class="page"><div class="page-head"><span class="kicker">Trophy Room</span><h1>The Trophy Room</h1>
      <p>Tap a trophy to turn it over. Tilt your phone, or move your mouse across one, and it leans with you.</p></div>
      <button class="tilt-chip" id="tiltChip">Tilt to shimmer</button>
      ${sec('Genre champions', 'Awarded to the idea with the most "I\'d watch this" clicks in its genre.', tr.genre.map((s, i) => stickerFor('genre', s, i)).join(''))}
      ${sec('Creator milestones', 'For the people whose ideas are on here.', tr.creator.map((s, i) => stickerFor('creator', s, i)).join(''))}
      ${sec('Milestones and mischief', 'The originals, jokes and all.', tr.mischief.map((s, i) => stickerFor('mischief', s, i)).join(''))}
      ${sec('Secret finds', `${live.filter(s => found[s.key]).length} of ${live.length} found on this device.`, live.map((s, i) => stickerFor('secret', s, i, found)).join(''))}
    </div>`,
    after(root) { cleanup.push(mountStickers(root, { chip: $('#tiltChip', root) })); },
  };
}

// ---------- submit your idea
// Rick for hire: five dollars, one shot, and the submitter decides whether it shows (Pierce, 2026-10-08). Nothing is charged; the tab is the bit.
function mountRickReq(box, d) {
  const host = $('#rickReq', box);
  if (!host) return;
  const paint = () => {
    const r = store.get('rick', null);
    if (!r) {
      host.innerHTML = `<div class="rr"><div class="rr-head"><img src="img/mark/rick.png" alt="" width="56" height="56"><div><b>Want Rick's review?</b><span>Five dollars. One shot. You read it first, then decide whether it shows under your idea.</span></div></div>
        <div class="nav"><button class="howrick" type="button" aria-expanded="false">How Rick rates</button><button class="cta" id="rrAsk" type="button">Request Rick's review · $5</button></div>${HOW_HTML}</div>`;
      $('#rrAsk', host).addEventListener('click', terms);
      return;
    }
    const t = { review: r.text, teehees: r.teehees, pffffts: r.pffffts };
    const changed = r.title !== d.title ? `<p class="rr-note">Rick reviewed <b>${esc(r.title)}</b>. One shot was the deal, so the new title rides on the old review.</p>` : '';
    const verdict = r.shown == null
      ? `<p class="rr-note">Rick has been. Nobody else has seen this yet.</p><div class="nav"><button class="back" id="rrHide" type="button">Keep it between us</button><button class="cta" id="rrShow" type="button">Display it on my idea</button></div>`
      : r.shown ? `<p class="rr-note">Showing under your idea. <button class="link" id="rrHide" type="button">Take it down</button></p>`
        : `<p class="rr-note">Kept between you and Rick. <button class="link" id="rrShow" type="button">Display it after all</button></p>`;
    host.innerHTML = `<div class="rr">${rickBox(t, { noPost: true, who: "Rick's review of your idea" })}${changed}${verdict}<p class="rr-fine">One shot, as agreed. Rick does not re-review, and the five dollars sit on your FictionVision tab, which Rick has never once collected.</p></div>`;
    $('#rrShow', host)?.addEventListener('click', () => { r.shown = true; store.set('rick', r); paint(); });
    $('#rrHide', host)?.addEventListener('click', () => { r.shown = false; store.set('rick', r); paint(); });
  };
  const terms = () => {
    host.innerHTML = `<div class="rr"><div class="rr-head"><img src="img/mark/rick.png" alt="" width="56" height="56"><div><b>Here's the deal with Rick.</b><span>He watches it once. He writes what he thinks. He rates it in TEE-HEEs, or PFFFFTs if it comes to that.</span></div></div>
      <ol class="next-list">
        <li><span class="n">1</span><span><b>$5, one time, one idea.</b> It goes on your FictionVision tab. Rick has never collected a tab, and he is not starting with yours.</span></li>
        <li><span class="n">2</span><span><b>One shot.</b> No re-rolls, no edits, no second opinion from the competing company some say he runs.</span></li>
        <li><span class="n">3</span><span><b>You read it first.</b> Then you decide whether it shows under your idea. Two TEE-HEEs is a win. People frame PFFFFTs.</span></li>
      </ol>
      <div class="nav"><button class="back" id="rrNo" type="button">Not now</button><button class="cta" id="rrGo" type="button">Request it · $5</button></div></div>`;
    $('#rrNo', host).addEventListener('click', paint);
    $('#rrGo', host).addEventListener('click', () => {
      const r = rick.review(d); r.shown = null; store.set('rick', r);
      document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind: 'ding' } }));
      document.dispatchEvent(new CustomEvent('fv:event', { detail: { kind: 'rick', teehees: r.teehees, pffffts: r.pffffts } }));
      paint();
    });
  };
  paint();
}

function submit() {
  const d = Object.assign({ title: '', story: '', kind: '', name: '', email: '', step: 0 }, store.get('draft', {}));
  return {
    title: 'Submit your idea',
    html: `<section class="submit"><div class="sub-card" id="subCard"></div></section>`,
    after(root) {
      const box = $('#subCard', root);
      const save = () => store.set('draft', d);
      const N = 4;
      const steps = () => d.step < N ? `<div class="steps" aria-hidden="true">${Array.from({ length: N }, (_, i) => `<i class="${i <= d.step ? 'on' : ''}"></i>`).join('')}</div>` : '';
      const navHTML = (next = 'Next', back = true) => `<div class="err" id="err" role="alert"></div><div class="nav">${back ? '<button class="back" id="back">Back</button>' : '<span></span>'}<button class="cta" id="next">${next}</button></div>`;
      const cards = [
        () => `${steps()}<div class="q">Step 1 of 4</div><h1>What's your idea called?</h1><p class="help">A working title is fine.</p>
          <label for="f-title">The title</label><input id="f-title" type="text" maxlength="120" value="${esc(d.title)}" placeholder="Gargantuan Tarantulas with Spatulas" autocomplete="off" enterkeyhint="next">${navHTML('Next', false)}`,
        () => `${steps()}<div class="q">Step 2 of 4</div><h1>What happens in it?</h1><p class="help">Tell it the way you'd tell a friend. We don't rewrite it. The words you type are the words a buyer reads.</p>
          <label for="f-story">Your idea, your words</label><textarea id="f-story" maxlength="4000" placeholder="Start anywhere. Who is it about, and what goes wrong?">${esc(d.story)}</textarea><div class="count" id="cnt"></div>${navHTML()}`,
        () => `${steps()}<div class="q">Step 3 of 4</div><h1>Is it a movie or a show?</h1><p class="help">If you're not sure, pick the one you'd rather watch.</p>
          <div class="pick"><button data-k="Film" class="${d.kind === 'Film' ? 'on' : ''}"><b>A movie</b><span>One sitting, beginning to end.</span></button><button data-k="Series" class="${d.kind === 'Series' ? 'on' : ''}"><b>A show</b><span>Episodes. People come back for more.</span></button></div>${navHTML()}`,
        () => `${steps()}<div class="q">Step 4 of 4</div><h1>Who's it from?</h1><p class="help">So we can tell you when a buyer asks about it.</p>
          <label for="f-name">Your name</label><input id="f-name" type="text" maxlength="120" value="${esc(d.name)}" autocomplete="name" enterkeyhint="next">
          <label for="f-email">Your email</label><input id="f-email" type="email" maxlength="200" value="${esc(d.email)}" autocomplete="email" inputmode="email" enterkeyhint="go">${navHTML()}`,
        () => `${steps()}<div class="q">Here's what happens next</div><h1>Here's the deal.</h1>
          <div class="price-tag"><b>$29</b><span>one time</span></div>
          <ol class="next-list">
            <li><span class="n">1</span><span><b>We make up to 3 posters from your words.</b> You pick the one that's yours.</span></li>
            <li><span class="n">2</span><span><b>Your idea goes on FictionVision</b> with your poster, in front of studio buyers who are looking for ideas.</span></li>
            <li><span class="n">3</span><span><b>If a buyer wants it, they come to you through us, and we take a cut of the sale.</b> Your idea stays yours. We can't promise anyone will buy it.</span></li>
            <li><span class="n">4</span><span><b>Every title here streams somewhere in the Pool Table Universe.</b> We'll find yours a planet.</span></li>
          </ol>${navHTML('Sounds good')}`,
        () => `${steps()}<div class="q">Almost there</div><h1>Checkout opens soon.</h1>
          <p class="help">Your idea is saved on this device. Nothing was sent and nothing was charged. When checkout opens, it will be right here waiting for you.</p>
          <p class="help award-line"><b>You earned a sticker.</b> One Hit Wonder, one of the original awards, for saving your first idea. <a href="#/trophies">It's in the Trophy Room.</a></p>
          <div class="idea-proof"><div class="k">${d.kind === 'Series' ? 'A show' : 'A movie'} by ${esc(d.name)}</div><h3>${esc(d.title)}</h3><p>${esc(d.story)}</p></div>
          <div id="rickReq"></div>
          <div class="nav"><button class="back" id="edit">Change something</button><a class="ghost" href="#/">Back to watching</a></div>`,
      ];
      const err = m => { const e = $('#err', box); if (e) e.textContent = m; };
      const show = () => {
        box.innerHTML = cards[d.step]();
        if (d.step === cards.length - 1) unlock('one-hit-wonder');                 // the first saved idea earns its sticker
        if (d.step === cards.length - 1) mountRickReq(box, d);
        box.classList.remove('view-enter'); void box.offsetWidth; box.classList.add('view-enter');
        const f = $('input, textarea', box); if (f && innerWidth > 700) f.focus();
        const ta = $('#f-story', box), cnt = $('#cnt', box);
        if (ta) { const c = () => { const w = ta.value.trim().split(/\s+/).filter(Boolean).length; cnt.textContent = w ? `${w} word${w === 1 ? '' : 's'}` : ''; }; ta.addEventListener('input', c); c(); }
        $$('input, textarea', box).forEach(i => i.addEventListener('input', () => { d[i.id.slice(2)] = i.value; save(); }));
        $$('.pick button', box).forEach(b => b.addEventListener('click', () => { d.kind = b.dataset.k; save(); next(); }));
        $('#back', box)?.addEventListener('click', () => { d.step = Math.max(0, d.step - 1); save(); show(); });
        $('#next', box)?.addEventListener('click', next);
        $('#edit', box)?.addEventListener('click', () => { d.step = 0; save(); show(); });
        $$('input', box).forEach(i => i.addEventListener('keydown', e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const em = $('#f-email', box);
          if (i.id === 'f-name' && em && !em.value.trim()) { if (!i.value.trim()) return err('We need a name to put on it.'); err(''); em.focus(); return; }
          next();
        }));
        scrollTo(0, 0);
      };
      const next = () => {
        if (d.step === 0 && !d.title.trim()) return err('Give it a name, even a rough one.');
        if (d.step === 1 && d.story.trim().split(/\s+/).length < 5) return err('Tell us a little more. A few sentences is plenty.');
        if (d.step === 2 && !d.kind) return err('Pick one.');
        if (d.step === 3) {
          if (!d.name.trim()) return err('We need a name to put on it.');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return err("That email doesn't look right.");
        }
        d.step = Math.min(cards.length - 1, d.step + 1); save(); show();
      };
      show();
    },
  };
}

// ---------- games: OVER THE BOARD, chess against the thirteen beings (the game itself loads only when you open it)
function games(game, being) {
  // the two newer games load the same way as the chess: nothing until you open them
  const lazy = (file, title, name) => ({
    title,
    html: '<div id="gameRoot"></div>',
    after(root) {
      const hold = { dead: false, stop: null };
      cleanup.push(() => { hold.dead = true; if (hold.stop) hold.stop(); });
      import(file).then(m => { if (!hold.dead) hold.stop = m.mount($('#gameRoot', root), being || ''); })
        .catch(() => { if (!hold.dead) $('#gameRoot', root).innerHTML = `<div class="page"><div class="page-head"><h1>${name} did not load.</h1><p>Check your connection and <a href="#/games/${game}" style="color:var(--orange);border-bottom:1px solid currentColor">try again</a>.</p></div></div>`; });
    },
  });
  if (game === 'dead-ends') return lazy('./maze/maze.js', 'DEAD ENDS', 'The maze');
  if (game === 'in-pieces') return lazy('./puzzle/puzzle.js', 'IN PIECES', 'The puzzle');
  if (game === 'typecast') return lazy('./typecast/typecast.js', 'TYPECAST', 'The typing');
  if (game === 'name-that-planet') return lazy('./planet/planet.js', 'NAME THAT PLANET', 'The quiz');
  if (game === 'brain-bean') return lazy('./bean/bean.js', 'BRAIN BEAN COFFEE', 'The coffee');
  if (game === 'over-the-board') {
    return {
      title: 'OVER THE BOARD',
      html: '<div id="otbRoot"></div>',
      after(root) {
        const hold = { dead: false, stop: null };
        cleanup.push(() => { hold.dead = true; if (hold.stop) hold.stop(); });
        import('./chess/game.js').then(m => { if (!hold.dead) hold.stop = m.mount($('#otbRoot', root), being || ''); })
          .catch(() => { if (!hold.dead) $('#otbRoot', root).innerHTML = '<div class="page"><div class="page-head"><h1>The game did not load.</h1><p>Check your connection and <a href="#/games/over-the-board" style="color:var(--orange);border-bottom:1px solid currentColor">try again</a>.</p></div></div>'; });
      },
    };
  }
  return {
    title: 'Games',
    html: `<div class="page games-page"><div class="page-head"><span class="kicker">Games</span><h1>Games</h1><p>Six things to play on FictionVision. The thirteen beings of the Pool Table Universe host every one, and Pam pours the coffee.</p></div>
      <div class="gcards">${gameCards()}</div></div>`,
  };
}

// ---------- TFRTA, The Friendly Robot Travel Agency: the blog, back (Pierce, 2026-10-08). Pierce's own posts; Rick wrote them and reviewed them.
// an excurience's own picture: the first frame of its film (Pierce: "i have images and videos for these"), the planet's mark only if there is no film
const tfFrame = x => x.video ? `https://static.wixstatic.com/media/${x.video}f000.jpg/v1/fill/w_960,h_540,q_80/p.jpg` : x.thumb;
function postCard(x) {
  return `<a class="tf-card" href="#/tfrta/${x.id}"><span class="tf-thumb"><img src="${tfFrame(x)}" alt="" loading="lazy" decoding="async"></span><span class="tf-cap"><b>${esc(x.headline)}</b><small>${esc(x.sub)}</small><span class="tf-meta"><em>${esc(x.wishbones)}</em>${dots(x.teehees)}</span></span></a>`;
}
function tfrta() {
  const first = TFRTA.planets[0];
  const sect = TFRTA.planets.map(pl => {
    const p = P[pl.slug], posts = TFRTA.posts.filter(x => x.slug === pl.slug);
    return `<section class="tf-planet" id="tf-${pl.slug}">
      <div class="tf-ph"><img src="${p.mark}" alt=""><div><span class="kicker">${pl.post ? esc(pl.post.title) : 'The excuriences'} · Deck 15</span><h2><a href="#/ptu/${pl.slug}">${esc(pl.name)}</a></h2>${pl.post ? `<p class="tf-tag">${esc(pl.post.line)}</p>` : ''}<p class="tf-welcome">${esc(pl.welcome)}</p></div></div>
      <div class="tf-grid">${posts.map(postCard).join('')}</div></section>`;
  }).join('');
  return {
    title: 'TFRTA',
    html: `<div class="page tf">${mast({ id: 'tfHero', vid: first.video, still: P[first.slug].still, kicker: 'The Friendly Robot Travel Agency', title: 'TFRTA', facts: 'Rick writes the posts. Rick reviews them. He keeps the two apart.', text: 'Thirty-nine excuriences across the thirteen planets, each with its own film, its own Wishbones price, and a review Rick wrote after reading his own post.' })}${sect}${door()}</div>`,
    after(root) { $$('[data-watch]', root).forEach(paintWatchBtn); },
  };
}
function tfrtaPost(id) {
  const x = TFRTA.posts.find(p => p.id === id);
  if (!x) return notFound();
  const i = TFRTA.posts.indexOf(x), prev = TFRTA.posts[(i - 1 + TFRTA.posts.length) % TFRTA.posts.length], next = TFRTA.posts[(i + 1) % TFRTA.posts.length];
  const pl = TFRTA.planets.find(p => p.slug === x.slug), p = P[x.slug], t = x.fvId ? T[x.fvId] : null;
  const critic = { review: x.review, teehees: x.teehees };
  return {
    title: x.headline + ' · TFRTA',
    html: `<article class="page tf-post">
      <div class="page-head"><a class="world-chip flat" href="#/tfrta"><img src="${p.mark}" alt=""><span>TFRTA · <b>${esc(pl.name)}</b> · Excurience ${x.n} of 3</span></a><h1>${esc(x.headline)}</h1><p>${esc(x.sub)}</p></div>
      <div class="tf-video">${stageHTML(x.video, tfFrame(x), { sound: true, kind: 'main' })}</div>
      <div class="tf-body"><div class="tf-col"><p class="tf-by">By Rick, for the agency</p><p class="tf-text">${esc(x.body)}</p>
          <div class="tf-am"><span class="lbl">What's included</span><ul>${x.amenities.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
          <p class="tf-price"><b>${esc(x.wishbones)}</b>${t && t.aboard ? ` · <span class="lbl">Aboard SOLACE:</span> ${esc(t.aboard)}` : ''}</p></div>
        <div class="tf-side">${rickBox(critic, { noPost: true, who: 'Rick, from the aisle' })}${t ? `<a class="cta" href="#/t/${t.id}">Watch it on FictionVision</a>` : ''}</div></div>
      <nav class="tf-stops" aria-label="More posts"><a href="#/tfrta/${prev.id}">← ${esc(prev.headline)}</a><a href="#/tfrta/${next.id}">${esc(next.headline)} ${ARROW}</a></nav>${door()}</article>`,
  };
}

function notFound() {
  return { title: 'Not found', html: `<div class="page"><div class="page-head"><h1>That one isn't streaming.</h1><p>It may have left. <a href="#/" style="color:var(--orange);border-bottom:1px solid currentColor">Back to the home page</a>.</p></div></div>` };
}

// ------------------------------------------------------------------ router
try { history.scrollRestoration = 'manual'; } catch (e) { }
const spots = new Map();
let here = null;
addEventListener('scroll', () => { if (here != null) spots.set(here, scrollY); }, { passive: true });
function navItems() {
  const it = [['home', '#/', 'Home'], ['ideas', '#/ideas', 'Ideas'], ['music', '#/music', 'Music'], ['games', '#/games', 'Games'], ['tfrta', '#/tfrta', 'TFRTA']];
  if (disc.level() >= 1) it.push(['ptu', '#/ptu', 'Pool Table Universe']);
  it.push(['trophies', '#/trophies', 'Trophy Room']);
  return it;
}
let curNav = 'home';
function renderNav() {
  const it = navItems();
  $('#nav').innerHTML = it.map(([k, h, l]) => `<a href="${h}" data-nav="${k}">${l}</a>`).join('');
  $('#drawer').innerHTML = it.map(([k, h, l]) => `<a href="${h}" data-nav="${k}">${l}</a>`).join('') + `<a href="#/list" data-nav="list">I'd watch <span id="listN2"></span></a>`;
  $('#footNav').innerHTML = it.map(([k, h, l]) => `<a href="${h}">${l}</a>`).join('') + `<a href="#/submit">Submit your idea</a>`;
  setCurrent(curNav); paintList();
}
function setCurrent(nav) { curNav = nav; $$('[data-nav]').forEach(n => { if (n.dataset.nav === nav) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current'); }); }
// the planet of the page you are on (the ambient lullaby follows it); pages with none keep the last one
function planetOf(a, b) {
  if (a === 'ptu' && P[b]) return b;
  if (a === 'music' && ALB[b]) return b;
  if (a === 'show' && P[b]) return b;
  if (a === 't') { const t = T[FV.aliases[b] || b]; return t && t.planet && t.planet !== 'solace' ? t.planet : null; }
  return null;
}
// SOLACE brings you to a planet: the first time you travel to one in a visit, the elevator arrives at the observation deck with that
// planet in view, its own nebula and asteroid show; the reader opens the doors, and the page is there behind them. Not on the first
// load (the logo has that), not on the way back, never twice for the same planet in a visit. Skip is always on screen.
let routed = 0;
const arrived = new Set((() => { try { return JSON.parse(sessionStorage.getItem('fv.arrived') || '[]'); } catch (e) { return []; } })());
function arrive(a, b) {
  routed++;
  if (routed < 2 || a !== 'ptu' || !b || !P[b] || arrived.has(b) || calm()) return;
  arrived.add(b); try { sessionStorage.setItem('fv.arrived', JSON.stringify([...arrived])); } catch (e) { }
  document.dispatchEvent(new CustomEvent('fv:event', { detail: { kind: 'arrive', planet: b } }));
  solace.play({ kind: 'arrive', planet: b, enter: 'Step off at ' + P[b].name });
}
function route() {
  const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').map(decodeURIComponent);
  let [a, b] = parts;
  if (a === 'browse') { a = 'ideas'; b = b === '2023' ? '' : b; }   // old links still work
  let v, nav = a || 'home', jump = null;
  if (a === 'ptu' && b === 'solace') { b = ''; jump = 'aboard'; try { history.replaceState(history.state, '', '#/ptu'); } catch (e) { } }   // the ship is the hub now
  cleanup.forEach(f => { try { f(); } catch (e) { } }); cleanup = [];
  drifts.forEach(d => d.destroy()); drifts.length = 0;
  if (!a) v = home();
  else if (a === 'ptu') v = b ? channel(b) : ptu();
  else if (a === 'music') v = b ? albumPage(b) : music();
  else if (a === 't') v = titlePage(b);
  else if (a === 'ideas') v = ideas(b);
  else if (a === 'list') v = myList();
  else if (a === 'trophies') v = trophies();
  else if (a === 'show') v = showPage(b);
  else if (a === 'games') v = games(b, parts[2]);
  else if (a === 'tfrta') v = b ? tfrtaPost(b) : tfrta();
  else if (a === 'submit') v = submit();
  else v = notFound();
  if (a === 't') { const t = T[FV.aliases[b] || b]; nav = t && t.planet && disc.level() >= 1 ? 'ptu' : 'ideas'; }
  view.innerHTML = v.html;
  view.classList.remove('view-enter'); void view.offsetWidth; view.classList.add('view-enter');
  arrive(a, b);
  document.title = v.title ? `${v.title} · FictionVision` : 'FictionVision';
  setCurrent(nav);
  $('#foot').style.display = a === 'submit' ? 'none' : '';
  closeDrawer(); closeSearch();
  const st = history.state, seen = st && st.fv != null;
  if (!seen) { try { history.replaceState({ fv: Date.now() + Math.random() }, ''); } catch (e) { } }
  here = history.state && history.state.fv;
  const back = seen ? spots.get(here) || 0 : 0;
  scrollTo(0, 0);
  v.after && v.after(view);
  cleanup.push(mountMedia(view));
  radio.setPlanet(planetOf(a, b));
  radio.mountPage();
  if (jump) requestAnimationFrame(() => { const n = document.getElementById(jump); if (n) n.scrollIntoView({ block: 'start' }); });
  $$('[data-watch]', view).forEach(paintWatchBtn);
  if (back) { wake(view); requestAnimationFrame(() => scrollTo(0, back)); }
  onScroll();
}
addEventListener('hashchange', route);

// ------------------------------------------------------------------ chrome: bar, drawer, search
const bar = $('#bar');
function onScroll() { bar.classList.toggle('solid', scrollY > 30 || !/^#?\/?(ptu(\/[a-z0-9-]+)?|music)?$/.test(location.hash)); }
addEventListener('scroll', onScroll, { passive: true });
const drawer = $('#drawer'), menuBtn = $('#menuBtn');
function closeDrawer() { drawer.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => { const o = !drawer.classList.contains('open'); drawer.classList.toggle('open', o); menuBtn.setAttribute('aria-expanded', o); bar.classList.add('solid'); });
const search = $('#search'), q = $('#q'), res = $('#res');
function openSearch() { closeDrawer(); search.classList.add('open'); document.body.style.overflow = 'hidden'; q.focus(); runSearch(); }
function closeSearch() { search.classList.remove('open'); document.body.style.overflow = ''; }
$('#searchBtn').addEventListener('click', openSearch);
$('#searchBtn').addEventListener('click', () => document.dispatchEvent(new CustomEvent('fv:event', { detail: { kind: 'search' } })));
$('#searchClose').addEventListener('click', closeSearch);
search.addEventListener('click', e => { if (e.target.closest('a')) closeSearch(); });
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSearch(); closeDrawer(); }
  if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});
function chanChips(ps) { return `<div class="chan-chips">${ps.map(p => `<a href="#/ptu/${p.slug}"><img src="${p.mark}" alt="">${esc(p.name)}</a>`).join('')}</div>`; }
function runSearch() {
  const s = q.value.trim().toLowerCase();
  if (!s) { res.innerHTML = `<div class="grid-label">Genres</div><div class="chips">${Object.entries(GENRES).map(([k, v]) => `<a href="#/ideas/${k}">${esc(v[0])}</a>`).join('')}</div>`; return; }
  const hit = t => !late(t) && [t.title, t.lead, t.genre, t.world, t.subtitle].some(x => x && x.toLowerCase().includes(s));
  const items = FV.titles.filter(hit);
  const planets = FV.planets.filter(p => [p.name, p.being, p.galaxy].some(x => x.toLowerCase().includes(s)));
  const stations = ALBUMS.filter(a => a.name.toLowerCase().includes(s) || a.sub.toLowerCase().includes(s));
  const songs = [];
  ALBUMS.forEach(a => a.tracks.filter(t => !t.held).forEach((t, i) => { if (t.t.toLowerCase().includes(s)) songs.push({ a, t, i }); }));
  const radioHTML = (stations.length ? `<div class="grid-label">PTU Radio stations</div><div class="chan-chips">${stations.map(a => `<a href="#/music/${a.slug}"><img src="${a.coverS}" alt="" style="border-radius:6px">${esc(a.name)}</a>`).join('')}</div>` : '')
    + (songs.length ? `<div class="grid-label">Songs · ${songs.length}</div><ul class="tracks song-hits">${songs.slice(0, 12).map(({ a, t, i }) => `<li><button type="button" class="trk" data-play="${a.slug}:${i}" data-track="${a.slug}:${i}"><span class="no"><i class="eq" aria-hidden="true"><b></b><b></b><b></b></i><em>${i + 1}</em></span><span class="tt">${esc(t.t)}</span><span class="du">${esc(a.planet)}</span></button></li>`).join('')}</ul>` : '');
  res.innerHTML = (planets.length ? `<div class="grid-label">Planets</div>${chanChips(planets)}` : '') + radioHTML
    + (items.length ? `<div class="grid-label">Titles · ${items.length}</div><div class="grid">${items.map(t => card(t)).join('')}</div>` : '')
    + (!items.length && !planets.length && !stations.length && !songs.length ? `<p class="empty">Nothing called that yet. Maybe it's yours.</p><p class="empty" style="padding-top:0"><a class="cta" href="#/submit">Submit your idea</a></p>` : '');
}
q.addEventListener('input', runSearch);

// ------------------------------------------------------------------ secret finds (a nod to the first Trophy Room)
const toast = $('#toast');
let toastT;
function say(html) { toast.innerHTML = html; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 4200); }
/* the original awards that are earned here, by key: the sticker in Milestones and mischief lights up and a toast says so */
const AWARDS = { 'one-hit-wonder': 'One Hit Wonder', 'brain-bean': 'One in a Hundred' };
// a game may award from its own module
document.addEventListener('fv:unlock', e => { const k = e.detail && e.detail.key; if (k && AWARDS[k]) unlock(k); });
function unlock(key) {
  const found = store.get('found', {});
  const award = AWARDS[key];
  document.dispatchEvent(new CustomEvent('fv:event', { detail: { kind: award ? 'award' : 'secret', key, fresh: !found[key] } }));
  if (found[key]) return;
  found[key] = true; store.set('found', found);
  const s = award ? FV.trophies.mischief.find(x => x.name === award) : FV.trophies.secret.find(x => x.key === key);
  if (s) setTimeout(() => say(award ? `<b>You earned a sticker: ${esc(s.name)}.</b> ${esc(s.quote)} <a href="#/trophies">See it in the Trophy Room</a>` : `<b>Secret find: ${esc(s.name)}.</b> ${esc(s.quote)}`), 400);
}
let clicks = [];
// the rays behind the V (CSS does the every-nine-seconds pulse; pointing at the logo or tapping it fires them at once)
{
  const brand = $('#brand'), beams = $('.beams', brand);
  if (beams) {
    beams.innerHTML = Array.from({ length: 14 }, (_, k) => `<i style="--a:${-100 + k * 15.5}deg;--c:var(--${k % 2 ? 'green' : 'orange'});--s:${6 + (k % 3) * 4}px;--len:${22 + (k % 4) * 8}px;--dl:${3 + (k % 5) * 0.07}s;--zd:${(k % 4) * 0.04}s"></i>`).join('');
    const zap = () => { if (calm()) return; beams.classList.remove('zap'); void beams.offsetWidth; beams.classList.add('zap'); };
    brand.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') zap(); });
    brand.addEventListener('click', zap);
    beams.addEventListener('animationend', e => { if (e.animationName === 'zap' && e.target === beams.lastElementChild) beams.classList.remove('zap'); });
  }
}
$('#brand').addEventListener('click', () => {
  const now = Date.now(); clicks = clicks.filter(c => now - c < 6000); clicks.push(now);
  if (clicks.length >= 10) { clicks = []; unlock('menu'); setTimeout(() => { location.hash = '#/ideas/late'; }, 30); }
});
new IntersectionObserver(es => { if (es[0].isIntersecting && scrollY > 600) unlock('vip'); }).observe($('#foot'));
let typed = '';
addEventListener('keydown', e => {
  if (/input|textarea/i.test(document.activeElement.tagName) || e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-4);
  if (typed === 'flip') { document.body.classList.add('flipped'); unlock('flip'); setTimeout(() => document.body.classList.remove('flipped'), 2600); }
});

// ------------------------------------------------------------------ the network ident: plays on arrival, then folds into the top bar
async function ident() {
  // every arrival and every reload gets the reveal (Pierce, 2026-10-07: "every page reload must always give the logo reveal")
  const el = document.createElement('div');
  el.id = 'ident';
  el.innerHTML = '<div class="stage"></div><button class="skip">Skip</button>';
  document.body.appendChild(el);
  document.body.classList.add('ident-on');
  const stage = el.querySelector('.stage');
  const W = innerWidth, H = innerHeight;
  const size = W < 700 ? W * 0.86 : Math.min(W * 0.6, 1100);
  let logo;
  try {
    const mod = await import('./fv-logo.js');
    logo = mod.mount(stage, { intro: true, interactive: false, background: 'transparent', size, idle: 0.9 });
  } catch (e) { el.remove(); document.body.classList.remove('ident-on'); return; }
  let folded = false;
  const fold = () => {
    if (folded) return; folded = true;
    const sw = Math.min(size, W * 0.96, H * 0.96 * 968 / 240), sh = sw * 240 / 968;
    const x = (W - sw) / 2, y = (H - sh) / 2;
    const r = $('#brand img').getBoundingClientRect();
    const s = r.width / sw;
    el.classList.add('folding');
    stage.style.transform = `translate(${r.left - x * s}px, ${r.top - y * s}px) scale(${s})`;
    setTimeout(() => { document.body.classList.remove('ident-on'); stage.style.opacity = '0'; }, 860);
    setTimeout(() => { el.classList.add('gone'); }, 1000);
    setTimeout(() => { try { logo.destroy(); } catch (e) { } el.remove(); }, 1500);
  };
  // the logo folds into the bar on its own. SOLACE is not at the door any more: the elevator is how you arrive at a planet (Pierce, 2026-10-08)
  let left = false;
  const leave = () => { if (left) return; left = true; fold(); };
  el.addEventListener('click', leave);
  addEventListener('keydown', leave, { once: true });
  const ready = logo.ready || Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 2500))]).then(() => setTimeout(leave, 2300));
}

document.addEventListener('click', e => { const b = e.target.closest('.howrick'); if (!b) return; const wrap = b.closest('.rick, .rr'); const how = wrap && wrap.querySelector('.rick-how'); if (!how) return; const open = how.hidden; how.hidden = !open; b.setAttribute('aria-expanded', open); });
disc.visit();
renderNav();
route();
ident();
clippo.mount();
sfx.mount();
