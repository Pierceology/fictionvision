/* The sounds. Off until someone turns them on (the speaker in the top bar), like every sound on this site.
   Two kinds: small ones made here with WebAudio (a tick for a button, a softer one for a card, a foil snap for a card turning,
   a three-note chime for an award, the elevator's hiss and ding), and the planet clips, Pierce's own, one per planet per event
   (the 325 the maze already carries): a planet's card under the pointer whispers its planet, a game won on a planet plays it.
   Rules: never two planet clips at once, never more than one every 700 ms on hover, and the radio or a video with its sound on
   wins: while the bus is claimed the clips stay quiet and only the ticks remain. */
import { MAZE_ASSETS } from './maze/assets.js';
import { bus } from './bus.js';

const KEY = 'fv.sfx';
let ac = null, on = false, last = 0, clip = null, idx = {};
const store = { get() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }, set(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { } } };
const ctx = () => { try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } };

/* ---- the small sounds. One is Pierce's own sample (the SOLACE elevator doors); the rest are made
   here, layered the way a sound that feels like something is layered: a transient, a body, a bell partial, and a little room on
   all of it (Pierce, 2026-10-08: "the sounds are not dopamine"). */
const SAMPLES = {
  doors: 'https://static.wixstatic.com/mp3/6c593b_b6df3487ef7e4998949574f341e95420.mp3',      // elevator doors, from the SOLACE library
};
// (the bog patch's "click-sound" is a frog; it went on every button for an hour on 2026-10-08 and came straight off)
const bufs = {}; let outNode = null, wetNode = null;
/* one output for every small sound: dry, plus a short room */
function out() {
  const a = ctx(); if (!a) return null;
  if (outNode) return outNode;
  outNode = a.createGain(); outNode.gain.value = 1;
  const dry = a.createGain(); dry.gain.value = 0.85;
  const conv = a.createConvolver();
  const n = Math.floor(a.sampleRate * 0.32), ir = a.createBuffer(2, n, a.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
  conv.buffer = ir;
  wetNode = a.createGain(); wetNode.gain.value = 0.16;
  outNode.connect(dry); dry.connect(a.destination);
  outNode.connect(conv); conv.connect(wetNode); wetNode.connect(a.destination);
  return outNode;
}
function load(key) {
  const a = ctx(); if (!a || bufs[key] || bufs[key] === null) return;
  bufs[key] = null;
  fetch(SAMPLES[key]).then(r => r.arrayBuffer()).then(ab => a.decodeAudioData(ab)).then(b => { bufs[key] = b; }).catch(() => { bufs[key] = undefined; });
}
function sample(key, vol = 0.5, rate = 1) {
  const a = ctx(); if (!a) return false;
  const b = bufs[key]; if (!b) { load(key); return false; }
  const src = a.createBufferSource(); src.buffer = b; src.playbackRate.value = rate;
  const g = a.createGain(); g.gain.value = vol; src.connect(g); g.connect(out()); src.start(); return true;
}
function tone(f, t0, dur, vol, type = 'sine', slide) {
  const a = ctx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  o.connect(g); g.connect(out());
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(t0, dur, vol, from, to, q = 0.8) {
  const a = ctx(); if (!a) return;
  const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(from, t0); f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(out()); src.start(t0); src.stop(t0 + dur);
}
/* a bell: the fundamental and two inharmonic partials, each dying at its own rate, a hair of detune so it shimmers */
function bell(f, t0, dur, vol) {
  tone(f, t0, dur, vol); tone(f * 1.003, t0, dur * 0.9, vol * 0.5);
  tone(f * 2.76, t0, dur * 0.45, vol * 0.28); tone(f * 5.4, t0, dur * 0.2, vol * 0.12);
}
/* a transient: a flick of noise and a tap of tone, the thing that makes a sound feel pressed */
function click(t0, vol = 0.2) { noise(t0, 0.03, vol, 2500, 6000, 1.2); tone(3200, t0, 0.014, vol * 0.5, 'triangle'); }
/* a thump: the body under a pop */
function thump(t0, vol = 0.18) { tone(110, t0, 0.09, vol, 'sine', 48); }
const SMALL = {
  tick: () => { const a = ctx(); if (!a) return; const t = a.currentTime; click(t, 0.2); tone(1900, t, 0.05, 0.07, 'triangle', 1300); tone(140, t, 0.05, 0.06, 'sine', 90); },
  soft: () => { const a = ctx(); if (!a) return; const t = a.currentTime; click(t, 0.09); tone(1500, t, 0.04, 0.035, 'triangle', 1100); },
  pop: () => { const a = ctx(); if (!a) return; const t = a.currentTime; click(t, 0.16); thump(t, 0.16); tone(380, t, 0.12, 0.14, 'sine', 760); bell(1400, t + 0.03, 0.28, 0.07); },
  chime: () => { const a = ctx(); if (!a) return; const t = a.currentTime; [659, 784, 988, 1319].forEach((f, i) => bell(f, t + i * 0.085, 0.95, 0.1)); noise(t + 0.1, 0.5, 0.035, 5000, 9000, 0.6); },
  doors: () => { const a = ctx(); if (!a) return; if (!sample('doors', 0.5)) { noise(a.currentTime, 0.9, 0.16, 300, 1400); tone(120, a.currentTime + 0.82, 0.12, 0.08, 'sine', 70); } },
  ding: () => { const a = ctx(); if (!a) return; const t = a.currentTime; bell(1046, t, 1.4, 0.13); bell(880, t + 0.2, 1.3, 0.1); },
  foil: () => { const a = ctx(); if (!a) return; const t = a.currentTime; noise(t, 0.2, 0.16, 2500, 9000); click(t + 0.02, 0.1); bell(2600, t + 0.05, 0.22, 0.045); },
  clippo: () => { const a = ctx(); if (!a) return; const t = a.currentTime; click(t, 0.1); tone(260, t, 0.13, 0.11, 'triangle', 620); tone(520, t + 0.02, 0.12, 0.05, 'triangle', 1240); bell(1760, t + 0.1, 0.25, 0.04); },
  win: () => { const a = ctx(); if (!a) return; const t = a.currentTime; thump(t, 0.2); [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => bell(f, t + i * 0.065, 0.8, 0.09)); bell(2093, t + 0.42, 1.2, 0.08); noise(t + 0.3, 0.7, 0.04, 5000, 10000, 0.6); },
  lose: () => { const a = ctx(); if (!a) return; const t = a.currentTime; thump(t, 0.12); tone(330, t, 0.26, 0.09, 'sine', 200); },
};
/* the samples come down the moment the sounds are on, so the first click is the real one */
export function warm() { try { load('doors'); } catch (e) { } }

/* ---- the planet clips */
export function planet(slug, o = {}) {
  if (!on) return false;
  if (bus.claims.size) return false;                            // the radio or a video is speaking; the planets wait
  const now = performance.now(); if (!o.force && now - last < 700) return false; last = now;
  const list = (MAZE_ASSETS[slug] || {}).sounds || []; if (!list.length) return false;
  const k = idx[slug] = ((idx[slug] || 0) + 1) % list.length;
  try { if (clip) { clip.pause(); } clip = new Audio(list[k]); clip.volume = o.volume != null ? o.volume : 0.55; clip.play().catch(() => { }); } catch (e) { return false; }
  return true;
}
export function play(kind) { if (!on) return false; const f = SMALL[kind]; if (!f) return false; try { f(); } catch (e) { } return true; }
export const isOn = () => on;
export function set(v) { on = !!v; store.set(on); paint(); if (on) { warm(); play('chime'); } else if (clip) { try { clip.pause(); } catch (e) { } } }

/* ---- the switch in the top bar, and the listeners */
let btn;
const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';
const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
function paint() { if (!btn) return; btn.innerHTML = on ? ICON_ON : ICON_OFF; btn.setAttribute('aria-pressed', String(on)); btn.title = on ? 'Sounds are on' : 'Turn the sounds on'; btn.setAttribute('aria-label', btn.title); }
export function mount(o = {}) {
  on = store.get();
  if (on) document.addEventListener('pointerdown', warm, { once: true, capture: true });
  // the sounds come on at the first tap, the gesture the browser wants, unless the switch was set off on purpose (Pierce, 2026-10-08: "i hear no audio")
  let decided = true; try { decided = localStorage.getItem(KEY) != null; } catch (e) { }
  if (!decided) document.addEventListener('pointerdown', () => { if (!on) set(true); }, { once: true, capture: true });
  const tools = document.querySelector('.bar .tools'); const before = document.getElementById('searchBtn');
  if (tools && !document.getElementById('sfxBtn')) {
    btn = document.createElement('button'); btn.className = 'icon-btn sfx-btn'; btn.id = 'sfxBtn'; btn.type = 'button';
    btn.addEventListener('click', () => set(!on));
    tools.insertBefore(btn, before || tools.firstChild);
  }
  paint();
  // buttons and links tick; cards whisper; a card turning snaps its foil
  document.addEventListener('click', e => {
    if (!on) return;
    const t = e.target;
    if (t.closest('#sfxBtn')) return;
    if (t.closest('.sticker')) { play('foil'); return; }
    if (t.closest('.cta')) { play('pop'); return; }
    if (t.closest('button, .ghost, .otb-card, .np-opt, .de-orbit button')) { play('tick'); return; }
    const card = t.closest('.card'); if (card) { const p = planetFor(card); if (!(p && planet(p, { force: true }))) play('soft'); }
  }, true);
  let hoverT = 0;
  document.addEventListener('pointerover', e => {
    if (!on || e.pointerType === 'touch') return;
    const card = e.target.closest('.card, .otb-card'); if (!card || card === hoverT) return; hoverT = card;
    const p = planetFor(card); if (p) planet(p, { volume: 0.35 }); else play('soft');
  }, true);
  document.addEventListener('fv:event', e => { const d = e.detail || {}; if (!on) return; if (d.kind === 'watch') play('pop'); if (d.kind === 'award' && d.fresh) play('chime'); if (d.kind === 'secret') play('chime'); });
  document.addEventListener('fv:sfx', e => { const d = e.detail || {}; if (d.planet) planet(d.planet, { force: true, volume: d.volume }); else if (d.kind) play(d.kind); });
}
/* which planet a card is about, if any: a planet tile, an album, a being's card */
function planetFor(el) {
  const h = el.getAttribute('href') || '';
  let m = h.match(/#\/(?:ptu|music|games\/[a-z-]+)\/([a-z0-9-]+)/); if (m && MAZE_ASSETS[m[1]]) return m[1];
  const b = el.dataset.being; if (b && MAZE_ASSETS[b]) return b;
  return null;
}
