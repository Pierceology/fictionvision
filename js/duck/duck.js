// THE DUCK on FictionVision: the same game file Pierce's Project 0 lot runs (js/duck/main.js, copied from
// Pierce's project0 repo), given a small stand-in for the city's p0 object so it plays here unchanged.
// What differs from the city: no other players, and "your best" is kept on this device.
import * as THREE from 'three'
import { isOn } from '../sfx.js'

const BEST = 'fv.duck.best'
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch (e) { return d } }
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } }

export function mount(root) {
  root.innerHTML = `<div class="duck-page">
    <div class="duck-stage"><canvas class="duck-canvas" aria-label="The Duck: press on the duck and hold it under"></canvas></div>
    <p class="duck-hud" aria-live="polite"></p>
    <p class="duck-credit">Quacks: a female mallard at Rye Grove, Surrey. British Library, via Wikimedia Commons, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</p></div>`
  const stage = root.querySelector('.duck-stage'), canvas = root.querySelector('.duck-canvas'), hudEl = root.querySelector('.duck-hud')
  let dead = false, raf = 0, last = 0, t0 = performance.now()
  const handlers = {}, loops = []
  const emit = (ev, ...a) => (handlers[ev] || []).forEach(f => { try { f(...a) } catch (e) { console.error(e) } })

  // sound: the package's own WAVs through Web Audio, and only while the site's one speaker switch is on
  let ac = null; const bufs = {}, live = new Map(); let nextId = 1
  const audio = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { } } if (ac && ac.state === 'suspended') ac.resume(); return ac }
  const load = path => bufs[path] || (bufs[path] = fetch(new URL('./' + path, import.meta.url)).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => audio().decodeAudioData(b, ok, no))).catch(() => null))
  const stopAll = () => { for (const s of live.values()) { try { s.stop() } catch (e) { } } live.clear() }
  const onSound = e => { if (!e.detail || !e.detail.on) stopAll() }
  document.addEventListener('fv:sound', onSound)

  let renderer = null
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1))
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 200)
  const pointer = { x: 0, y: 0, buttons: 0, locked: false }
  const p0 = {
    lot: { id: 0, width: 12, depth: 12, height: 19, size: 12, name: 'The Duck' },
    scene, camera,
    get renderer() { return renderer || p0.createRenderer({}) },
    createRenderer(o) { if (!renderer) { renderer = new THREE.WebGLRenderer(Object.assign({ canvas, alpha: false }, o, { antialias: true })); renderer.setPixelRatio(p0.pixelRatio); size() } return renderer },
    pixelRatio: Math.min(2, window.devicePixelRatio || 1),
    width: 1, height: 1,
    controls: { mode: 'none' }, bodies: { visible: false },
    me: { id: 'me', name: 'You', position: { x: 0, y: 0, z: 0 } },
    players: new Map([['me', { id: 'me', name: 'You', isMe: true }]]),
    room: { send() { } },
    input: { keys: new Set(), isDown: c => p0.input.keys.has(c), pointer },
    table: [],
    asset: path => new URL('./' + path, import.meta.url).href,
    on(ev, f) { (handlers[ev] = handlers[ev] || []).push(f) },
    loop(f) { loops.push(f) },
    hud(text) { hudEl.textContent = String(text).split('\n').slice(1).join(' ').replace(/\s*Click or press any key for sound\.?/, '') },
    log() { },
    score(ms) {
      const was = lsGet(BEST, 0), best = Math.max(was, ms); lsSet(BEST, best)
      setTimeout(() => emit('reward', { kind: 'score', ok: true, score: ms, best, place: null }), 0)
      document.dispatchEvent(new CustomEvent('fv:event', { detail: { kind: 'duck', ms, best: was > 0 && ms > was } }))
    },
    sound: {
      play(path, o = {}) {
        if (!isOn()) return null
        const id = nextId++
        load(path).then(buf => {
          if (!buf || dead || !isOn()) return
          const a = audio(), src = a.createBufferSource(), g = a.createGain()
          src.buffer = buf; src.loop = !!o.loop; src.playbackRate.value = o.rate || 1; g.gain.value = o.volume == null ? 1 : o.volume
          src.connect(g).connect(a.destination); src.start(); live.set(id, src); src.onended = () => live.delete(id)
        })
        return id
      },
      stop(id) { const s = live.get(id); if (s) { try { s.stop() } catch (e) { } live.delete(id) } },
    },
  }

  function size() {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight)
    p0.width = w; p0.height = h
    if (renderer) renderer.setSize(w, h, false)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    emit('resize')
  }
  const ro = new ResizeObserver(size); ro.observe(stage)

  const xy = e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top }
  const down = e => { xy(e); pointer.buttons = 1; audio(); try { canvas.setPointerCapture(e.pointerId) } catch (err) { } e.preventDefault(); emit('pointerdown', e) }
  const move = e => { xy(e); emit('pointermove', e) }
  const up = e => { xy(e); pointer.buttons = 0; emit('pointerup', e) }
  const key = e => { if (dead) return; p0.input.keys.add(e.code); emit('keydown', e) }
  const keyUp = e => { p0.input.keys.delete(e.code); emit('keyup', e) }
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up)
  window.addEventListener('keydown', key); window.addEventListener('keyup', keyUp)

  import('./main.js?v=20261013f').then(async m => {
    if (dead) return
    await m.default(p0)
    // the best you set on this device before shows on the wall from the start
    const best = lsGet(BEST, 0); if (best > 0) emit('reward', { kind: 'score', ok: true, score: best, best, place: null })
    last = performance.now()
    const frame = now => {
      if (dead) return
      const dt = Math.min(0.1, (now - last) / 1000); last = now
      const time = (now - t0) / 1000
      for (const f of loops) f(dt, time)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  }).catch(e => { console.error(e); stage.innerHTML = '<p class="duck-hud">The Duck did not load. Check your connection and try again.</p>' })

  return () => {
    dead = true; cancelAnimationFrame(raf); ro.disconnect(); stopAll()
    document.removeEventListener('fv:sound', onSound)
    window.removeEventListener('keydown', key); window.removeEventListener('keyup', keyUp)
    try { renderer && renderer.dispose() } catch (e) { }
    try { ac && ac.close() } catch (e) { }
  }
}
