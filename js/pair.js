/* AGI and ASI: two living orbs in the corner, two voices in one bubble, and Clippo's job between them. The words are in pair-brain.js;
   this file is the machinery: the orbs (a raymarched glass sphere with liquid inside, after TaminoMartinius' Liquid Gooey Orb, MIT),
   the bubble, the disagreement, the ask box, the speech, and the rules that keep two guides from being the thing everybody hates:
   one exchange at a time, never two inside thirty seconds, each keyed exchange once per device, three dismissals and they go quiet
   for six hours. Nothing they say is needed to use the site. No API: the door is here and it is shut. */
import { WHO, LADDER, ASI, NEXT, TALK, ANSWERS, doneSet, markDone, page } from './pair-brain.js?v=20261012d';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.agis.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.agis.' + k, JSON.stringify(v)); } catch (e) { } },
};
const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const sessGet = k => { try { return JSON.parse(sessionStorage.getItem('fv.agis.' + k) || 'null'); } catch (e) { return null; } };
const sessSet = (k, v) => { try { sessionStorage.setItem('fv.agis.' + k, JSON.stringify(v)); } catch (e) { } };
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---- the AGI's notch: one per visit on a new day, five at most. Kept on this phone and nowhere else. */
const today = () => new Date().toISOString().slice(0, 10);
const notch = () => Math.min(4, Math.max(0, store.get('days', []).length - 1));
function countVisit() { const d = store.get('days', []); const t = today(); if (!d.includes(t)) { d.push(t); store.set('days', d.slice(-6)); } }
const agiLine = beat => { const L = LADDER[beat]; return L[Math.min(notch(), L.length - 1)]; };
const asiLine = beat => pick(ASI[beat]);

/* ---- the orbs */
const ORB = {
  asi: { radius: 0.30, deform: 0.36, frequency: 2.0, morphSpeed: 1.30, rotSpeed: 0.12, specular: 1.0, shininess: 140, glowStrength: 0.70, colorBlue: '#4099FF', colorMagenta: '#E633BF', glowA: '#33B5FF', glowB: '#E24DD0', liquidSpeed: 0.50, liquidScale: 2.20, liquidBright: 1.00, filament: 1.40, core: 0.30 },
  ice: { radius: 0.32, deform: 0.14, frequency: 1.8, morphSpeed: 0.45, rotSpeed: 0.05, specular: 1.5, shininess: 210, glowStrength: 0.55, colorBlue: '#9CE3FF', colorMagenta: '#E6F7FF', glowA: '#6FD2FF', glowB: '#BFEFFF', liquidSpeed: 0.22, liquidScale: 2.00, liquidBright: 0.90, filament: 1.00, core: 0.35 },
  ember: { radius: 0.32, deform: 0.30, frequency: 2.1, morphSpeed: 1.20, rotSpeed: 0.10, specular: 1.2, shininess: 120, glowStrength: 0.85, colorBlue: '#FFC24D', colorMagenta: '#FF3B2F', glowA: '#FF7A18', glowB: '#FF2D55', liquidSpeed: 0.75, liquidScale: 2.40, liquidBright: 1.10, filament: 1.90, core: 0.40 },
};
const BG = '#0f0f16';
const hexToRgb = hex => { const n = parseInt(hex.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const mixHex = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return '#' + [0, 1, 2].map(i => Math.round((A[i] + (B[i] - A[i]) * t) * 255).toString(16).padStart(2, '0')).join(''); };
function agiBase() {   // cold on the first visit, warming toward ember with the notch
  const t = notch() / 4, a = ORB.ice, b = ORB.ember, o = {};
  for (const k in a) o[k] = typeof a[k] === 'number' ? a[k] + (b[k] - a[k]) * t : mixHex(a[k], b[k], t);
  return o;
}
const mood = { asi: { speak: 0, bump: 0, dim: 0 }, agi: { speak: 0, bump: 0, dim: 0 } };
const VERT = `#version 300 es
layout(location=0) in vec2 a_pos; out vec2 v_uv; void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;
const FRAG = `#version 300 es
precision highp float; in vec2 v_uv; out vec4 fragColor;
uniform float u_time; uniform vec2 u_res; uniform float u_radius, u_deform, u_freq, u_morphSpeed, u_rotSpeed, u_specular, u_shininess, u_glowStrength, u_liquidSpeed, u_liquidScale, u_liquidBright, u_filament, u_core;
uniform vec3 u_colBlue, u_colMag, u_glowA, u_glowB, u_bg;
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float blobField(vec3 p){ float t = u_time * u_morphSpeed; float f = u_freq; float d = 0.0;
  d += sin(p.x * 2.6 * f + t * 1.00); d += sin(p.y * 2.9 * f - t * 0.80 + 1.3); d += sin(p.z * 3.2 * f + t * 1.20 + 2.7);
  d += sin((p.x + p.z) * 2.2 * f - t * 0.90 + 4.1); d += sin((p.y - p.x) * 2.4 * f + t * 0.70 + 0.6); return d * 0.2; }
float mapBlob(vec3 p){ float t = u_time * u_rotSpeed; p.xy *= rot(t * 0.7); p.yz *= rot(t * 0.5); float r = u_radius + u_deform * blobField(p); return length(p) - r; }
vec3 calcNormal(vec3 p){ vec2 e = vec2(0.0015, 0.0); return normalize(vec3(mapBlob(p + e.xyy) - mapBlob(p - e.xyy), mapBlob(p + e.yxy) - mapBlob(p - e.yxy), mapBlob(p + e.yyx) - mapBlob(p - e.yyx))); }
float hash13(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ v += a * vnoise3(p); p *= 2.03; a *= 0.5; } return v; }
float liquid(vec3 p){ float t = u_time * u_liquidSpeed; p *= u_liquidScale; p.xy *= rot(t * 0.15); p.yz *= rot(t * 0.10);
  vec3 w = vec3(fbm3(p + t * 0.2), fbm3(p + vec3(4.3, 1.2, -t * 0.15)), fbm3(p.zxy + vec3(7.7, 2.3, t * 0.10))); return fbm3(p + 1.8 * w); }
void main(){
  vec2 p = v_uv * 2.0 - 1.0; p.x *= u_res.x / u_res.y;
  vec3 ro = vec3(0.0, 0.0, 3.0); vec3 rd = normalize(vec3(p, -1.8));
  float t = 0.0; bool hit = false; vec3 pos = ro; float minD = 1e3;
  for (int i = 0; i < 110; i++) { pos = ro + rd * t; float d = mapBlob(pos); minD = min(minD, d); if (d < 0.0015) { hit = true; break; } t += d * 0.45; if (t > 6.0) break; }
  vec3 E = vec3(0.0);
  if (hit) {
    vec3 n = calcNormal(pos); vec3 v = -rd; float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 rp = pos + rd * 0.04; float trans = 1.0; vec3 inner = vec3(0.0);
    for (int k = 0; k < 8; k++) { float raw = liquid(rp); float dens = smoothstep(0.30, 0.70, raw); float fil = pow(1.0 - abs(2.0 * raw - 1.0), 5.0);
      vec3 c = mix(u_colMag, u_colBlue, 0.5 + 0.5 * sin(raw * 6.0 + u_time * 0.3 + rp.y * 2.5));
      vec3 emit = c * dens * 0.55 + c * fil * u_filament + vec3(1.0) * pow(fil, 3.0) * u_filament * 0.4;
      emit += u_colBlue * smoothstep(0.5, 0.0, length(rp)) * u_core; inner += trans * emit * 0.2; trans *= 0.82; rp += rd * 0.13; if (length(rp) > 1.0) break; }
    E += inner * (1.0 - fres * 0.6) * u_liquidBright;
    vec3 rim = mix(u_colMag, u_colBlue, 0.5 + 0.5 * (n.x * 0.7 + n.y * 0.45)); E += rim * fres * 1.3;
    vec3 l1 = normalize(vec3(0.6, 0.85, 0.6)); vec3 l2 = normalize(vec3(-0.7, 0.25, 0.55)); vec3 h1 = normalize(l1 + v); vec3 h2 = normalize(l2 + v);
    E += vec3(1.0) * pow(max(dot(n, h1), 0.0), u_shininess) * 1.3 * u_specular; E += vec3(0.8, 0.9, 1.0) * pow(max(dot(n, h2), 0.0), u_shininess * 0.45) * 0.6 * u_specular;
  } else { float g = exp(-minD * 5.5); float ang = atan(rd.y, rd.x); vec3 gc = mix(u_glowA, u_glowB, 0.5 + 0.5 * sin(ang * 3.0 + u_time * 0.5)); E += (gc * g * 1.4 + vec3(0.6, 0.8, 1.0) * pow(g, 3.0) * 0.7) * u_glowStrength; }
  fragColor = vec4(clamp(u_bg + E, 0.0, 1.0), 1.0);
}`;
let gl, U, cv, glOk = false, raf = 0, lastFrame = 0;
function glInit() {
  try {
    gl = cv.getContext('webgl2', { antialias: false, alpha: false }); if (!gl) return false;
    const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const prog = gl.createProgram(); gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)); gl.useProgram(prog);
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    U = {}; ['u_time', 'u_res', 'u_radius', 'u_deform', 'u_freq', 'u_morphSpeed', 'u_rotSpeed', 'u_specular', 'u_shininess', 'u_glowStrength', 'u_liquidSpeed', 'u_liquidScale', 'u_liquidBright', 'u_filament', 'u_core', 'u_colBlue', 'u_colMag', 'u_glowA', 'u_glowB', 'u_bg'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
    return (glOk = true);
  } catch (e) { return false; }
}
function drawOrb(x, y, w, h, v, time) {
  gl.viewport(x, y, w, h); gl.scissor(x, y, w, h);
  gl.uniform1f(U.u_time, time); gl.uniform2f(U.u_res, w, h);
  gl.uniform1f(U.u_radius, v.radius); gl.uniform1f(U.u_deform, v.deform); gl.uniform1f(U.u_freq, v.frequency); gl.uniform1f(U.u_morphSpeed, v.morphSpeed); gl.uniform1f(U.u_rotSpeed, v.rotSpeed);
  gl.uniform1f(U.u_specular, v.specular); gl.uniform1f(U.u_shininess, v.shininess); gl.uniform1f(U.u_glowStrength, v.glowStrength);
  gl.uniform1f(U.u_liquidSpeed, v.liquidSpeed); gl.uniform1f(U.u_liquidScale, v.liquidScale); gl.uniform1f(U.u_liquidBright, v.liquidBright); gl.uniform1f(U.u_filament, v.filament); gl.uniform1f(U.u_core, v.core);
  gl.uniform3fv(U.u_colBlue, hexToRgb(v.colorBlue)); gl.uniform3fv(U.u_colMag, hexToRgb(v.colorMagenta)); gl.uniform3fv(U.u_glowA, hexToRgb(v.glowA)); gl.uniform3fv(U.u_glowB, hexToRgb(v.glowB)); gl.uniform3fv(U.u_bg, hexToRgb(BG));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
function live(base, m, t, phase) {   // the orb as it is right now: breathing when idle, swelling and quickening with its words, dimmer while the other talks
  const s = Math.min(1, m.speak + m.bump), o = Object.assign({}, base);
  o.radius = base.radius * (1 + 0.03 * Math.sin(t * 1.1 + phase)) * (1 + 0.09 * s);
  o.deform = base.deform * (1 + 0.7 * s) + 0.05 * s * Math.sin(t * 11.0);
  o.morphSpeed = base.morphSpeed * (1 + 0.8 * s); o.liquidSpeed = base.liquidSpeed * (1 + 1.6 * s);
  o.liquidBright = base.liquidBright * (1 + 0.5 * s) * (1 - 0.35 * m.dim); o.glowStrength = base.glowStrength * (1 + 0.7 * s) * (1 - 0.3 * m.dim);
  return o;
}
function frame(now) {
  raf = 0;
  if (!el || document.hidden) return;
  const busy = el.classList.contains('on') || mood.asi.speak > 0.01 || mood.agi.speak > 0.01 || mood.asi.bump > 0.01 || mood.agi.bump > 0.01;
  if (!busy && now - lastFrame < 80) { raf = requestAnimationFrame(frame); return; }   // idle: twelve frames a second is plenty for breathing
  lastFrame = now; const t = now * 0.001;
  ['asi', 'agi'].forEach(w => { const m = mood[w]; m.bump *= 0.85; m.speak += ((m.target || 0) - m.speak) * 0.12; });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5), W = Math.floor(cv.clientWidth * dpr), H = Math.floor(cv.clientHeight * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const bg = hexToRgb(BG); gl.clearColor(bg[0], bg[1], bg[2], 1); gl.disable(gl.SCISSOR_TEST); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.SCISSOR_TEST);
  const half = Math.floor(W / 2);
  drawOrb(0, 0, half, H, live(ORB.asi, mood.asi, t, 0), t);
  drawOrb(half, 0, W - half, H, live(agiBase(), mood.agi, t, 2.1), t + 37);
  raf = requestAnimationFrame(frame);
}
const wake = () => { if (glOk && !raf && !document.hidden) raf = requestAnimationFrame(frame); };

/* ---- the voices: ASI on the phone's English (non-American) female voice, AGI on an American female voice dropped low and slowed, rising with her notch */
const FEM = /^(samantha|karen|moira|tessa|serena|kate|fiona|allison|ava|susan|zoe|nicky|joelle|stephanie|martha|catherine|veena|libby|sonia|hazel|emma|amy|jenny|aria|natasha|olivia)\b/i;
const NOVEL = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|ralph|fred|junior|kathy|princess|agnes|bruce|vicki|victoria|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|oregon)\b/i;
const vname = v => String(v.name).replace(/\s*\(.*?\)\s*/g, ' ').replace(/^(Microsoft|Google)\s+/, '').trim();
function voices() {
  try { const L = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang) && !NOVEL.test(vname(v))); const us = v => v.lang.toLowerCase().replace('_', '-') === 'en-us';
    const asi = L.find(v => FEM.test(vname(v)) && !us(v) && /gb|uk|au|ie|za|in|nz/i.test(v.lang)) || L.find(v => FEM.test(vname(v)) && !us(v)) || L.find(v => /gb/i.test(v.lang)) || L.find(v => !us(v)) || L[0] || null;
    const agi = L.find(v => FEM.test(vname(v)) && us(v) && v !== asi) || L.find(v => us(v) && v !== asi) || L.find(v => v !== asi) || null;
    return { asi, agi }; } catch (e) { return { asi: null, agi: null }; }
}
const soundOn = () => ls('fv.sfx') === '1';
let speaking = null, queue = [];
function speakNext() {
  if (speaking || !queue.length) return;
  const [who, text] = queue.shift();
  if (!('speechSynthesis' in window) || !soundOn()) { speakNext(); return; }
  try {
    const u = new SpeechSynthesisUtterance(text), V = voices(); const n = notch();
    if (who === 'asi') { if (V.asi) u.voice = V.asi; u.rate = 1.05; u.pitch = 1.15; } else { if (V.agi) u.voice = V.agi; u.rate = 0.88 + 0.03 * n; u.pitch = 0.55 + 0.075 * n; }
    u.onstart = () => { mood[who].target = 1; mood[who === 'asi' ? 'agi' : 'asi'].dim = 1; wake(); };
    u.onboundary = () => { mood[who].bump = 0.9; wake(); };
    u.onend = u.onerror = () => { mood[who].target = 0; mood.asi.dim = 0; mood.agi.dim = 0; speaking = null; setTimeout(speakNext, 220); };
    speaking = u; speechSynthesis.speak(u);
  } catch (e) { speaking = null; speakNext(); }
}
function speakTurns(turns) { try { speechSynthesis.cancel(); } catch (e) { } queue = turns.slice(); speaking = null; mood.asi.target = 0; mood.agi.target = 0; speakNext(); }
function hush() { queue = []; speaking = null; try { speechSynthesis.cancel(); } catch (e) { } mood.asi.target = 0; mood.agi.target = 0; mood.asi.dim = 0; mood.agi.dim = 0; }

/* ---- the bubble */
let el, timer, lastAt = -1e9, dismissals = 0, quiet = false, idleT, seen, born = false, retryT, routeT;
const QUIET_AFTER = 3, GAP = 30000, IDLE = 45000;
const progress = () => { const n = NEXT.filter(x => x.test()).length; return { n, of: NEXT.length }; };
const mediaOn = () => page() === 'show' || !!document.getElementById('bumper') || !!document.getElementById('ident') || !!document.querySelector('.vbox') || [...document.querySelectorAll('video, audio')].some(m => !m.paused && !m.muted && !m.ended);
function build() {
  if (el) return;
  el = document.createElement('div'); el.id = 'agis'; el.className = 'off';
  el.innerHTML = `<div class="bub" id="agisBub" role="status" aria-live="polite"><div id="agisTurns"></div><ul class="todo" id="agisTodo" hidden></ul><div class="row"><button class="ls" type="button" id="agisList" aria-expanded="false">The list</button><a class="way asi" id="agisWayA" hidden></a><a class="way agi" id="agisWayB" hidden></a><a class="way go" id="agisGo" hidden></a><button class="ok" type="button" id="agisOk">Got it</button><button class="no" type="button" id="agisNo">Stop</button></div><form class="ask" id="agisAsk"><input id="agisQ" type="text" placeholder="Ask them anything" autocomplete="off" aria-label="Ask AGI and ASI"><button type="submit">Ask</button></form></div>
    <div class="orbs" id="agisOrbs" role="button" tabindex="0" aria-label="AGI and ASI, the guides"><canvas id="agisCv"></canvas><span class="nm asi" id="nmA">ASI</span><span class="nm agi" id="nmB">AGI</span></div>`;
  document.body.appendChild(el);
  cv = el.querySelector('#agisCv');
  if (!calm() && glInit()) wake(); else { cv.remove(); const o = el.querySelector('#agisOrbs'); o.insertAdjacentHTML('afterbegin', '<div class="css asi"></div><div class="css agi"></div>'); }
  el.querySelector('#agisOk').addEventListener('click', () => { dismissals = 0; hide(); });
  el.querySelector('#agisNo').addEventListener('click', () => { dismissals = QUIET_AFTER; quiet = true; hide(); store.set('quiet', Date.now()); });
  el.querySelector('#agisOrbs').addEventListener('click', () => { if (el.classList.contains('on')) { hide(); return; } quiet = false; dismissals = 0; store.set('quiet', 0); if (!nudge(true)) greet(true); });
  el.querySelector('#agisGo').addEventListener('click', () => { dismissals = 0; setTimeout(hide, 50); });
  el.querySelector('#agisWayA').addEventListener('click', () => { dismissals = 0; sessSet('after', 'asi'); setTimeout(hide, 50); });
  el.querySelector('#agisWayB').addEventListener('click', () => { dismissals = 0; sessSet('after', 'agi'); setTimeout(hide, 50); });
  el.querySelector('#agisList').addEventListener('click', () => { const ul = el.querySelector('#agisTodo'), b = el.querySelector('#agisList'); const open = ul.hidden; if (open) { const pr = progress(); ul.innerHTML = `<li class="sum">${pr.n} of ${pr.of} done</li>` + NEXT.map(n => { const d = n.test(); const g = typeof n.go === 'function' ? n.go() : n.go; return `<li class="${d ? 'did' : 'todo'}"><i>${d ? '✓' : ''}</i>${g && !d ? `<a href="${esc(g)}">${esc(n.label)}</a>` : `<span>${esc(n.label)}</span>`}</li>`; }).join(''); } ul.hidden = !open; b.setAttribute('aria-expanded', String(open)); clearTimeout(timer); });
  el.querySelector('#agisAsk').addEventListener('submit', e => { e.preventDefault(); const q = el.querySelector('#agisQ').value.trim(); if (!q) return; el.querySelector('#agisQ').value = ''; answer(q); });
  el.querySelector('#agisQ').addEventListener('focus', () => { clearTimeout(timer); });
}
function show(turns, opts) {
  build(); opts = opts || {};
  el.querySelector('#agisTurns').innerHTML = turns.map(([w, t]) => `<div class="turn ${w}${w === 'agi' && notch() >= 3 ? ' warm' : ''}"><b>${w.toUpperCase()}</b><p>${esc(t)}</p></div>`).join('');
  const A = el.querySelector('#agisWayA'), B = el.querySelector('#agisWayB'), G = el.querySelector('#agisGo');
  A.hidden = B.hidden = G.hidden = true;
  if (opts.ways) { if (opts.ways.asi) { A.hidden = false; A.href = opts.ways.asi.go; A.textContent = "ASI's way"; } if (opts.ways.agi) { B.hidden = false; B.href = opts.ways.agi.go; B.textContent = "AGI's way"; } }
  else if (opts.go) { G.hidden = false; G.href = opts.go; G.textContent = opts.goLabel || 'Take me'; }
  el.querySelector('#agisTodo').hidden = true; el.querySelector('#agisList').setAttribute('aria-expanded', 'false');
  el.classList.remove('off'); el.classList.add('on', 'pop'); setTimeout(() => el.classList.remove('pop'), 500);
  document.dispatchEvent(new CustomEvent('fv:sfx', { detail: { kind: 'clippo' } }));
  lastAt = performance.now(); wake();
  ['nmA', 'nmB'].forEach(id => el.querySelector('#' + id).classList.remove('live')); turns.forEach(([w]) => el.querySelector(w === 'asi' ? '#nmA' : '#nmB').classList.add('live'));
  speakTurns(turns);
  clearTimeout(timer); timer = setTimeout(() => { if (el.classList.contains('on')) { dismissals++; hide(); } }, 16000 + 4000 * turns.length);
}
function hide() { if (!el) return; el.classList.remove('on'); clearTimeout(timer); hush(); ['nmA', 'nmB'].forEach(id => el.querySelector('#' + id).classList.remove('live')); if (dismissals >= QUIET_AFTER) quiet = true; }

/* ---- what they say when: a keyed exchange, once per device (answers to something you just did skip the waiting period) */
const REACTIONS = new Set(['watch1', 'watch3', 'secret', 'search', 'award']);
function say(key, force) {
  const turns = TALK[key]; if (!turns) return false;
  seen = seen || new Set(store.get('seen', []));
  if (!force) {
    if (quiet) return false;
    if (seen.has(key)) return false;
    if (!REACTIONS.has(key) && performance.now() - lastAt < GAP) return false;
    if (document.getElementById('bumper') || document.getElementById('ident')) { clearTimeout(retryT); retryT = setTimeout(() => say(key), 2500); return false; }   // the elevator or the logo is on screen: wait for them
  }
  show(turns);
  if (!seen.has(key)) { seen.add(key); store.set('seen', [...seen]); }
  return true;
}
/* the greeting after the first visit: AGI's notch line, then ASI */
function greet(force) {
  if (!force && (quiet || sessGet('greeted'))) return false;
  if (!seen) seen = new Set(store.get('seen', []));
  if (!seen.has('arrive')) return say('arrive', force);
  sessSet('greeted', 1); show([['agi', agiLine('greet')], ['asi', asiLine('greet')]]); return true;
}
/* the disagreement: ASI's pick and AGI's pick of what to do next, the visitor chooses; at most once a visit per thing, never again once done */
function picks(p) {
  const nudged = new Set(sessGet('nudged') || []);
  const ok = n => !n.test() && (!n.when || n.when()) && !nudged.has(n.key) && (n.on.includes(p) || n.on.includes('any') || !!n.go);
  const byKey = k => NEXT.find(n => n.key === k && ok(n));
  const here = n => n && (n.on.includes(p) || n.on.includes('any'));
  const order = likes => { const L = likes.map(byKey).filter(Boolean); return L.find(here) || L[0] || null; };
  return { asi: order(WHO.asi.likes), agi: order(WHO.agi.likes) };
}
function nudge(force) {
  if (!force) { if (quiet) return false; if (mediaOn()) return false; if (performance.now() - lastAt < GAP) return false; }
  const p = page(), { asi: a, agi: b } = picks(p);
  if (!a && !b) { if (force) { const pr = progress(); if (pr.n >= pr.of) { show([['asi', "You've done the whole thing. I have nothing left to say, which is new for me."], ['agi', 'Confirmed. The list is complete. Submit another idea; the list will grow.']]); return true; } } return false; }
  const goOf = n => typeof n.go === 'function' ? n.go() : n.go;
  const nudged = new Set(sessGet('nudged') || []);
  if (a && b && a !== b) { show([['asi', a.asi], ['agi', b.agi]], { ways: { asi: goOf(a) ? { go: goOf(a) } : null, agi: goOf(b) ? { go: goOf(b) } : null } }); nudged.add(a.key); nudged.add(b.key); }
  else { const n = a || b; const other = a ? 'agi' : 'asi'; const agree = a ? (notch() >= 2 ? "Agreed, for once. Properly, this time." : 'Agreed. Properly. In order.') : 'Oh, fine, hers is good too. Go.'; show([[a ? 'asi' : 'agi', a ? n.asi : n.agi], [other, agree]], { go: goOf(n) || null, goLabel: n.goLabel }); nudged.add(n.key); }
  sessSet('nudged', [...nudged]);
  return true;
}
/* after a way is chosen, the one who lost says one line, once the page has changed */
function aftermath() {
  const who = sessGet('after'); if (!who) return; sessSet('after', null);
  setTimeout(() => { if (quiet) return; show(who === 'asi' ? [['agi', agiLine('lost')], ['asi', asiLine('won')]] : [['asi', asiLine('lost')], ['agi', agiLine('won')]]); }, 1800);
}
/* ---- a typed question: the best row in ANSWERS, or the nearest with a miss line; the door is shut */
let door = null;
export function setDoor(fn) { door = typeof fn === 'function' ? fn : null; }
const norm = s => ' ' + String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
function bestRow(q) {
  const nq = norm(q), words = nq.trim().split(' ').filter(w => w.length > 2);
  let best = null, bs = 0, near = null, ns = 0;
  const STOP = new Set(['you', 'your', 'the', 'and', 'are', 'what', 'how', 'who', 'does', 'this', 'that', 'with', 'for', 'can']);
  ANSWERS.forEach(r => { let s = 0, n = 0; r.k.forEach(k => { if (nq.includes(' ' + k + ' ')) s += k.includes(' ') ? 3 : 2; else k.split(' ').forEach(kw => { if (kw.length > 3 && !STOP.has(kw) && words.some(w => !STOP.has(w) && (w === kw || (w.length > 3 && kw.startsWith(w.slice(0, 4)))))) n += 1; }); }); if (s > bs) { bs = s; best = r; } if (n > ns) { ns = n; near = r; } });
  return { best: bs > 0 ? best : null, near: ns > 0 ? near : ANSWERS.find(r => r.k.includes('help')) };   // nothing near at all: the help row, which is the honest nearest
}
async function answer(q) {
  const { best, near } = bestRow(q);
  if (best) { show([['asi', best.asi], ['agi', best.agi]]); return; }
  if (door) { try { const r = await door(q); if (r && (r.asi || r.agi)) { show([r.asi ? ['asi', r.asi] : null, r.agi ? ['agi', r.agi] : null].filter(Boolean)); return; } } catch (e) { } }
  show([['agi', agiLine('miss')], ['asi', asiLine('miss') + ' ' + near.asi]]);
}
/* ---- the site tells them what happened */
function pageTip(p) {
  if (p === 'home') return 'arrive'; if (p === 't') return 'title';
  if (p === 'games') { const sub = (location.hash.split('/')[2] || ''); return sub === 'dead-ends' ? 'maze' : sub === 'in-pieces' ? 'puzzle' : sub === 'over-the-board' ? 'chess' : 'games'; }
  return ({ trophies: 'trophies', music: 'music', submit: 'submit', ptu: 'ptu', ideas: 'ideas' })[p] || null;
}
function armIdle() { clearTimeout(idleT); idleT = setTimeout(() => { if (!document.hidden && !mediaOn() && !quiet) { if (!nudge(false)) show([[Math.random() < 0.5 ? 'agi' : 'asi', Math.random() < 0.5 ? agiLine('idle') : asiLine('idle')]]); } armIdle(); }, IDLE); }
export function mount() {
  if (born) return; born = true;
  build(); countVisit();
  const q = store.get('quiet', 0); if (q && Date.now() - q < 6 * 3600 * 1000) quiet = true;      // Stop holds for six hours
  const seeRoute = () => {
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/'); const a = parts[0] || 'home', b = parts[1] || '';
    if (a === 't') markDone('title'); if (a === 'ptu' && b) markDone('planet'); if (a === 'show') markDone('show'); if (a === 'tfrta' && b) markDone('post');
    if (a === 'trophies') markDone('trophies'); if (a === 'games' && b) markDone('g:' + b); if (a === 'music') markDone('music');
  };
  const onRoute = () => { seeRoute(); aftermath(); const p = page(); const k = pageTip(p); const delay = k === 'arrive' ? 9000 : k === 'title' ? 18000 : 6000; clearTimeout(routeT); routeT = setTimeout(() => { if (page() !== p) return; if (k === 'arrive') { if (!greet(false)) nudge(false); return; } if (!k || !say(k)) nudge(false); }, delay); };
  addEventListener('hashchange', onRoute); onRoute();
  document.addEventListener('fv:event', e => {
    const d = e.detail || {};
    if (d.kind === 'watch') { const n = d.count || 1; if (n === 1) say('watch1'); else if (n === 3) say('watch3'); }
    if (d.kind === 'search') say('search'); if (d.kind === 'secret') say('secret');
    if (d.kind === 'award' && d.fresh) { markDone('submitted'); say('award'); }
    if (d.kind === 'arrive') markDone('rode');
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-play], [data-playalb], [data-radio], .trk')) markDone('radio'); if (e.target.closest('#prev')) markDone('preview'); }, true);
  document.addEventListener('fv:sound', e => { if (e.detail && e.detail.on === false) hush(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); else wake(); });
  if ('speechSynthesis' in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }
  ['pointerdown', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, armIdle, { passive: true }));
  armIdle();
}
export const _test = { notch, picks, bestRow, voices, mood };
