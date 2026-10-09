/* Video, the careful way.
   - Everything starts muted and in a still. Sound happens only after a tap on a speaker button.
   - One main video plays at a time (the one most in view) and one tile preview (the one under the pointer, or
     nearest the middle of the phone). Everything pauses when the tab is hidden.
   - A video never hard-loops. It plays forward, the sound fades out 1.2 s before the end, it runs backward in
     silence, then forward again as the sound comes back, like a train going to and fro.
   - The files stream from Wix at the smallest size that fits: 480p on phones and save-data, 720p on desktop,
     1080p from 1900px wide. Nothing here is downloaded or kept.
   - Reduced motion or save-data: the still and a play button, nothing starts by itself. */
import { bus } from './bus.js';

const M = window.FVM || { v: {} };
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const slow = () => { const c = navigator.connection; return !!(c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))); };
export const autoOK = () => !calm() && !slow();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const volOK = (() => { try { const a = new Audio(); a.volume = 0.5; return a.volume === 0.5; } catch (e) { return false; } })();
const LOUD = 0.8;

export function srcFor(id, want) {
  const have = (M.v[id] || [720]).slice().sort((a, b) => a - b);
  const w = want || (slow() || innerWidth < 760 ? 480 : innerWidth >= 1900 ? 1080 : 720);
  const q = have.find(x => x >= w) || have[have.length - 1];
  return `https://video.wixstatic.com/video/${id}/${q}p/mp4/file.mp4`;
}

const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="m16.5 9.5 5 5m0-5-5 5"/></svg>';
const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
export const speakerHTML = '<button class="speaker" type="button" aria-pressed="false" aria-label="Turn the sound on" title="Sound">' + ICON_OFF + '</button>';
export const vplayHTML = '<button class="vplay" type="button" aria-label="Play the video">' + ICON_PLAY + '</button>';

const stages = new Set();
const mains = new Set();
let tileOn = null;

class Stage {
  constructor(el, o = {}) {
    this.el = el; el._st = this;
    this.id = o.id || el.dataset.vid;
    this.kind = o.kind || el.dataset.kind || 'main';
    this.prio = +el.dataset.prio || 0;
    this.v = o.video || el.querySelector('video');
    this.q = o.q || null;
    this.sp = el.querySelector('.speaker');
    this.vp = el.querySelector('.vplay');
    this.ratio = 0; this.userOn = false; this.active = false; this.loaded = false; this.dead = false;
    this.soundOn = false; this.soundT0 = 0; this.looped = false; this.lastT = 0; this.raf = 0; this.rate = this.kind === 'tile' ? 1 : 0.9;
    const v = this.v;
    v.muted = true; v.playsInline = true; v.loop = false; v.preload = 'none';
    v.setAttribute('disablepictureinpicture', '');
    v.addEventListener('playing', () => { v.classList.add('in'); el.classList.add('live'); }, { once: false });
    v.addEventListener('ended', () => { if (!this.active) return; this.lastT = 0; this.looped = true; this.raf = requestAnimationFrame(t => this.back(t)); });
    v.addEventListener('error', () => { el.classList.remove('live'); v.classList.remove('in'); });
    if (this.sp) this.sp.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.sound(!this.soundOn); });
    if (this.vp) this.vp.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.userOn = true; arbitrate(); });
    stages.add(this);
    if (this.kind === 'main') { mains.add(this); io.observe(el); }
    if (!autoOK() && this.kind === 'main') el.classList.add('manual');
  }
  load() {
    if (this.loaded) return;
    this.loaded = true;
    this.v.src = srcFor(this.id, this.q);
    this.v.load();
  }
  play() {
    if (this.dead) return;
    if (this.active && (!this.v.paused || this.raf)) return;      // already going, forward or back
    if (!this.active) { this.active = true; this.lastT = 0; }
    this.load();
    this.el.classList.remove('manual');
    cancelAnimationFrame(this.raf); this.raf = 0;
    this.fwd();
  }
  fwd() { this.v.playbackRate = this.rate; const p = this.v.play(); if (p && p.catch) p.catch(() => { }); this.env(); }
  pause() {
    if (!this.active && this.v.paused) return;
    this.active = false;
    cancelAnimationFrame(this.raf); this.raf = 0;
    this.v.pause();
    if (this.soundOn) this.sound(false);
    if (this.kind === 'main' && !autoOK()) this.el.classList.add('manual');
  }
  back(now) {
    if (!this.active || this.dead) return;
    const v = this.v;
    const dt = this.lastT ? Math.min(0.1, (now - this.lastT) / 1000) : 0; this.lastT = now;
    if (!v.seeking) {
      const t = v.currentTime - dt * this.rate;
      if (t <= 0.05) { v.currentTime = 0; this.lastT = 0; this.raf = 0; this.fwd(); return; }
      v.currentTime = t;
    }
    this.raf = requestAnimationFrame(t => this.back(t));
  }
  // the sound follows the picture: up over 600 ms when it is turned on, down over the last 1.2 s of every forward run, up again after the turn
  env() {
    if (!this.soundOn || this.dead || !this.active) return;
    const v = this.v;
    const left = (v.duration || 1e9) - v.currentTime;
    const ramp = clamp((performance.now() - this.soundT0) / 600, 0, 1);
    const tail = clamp(left / 1.2, 0, 1);
    const head = this.looped ? clamp(v.currentTime / 1.2, 0, 1) : 1;
    const e = this.raf ? 0 : Math.min(ramp, tail, head);      // silent while it runs backward
    if (volOK) v.volume = LOUD * e; else v.muted = e < 0.5;
    if (!v.paused) requestAnimationFrame(() => this.env());
    else if (this.active) setTimeout(() => this.env(), 120);
  }
  sound(on) {
    if (on === this.soundOn) return;
    if (on) {
      stages.forEach(s => { if (s !== this && s.soundOn) s.sound(false); });
      this.soundOn = true; this.soundT0 = performance.now();
      this.v.muted = false; if (volOK) this.v.volume = 0;
      bus.claim(this);
      if (!this.active) { this.userOn = true; arbitrate(); }
      this.env();
    } else {
      this.soundOn = false;
      this.v.muted = true; if (volOK) this.v.volume = 0;
      bus.release(this);
    }
    if (this.sp) {
      this.sp.setAttribute('aria-pressed', String(this.soundOn));
      this.sp.setAttribute('aria-label', this.soundOn ? 'Turn the sound off' : 'Turn the sound on');
      this.sp.innerHTML = this.soundOn ? ICON_ON : ICON_OFF;
      this.el.classList.toggle('sound', this.soundOn);
    }
  }
  eligible() { return (autoOK() || this.userOn) && this.ratio >= 0.3; }
  destroy() {
    if (this.dead) return;
    this.dead = true; this.active = false; cancelAnimationFrame(this.raf);
    if (this.soundOn) { this.soundOn = false; bus.release(this); }
    stages.delete(this); mains.delete(this); io.unobserve(this.el);
    try { this.v.pause(); this.v.removeAttribute('src'); this.v.load(); } catch (e) { }
    if (this.kind === 'tile') this.v.remove();
    this.el._st = null;
  }
}

// ---- which main video plays: the one most in view; the player sheet's video wins while it is open
const io = new IntersectionObserver(es => { es.forEach(e => { const s = e.target._st; if (s) s.ratio = e.intersectionRatio; }); arbitrate(); }, { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] });
let arb = 0;
function arbitrate() {
  cancelAnimationFrame(arb);
  arb = requestAnimationFrame(() => {
    let best = null;
    mains.forEach(s => { if (!s.eligible()) return; if (!best || s.prio > best.prio || (s.prio === best.prio && s.ratio > best.ratio + 0.05)) best = s; });
    mains.forEach(s => { if (s === best && !document.hidden) s.play(); else s.pause(); });
  });
}
document.addEventListener('visibilitychange', () => { if (document.hidden) { stages.forEach(s => s.pause()); } else arbitrate(); });

// ---- tile previews: under the pointer on a laptop, nearest the middle of the screen on a phone
const tiles = new Map();
function tileStage(card) {
  let s = tiles.get(card);
  if (s && !s.dead) return s;
  const frame = card.querySelector('.frame');
  if (!frame) return null;
  const v = document.createElement('video');
  v.className = 'tv'; v.setAttribute('aria-hidden', 'true');
  frame.appendChild(v);
  s = new Stage(card, { id: card.dataset.tile, kind: 'tile', video: v, q: 480 });
  tiles.set(card, s);
  return s;
}
function tileSwitch(card) {
  if (tileOn && tileOn.el !== card) { tileOn.pause(); tileOn.v.classList.remove('in'); tileOn.el.classList.remove('live'); }
  tileOn = null;
  if (!card || !autoOK() || document.hidden) return;
  const s = tileStage(card);
  if (!s) return;
  tileOn = s; s.play();
}
let hoverT = 0;
document.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  const c = e.target.closest && e.target.closest('.card.tile[data-tile]');
  if (!c || c === (tileOn && tileOn.el)) return;
  clearTimeout(hoverT); hoverT = setTimeout(() => tileSwitch(c), 140);
});
document.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse') return;
  const c = e.target.closest && e.target.closest('.card.tile[data-tile]');
  if (!c || (e.relatedTarget && c.contains(e.relatedTarget))) return;
  clearTimeout(hoverT); if (tileOn && tileOn.el === c) tileSwitch(null);
});
let centerRaf = 0;
function centerTile() {
  cancelAnimationFrame(centerRaf);
  centerRaf = requestAnimationFrame(() => {
    if (!matchMedia('(hover: none)').matches) return;
    const cards = [...document.querySelectorAll('#view .card.tile[data-tile]')];
    const cx = innerWidth / 2, cy = innerHeight / 2;
    let best = null, bd = 1e9;
    for (const c of cards) {
      if (c.classList.contains('clone')) continue;
      const r = c.getBoundingClientRect();
      if (r.width < 10 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
      const vis = (Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / (r.width * r.height);
      if (vis < 0.7) continue;
      const d = Math.hypot((r.left + r.width / 2 - cx) / 2, r.top + r.height / 2 - cy);
      if (d < bd) { bd = d; best = c; }
    }
    if (best !== (tileOn && tileOn.el)) tileSwitch(best);
  });
}
addEventListener('scroll', centerTile, { passive: true });
document.addEventListener('scroll', centerTile, { passive: true, capture: true });

// ---- mount everything in a view; the returned function lets go of it
export function mount(root) {
  const mine = [];
  root.querySelectorAll('.vstage').forEach(el => { if (!el._st) mine.push(new Stage(el)); });
  centerTile();
  return () => {
    mine.forEach(s => s.destroy());
    tiles.forEach((s, c) => { if (!c.isConnected || root.contains(c)) { s.destroy(); tiles.delete(c); } });
    tileOn = null;
    arbitrate();
  };
}
export function muteAll() { stages.forEach(s => s.soundOn && s.sound(false)); }
bus.onTakeover = muteAll;
export function anySound() { for (const s of stages) if (s.soundOn) return true; return false; }
