/* PTU Radio HQ: the player that stays while you wander.
   One element for the radio and a pair for the ambient lullabies, all outside #view, so a page change never touches them.
   Nothing makes a sound until a tap. The songs and lullabies stream from Wix; nothing is stored here.
   Radio plays an album in order, then the next station. Ambient plays the lullaby of the planet you are on
   at half volume, and crossfades over two seconds when you move to another planet.
   One sound at a time: a video that gets its sound turned on takes the bus, the player fades out and waits. */
import { bus } from './bus.js';
import { mount as mountMedia } from './media.js';

const M = window.FVM || { albums: [], p: {}, v: {}, hq: '', atrium: '' };
const A = Object.fromEntries(M.albums.map(a => [a.slug, a]));
const ORDER = M.albums.map(a => a.slug);
const mp3 = u => `https://static.wixstatic.com/mp3/${u}.mp3`;
const AMB = 0.5, XFADE = 2000;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const volOK = (() => { try { const a = new Audio(); a.volume = 0.5; return a.volume === 0.5; } catch (e) { return false; } })();
const ls = {
  get(k, d) { try { const v = localStorage.getItem('fv.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.' + k, JSON.stringify(v)); } catch (e) { } },
};
const playable = a => a.tracks.filter(t => !t.held);
const fmt = s => { if (!isFinite(s) || s < 0) return ''; s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
export const albums = M.albums;
export const album = slug => A[slug];
export const songCount = a => playable(a).length;

const I = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.6v14H7zm6.4 0H17v14h-3.6z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5.5v13l9-6.5zM16.5 5h2.5v14h-2.5z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 5.5v13L9 12zM5 5h2.5v14H5z"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
};

// ------------------------------------------------------------------ state
const S = {
  mode: null,            // 'radio' | 'ambient' | null
  slug: null, i: 0,      // the station and the song in it
  playing: false,        // the radio is audibly going
  ambOn: false, ambSlug: null, ambCur: 0, ambOK: false,
  planet: null,          // the planet of the page you are on, if it has one
  last: ls.get('lastPlanet', null),
  ducked: null,          // 'radio' | 'ambient' while a video has the sound
  err: '', sheet: false, preFor: '',
  dur: ls.get('dur', {}),
};
const el = { r: null, a: [null, null], pre: null };
let ui = null;
const mk = () => { const a = document.createElement('audio'); a.preload = 'none'; a.hidden = true; a.setAttribute('playsinline', ''); document.body.appendChild(a); return a; };
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

function ensureAudio() {
  if (el.r) return;
  el.r = mk();
  el.a = [mk(), mk()];
  el.a.forEach(a => { a.loop = true; });
  const r = el.r;
  r.addEventListener('play', () => { S.playing = true; paint(); });
  r.addEventListener('pause', () => { if (!r.ended) { S.playing = false; paint(); } });
  r.addEventListener('ended', () => next());
  r.addEventListener('timeupdate', () => { progress(); preload(); });
  r.addEventListener('loadedmetadata', () => {
    const t = cur(); if (!t || !isFinite(r.duration)) return;
    if (S.dur[t.u] !== Math.round(r.duration)) { S.dur[t.u] = Math.round(r.duration); ls.set('dur', S.dur); durations(); }
    progress();
  });
  r.addEventListener('error', () => {
    if (!r.src || r.src === location.href) return;
    S.err = 'That song would not load.'; S.playing = false; paint();
    setTimeout(() => { if (S.mode === 'radio' && S.err) next(); }, 1200);
  });
  r.addEventListener('playing', () => { if (S.err) { S.err = ''; paint(); } });
}
const cur = () => { const a = A[S.slug]; return a ? playable(a)[S.i] : null; };

// ------------------------------------------------------------------ fades (iOS keeps the volume at 1: there the fade becomes a cut)
function fade(a, to, ms, o = {}) {
  cancelAnimationFrame(a._fade);
  return new Promise(res => {
    if (!volOK || ms <= 0) { a.volume = volOK ? to : 1; if (o.pause && to === 0) a.pause(); res(); return; }
    const from = a.volume, t0 = performance.now();
    const step = now => {
      const k = clamp((now - t0) / ms, 0, 1);
      a.volume = clamp(from + (to - from) * k, 0, 1);
      if (k < 1) a._fade = requestAnimationFrame(step);
      else { if (o.pause && to === 0) a.pause(); res(); }
    };
    a._fade = requestAnimationFrame(step);
  });
}

// ------------------------------------------------------------------ the radio
export function startAlbum(slug, i = 0) {
  const a = A[slug]; if (!a) return;
  ensureAudio(); ensureUI();
  S.ducked = null; bus.takeover();
  if (S.ambOn) stopAmbient(true);
  S.mode = 'radio'; S.slug = slug; S.i = clamp(i, 0, playable(a).length - 1); S.err = '';
  load(true);
}
function load(play) {
  const t = cur(); if (!t) return;
  el.r.src = mp3(t.u);
  if (volOK) el.r.volume = 1;
  S.preFor = '';
  if (play) { const p = el.r.play(); if (p && p.catch) p.catch(() => { S.playing = false; paint(); }); }
  paint(); session();
}
export function next() {
  const a = A[S.slug]; if (!a) return;
  const n = playable(a).length;
  if (S.i + 1 < n) S.i++;
  else { S.slug = ORDER[(ORDER.indexOf(S.slug) + 1) % ORDER.length]; S.i = 0; }
  S.err = ''; load(true);
}
export function prev() {
  if (!el.r) return;
  if (el.r.currentTime > 3 || S.i === 0) { el.r.currentTime = 0; return; }
  S.i--; S.err = ''; load(true);
}
export function toggle() {
  if (!S.mode) return;
  if (S.mode === 'ambient') { S.ambOn ? stopAmbient() : startAmbient(); return; }
  S.ducked = null; bus.takeover();
  if (el.r.paused) { if (!el.r.src || el.r.src === location.href) load(true); else { const p = el.r.play(); if (p && p.catch) p.catch(() => { }); } }
  else el.r.pause();
}
export function seek(f) { if (el.r && isFinite(el.r.duration)) el.r.currentTime = el.r.duration * clamp(f, 0, 1); }
function preload() {      // twenty seconds before the end, ask for the next song's head
  const r = el.r, a = A[S.slug];
  if (!a || !isFinite(r.duration) || r.duration - r.currentTime > 20) return;
  const list = playable(a), nx = S.i + 1 < list.length ? list[S.i + 1] : A[ORDER[(ORDER.indexOf(S.slug) + 1) % ORDER.length]].tracks.find(t => !t.held);
  if (!nx || S.preFor === nx.u) return;
  S.preFor = nx.u;
  if (!el.pre) { el.pre = new Audio(); el.pre.preload = 'metadata'; }
  el.pre.src = mp3(nx.u);
}
export function defaultStation() { return S.planet && A[S.planet] ? S.planet : (S.last && A[S.last] ? S.last : 'planet-zee'); }
export function playRadio() { if (S.mode === 'radio' && S.slug) { toggle(); return; } startAlbum(defaultStation(), 0); }

// ------------------------------------------------------------------ ambient: the planet's lullaby, following you
function primeAmbient() {      // inside the tap, so every element is allowed to start later on its own (iOS wants this)
  if (S.ambOK) return; S.ambOK = true;
  el.a.forEach(a => { try { a.src = SILENT; a.muted = true; const p = a.play(); if (p && p.then) p.then(() => { a.pause(); a.muted = false; }).catch(() => { a.muted = false; }); } catch (e) { a.muted = false; } });
}
export function startAmbient(slug) {
  ensureAudio(); ensureUI();
  S.ducked = null; bus.takeover();
  primeAmbient();
  if (S.mode === 'radio' && el.r && !el.r.paused) el.r.pause();
  S.mode = 'ambient'; S.ambOn = true;
  amb(slug || S.planet || S.last || 'planet-zee', true);
  paint(); session();
}
function amb(slug, first) {
  if (!M.p[slug]) return;
  const url = mp3(M.p[slug].lullaby);
  const c = el.a[S.ambCur], o = el.a[1 - S.ambCur];
  S.ambSlug = slug;
  if (first || c.paused) {
    el.a.forEach(a => { cancelAnimationFrame(a._fade); });
    o.pause();
    c.src = url; c.loop = true; if (volOK) c.volume = 0;
    const p = c.play(); if (p && p.catch) p.catch(() => { });
    fade(c, AMB, 1200);
  } else {
    o.src = url; o.loop = true; if (volOK) o.volume = 0;
    const p = o.play(); if (p && p.catch) p.catch(() => { });
    fade(o, AMB, XFADE);
    fade(c, 0, XFADE, { pause: true });
    S.ambCur = 1 - S.ambCur;
  }
  paint();
}
export function stopAmbient(quiet) {
  S.ambOn = false;
  el.a.forEach(a => { if (!a.paused) fade(a, 0, 500, { pause: true }); });
  S.mode = S.slug ? 'radio' : null;
  if (!quiet) { paint(); session(); }
}
export function toggleAmbient() { S.ambOn ? stopAmbient() : startAmbient(); }

// the page you are on has a planet (or none): the lullaby follows
export function setPlanet(slug) {
  if (slug && M.p[slug]) { S.planet = slug; S.last = slug; ls.set('lastPlanet', slug); }
  else S.planet = null;
  if (S.ambOn && S.planet && S.planet !== S.ambSlug) {
    if (S.ducked === 'ambient') S.ambSlug = S.planet;      // it will start on the right one when the video lets go
    else amb(S.planet, false);
  }
  paint();
}

// ------------------------------------------------------------------ a video has the sound
bus.onFirstClaim = () => {
  if (S.mode === 'radio' && el.r && !el.r.paused) { S.ducked = 'radio'; fade(el.r, 0, 400, { pause: true }); }
  else if (S.mode === 'ambient' && S.ambOn) { S.ducked = 'ambient'; el.a.forEach(a => { if (!a.paused) fade(a, 0, 400, { pause: true }); }); }
  paint();
};
bus.onLastRelease = () => {
  const d = S.ducked; S.ducked = null;
  if (d === 'radio' && S.mode === 'radio') { if (volOK) el.r.volume = 0; const p = el.r.play(); if (p && p.catch) p.catch(() => { }); fade(el.r, 1, 700); }
  else if (d === 'ambient' && S.mode === 'ambient' && S.ambOn) amb(S.ambSlug || S.planet || S.last || 'planet-zee', true);
  paint();
};

// ------------------------------------------------------------------ the lock screen and media keys
function session() {
  if (!('mediaSession' in navigator) || !S.mode) return;
  try {
    const a = A[S.slug || S.ambSlug];
    if (S.mode === 'ambient') {
      const b = A[S.ambSlug];
      navigator.mediaSession.metadata = new MediaMetadata({ title: b ? b.planet + ' lullaby' : 'Ambient', artist: 'PTU Radio HQ', album: 'Ambient', artwork: b ? [{ src: new URL(b.coverS, location.href).href, sizes: '400x400', type: 'image/webp' }] : [] });
    } else if (a) {
      const t = cur();
      navigator.mediaSession.metadata = new MediaMetadata({ title: t ? t.t : a.name, artist: a.station, album: a.name, artwork: [{ src: new URL(a.coverS, location.href).href, sizes: '400x400', type: 'image/webp' }] });
    }
    const h = (n, f) => { try { navigator.mediaSession.setActionHandler(n, f); } catch (e) { } };
    h('play', () => toggle()); h('pause', () => toggle());
    h('nexttrack', () => S.mode === 'radio' && next()); h('previoustrack', () => S.mode === 'radio' && prev());
    h('seekto', d => { if (el.r && d.seekTime != null) el.r.currentTime = d.seekTime; });
  } catch (e) { }
}

// ------------------------------------------------------------------ the player: a pill on a laptop, a bar on a phone
function ensureUI() {
  if (ui) return;
  const d = document.createElement('div');
  d.className = 'fvp'; d.id = 'fvp'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Music player');
  d.innerHTML = `<div class="fvp-bar">
      <button class="fvp-main" id="fvpOpen" type="button" aria-expanded="false" aria-controls="fvpSheet" aria-label="Open the player"><img class="fvp-cover" alt="" width="48" height="48"><span class="fvp-meta"><b class="fvp-t"></b><i class="fvp-s"></i></span></button>
      <button class="fvp-btn" id="fvpPlay" type="button" aria-label="Pause">${I.pause}</button>
      <button class="fvp-btn fvp-nx" id="fvpNext" type="button" aria-label="Next song">${I.next}</button>
      <button class="fvp-btn fvp-ex" id="fvpExp" type="button" aria-label="Expand the player">${I.up}</button>
      <i class="fvp-prog"><b></b></i></div>
    <section class="fvp-sheet" id="fvpSheet" role="dialog" aria-label="Now playing" hidden></section>`;
  document.body.appendChild(d);
  document.body.classList.add('has-player');
  ui = {
    root: d, bar: d.querySelector('.fvp-bar'), sheet: d.querySelector('#fvpSheet'), cover: d.querySelector('.fvp-cover'), t: d.querySelector('.fvp-t'), s: d.querySelector('.fvp-s'),
    play: d.querySelector('#fvpPlay'), next: d.querySelector('#fvpNext'), exp: d.querySelector('#fvpExp'), open: d.querySelector('#fvpOpen'), prog: d.querySelector('.fvp-prog b'), killVideo: null,
  };
  ui.play.addEventListener('click', toggle);
  ui.next.addEventListener('click', () => { if (S.mode === 'radio') next(); });
  ui.open.addEventListener('click', () => sheet(!S.sheet));
  ui.exp.addEventListener('click', () => sheet(!S.sheet));
  ui.sheet.addEventListener('click', e => { if (e.target.closest('a[href^="#/"]')) sheet(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheet) sheet(false); });
}

function sheet(open) {
  S.sheet = open;
  ui.sheet.hidden = !open;
  ui.root.classList.toggle('open', open);
  ui.open.setAttribute('aria-expanded', String(open));
  ui.exp.innerHTML = open ? I.down : I.up;
  document.body.classList.toggle('np-open', open);
  if (open) paintSheet(true); else if (ui.killVideo) { ui.killVideo(); ui.killVideo = null; }
}

function trackRows(a, current) {
  return playable(a).map((t, i) => `<li><button type="button" class="trk" data-play="${a.slug}:${i}" data-track="${a.slug}:${i}"><span class="no"><i class="eq" aria-hidden="true"><b></b><b></b><b></b></i><em>${i + 1}</em></span><span class="tt">${esc(t.t)}</span><span class="du" data-dur="${t.u}">${fmt(S.dur[t.u] || t.d || NaN)}</span></button></li>`).join('');
}
export { trackRows };

function paintSheet(rebuild) {
  if (!ui || !S.sheet) return;
  const amb = S.mode === 'ambient';
  const slug = amb ? S.ambSlug : S.slug;
  const a = A[slug]; if (!a) return;
  const key = (amb ? 'A:' : 'R:') + slug;
  if (rebuild || ui.sheet.dataset.key !== key) {
    if (ui.killVideo) { ui.killVideo(); ui.killVideo = null; }
    ui.sheet.dataset.key = key;
    const t = cur();
    ui.sheet.innerHTML = `<header class="np-head"><span class="kicker">Now playing</span><button type="button" class="fvp-btn" id="npClose" aria-label="Close the player">${I.down}</button></header>
      <div class="np-body">
      <div class="vstage np-vid" data-kind="main" data-prio="2" data-vid="${M.p[slug].being}"><img class="still" src="${a.cover}" alt=""><video muted playsinline preload="none" aria-hidden="true"></video></div>
      <div class="np-meta"><b id="npT">${esc(amb ? a.planet + ' lullaby' : t ? t.t : a.name)}</b><span>${esc(amb ? 'Ambient · PTU Radio HQ' : a.station)}</span><a href="#/music/${a.slug}" id="npAlb">${esc(a.name)}</a> <a href="#/ptu/${a.slug}">Go to ${esc(a.planet)}</a></div>
      <div class="np-seek"${amb ? ' hidden' : ''}><span id="npCur">0:00</span><input id="npRange" type="range" min="0" max="1000" value="0" aria-label="Position in the song"><span id="npDur"></span></div>
      <div class="np-ctl"><button type="button" class="fvp-btn" id="npPrev" aria-label="Previous"${amb ? ' disabled' : ''}>${I.prev}</button><button type="button" class="fvp-btn big" id="npPlay" aria-label="Pause">${I.pause}</button><button type="button" class="fvp-btn" id="npNext" aria-label="Next song"${amb ? ' disabled' : ''}>${I.next}</button></div>
      <div class="np-mode" role="group" aria-label="What plays"><button type="button" data-mode="radio" aria-pressed="${!amb}">Radio</button><button type="button" data-mode="ambient" aria-pressed="${amb}">Ambient</button></div>
      ${amb ? `<p class="np-note">The lullaby of the planet you are on. It follows you from page to page.</p>` : `<ol class="tracks">${trackRows(a)}</ol>`}
      <div class="np-strip" aria-label="Stations">${M.albums.map(b => `<button type="button" data-station="${b.slug}" aria-label="${esc(b.name)}"${b.slug === slug ? ' aria-current="true"' : ''}><img src="${b.coverS}" alt="" width="64" height="64" loading="lazy"></button>`).join('')}</div>
      </div>`;
    const q = s => ui.sheet.querySelector(s);
    q('#npClose').addEventListener('click', () => sheet(false));
    q('#npPlay').addEventListener('click', toggle);
    q('#npNext').addEventListener('click', () => next());
    q('#npPrev').addEventListener('click', () => prev());
    q('#npRange').addEventListener('input', e => seek(e.target.value / 1000));
    q('.np-mode').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (!b) return; if (b.dataset.mode === 'ambient') { if (!S.ambOn) startAmbient(S.slug || undefined); } else if (S.ambOn) { stopAmbient(true); startAlbum(S.slug || defaultStation(), S.i || 0); } });
    q('.np-strip').addEventListener('click', e => { const b = e.target.closest('[data-station]'); if (!b) return; if (S.mode === 'ambient') { amb(b.dataset.station, false); } else startAlbum(b.dataset.station, 0); });
    ui.killVideo = mountMedia(ui.sheet);
    ui.sheet.querySelector('.np-body').scrollTop = 0;
  } else {
    const t = cur();
    const T = ui.sheet.querySelector('#npT'); if (T) T.textContent = amb ? a.planet + ' lullaby' : t ? t.t : a.name;
  }
  const pp = ui.sheet.querySelector('#npPlay');
  if (pp) { const on = amb ? S.ambOn && !S.ducked : S.playing; pp.innerHTML = on ? I.pause : I.play; pp.setAttribute('aria-label', on ? 'Pause' : 'Play'); }
  ui.sheet.querySelectorAll('.np-mode [data-mode]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.mode === 'ambient') === amb)));
}

function progress() {
  if (!ui || !el.r) return;
  const r = el.r, f = isFinite(r.duration) && r.duration > 0 ? r.currentTime / r.duration : 0;
  ui.prog.style.transform = `scaleX(${f})`;
  const rg = ui.sheet.querySelector('#npRange');
  if (rg && document.activeElement !== rg) rg.value = Math.round(f * 1000);
  const c = ui.sheet.querySelector('#npCur'), d = ui.sheet.querySelector('#npDur');
  if (c) c.textContent = fmt(r.currentTime);
  if (d) d.textContent = fmt(r.duration);
}
function durations() { document.querySelectorAll('[data-dur]').forEach(n => { const v = S.dur[n.dataset.dur]; if (v) n.textContent = fmt(v); }); }

// everything on the page that shows the state of the player
export function paint() {
  if (!ui) return;
  const amb = S.mode === 'ambient';
  const slug = amb ? S.ambSlug : S.slug, a = A[slug];
  if (!a) return;
  const t = cur();
  ui.root.hidden = !S.mode;
  ui.root.classList.toggle('amb', amb);
  if (ui.cover.getAttribute('src') !== a.coverS) ui.cover.src = a.coverS;
  ui.t.textContent = S.err ? S.err : amb ? a.planet + ' lullaby' : (t ? t.t : a.name);
  ui.s.textContent = amb ? 'Ambient · follows you' : a.planet + ' Radio';
  const on = amb ? S.ambOn && !S.ducked : S.playing;
  ui.play.innerHTML = on ? I.pause : I.play;
  ui.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
  ui.next.hidden = amb;
  ui.root.classList.toggle('playing', !!on);
  document.querySelectorAll('[data-track]').forEach(b => {
    const [sl, i] = b.dataset.track.split(':');
    const isNow = !amb && sl === S.slug && +i === S.i && S.mode === 'radio';
    b.classList.toggle('now', isNow); b.classList.toggle('going', isNow && S.playing);
    b.setAttribute('aria-current', isNow ? 'true' : 'false');
  });
  document.querySelectorAll('[data-playalb]').forEach(b => {
    const here = S.mode === 'radio' && S.slug === b.dataset.playalb && S.playing;
    b.classList.toggle('on', here);
    const lab = b.querySelector('span'); if (lab) lab.innerHTML = `${here ? 'Pause' : 'Play'} <span class="nm">${esc(b.dataset.name)} </span>Radio`;
    const ic = b.querySelector('svg'); if (ic) ic.outerHTML = here ? I.pause : I.play;
  });
  document.querySelectorAll('[data-radio]').forEach(b => { const here = S.mode === 'radio' && S.playing; const l = b.querySelector('span'); if (l) l.textContent = here ? 'Pause the radio' : 'Play the radio'; const ic = b.querySelector('svg'); if (ic) ic.outerHTML = here ? I.pause : I.play; });
  document.querySelectorAll('[data-ambient]').forEach(b => { b.setAttribute('aria-checked', String(S.ambOn)); b.classList.toggle('on', S.ambOn); const l = b.querySelector('.st'); if (l) l.textContent = S.ambOn ? 'On' : 'Off'; });
  document.querySelectorAll('.cplay').forEach(b => { const sl = b.dataset.play.split(':')[0]; const here = S.mode === 'radio' && S.slug === sl && S.playing; b.classList.toggle('on', here); b.innerHTML = here ? I.pause : I.play; });
  if (S.sheet) paintSheet(false);
  progress();
}

// ------------------------------------------------------------------ the buttons on the pages, one listener for all of them
document.addEventListener('click', e => {
  const c = e.target.closest('[data-play],[data-playalb],[data-radio],[data-ambient]');
  if (!c) return;
  e.preventDefault(); e.stopPropagation();
  if (c.dataset.ambient !== undefined) { toggleAmbient(); return; }
  if (c.dataset.radio !== undefined) { playRadio(); return; }
  if (c.dataset.playalb) {
    const sl = c.dataset.playalb;
    if (S.mode === 'radio' && S.slug === sl && (S.playing || (el.r && !el.r.ended && el.r.currentTime > 0))) toggle(); else startAlbum(sl, 0);
    return;
  }
  const [sl, i] = c.dataset.play.split(':');
  if (S.mode === 'radio' && S.slug === sl && S.i === +i) toggle(); else startAlbum(sl, +i || 0);
});

export function mountPage() { paint(); durations(); }
export const state = S;
