// Words on a texture, drawn in the worker with an OffscreenCanvas.
// `plate(w, h)` gives a transparent canvas, its 2D context and a texture that follows it: draw, then `done()`.
import * as THREE from 'three'

export const SERIF = 'Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, "Times New Roman", serif'
export const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export function plate(width, height) {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return {
    canvas, ctx, texture, width, height,
    clear() { ctx.clearRect(0, 0, width, height) },
    done() { texture.needsUpdate = true },
  }
}

// one line, centred or aligned, with optional letter spacing; shrinks to fit `fit` pixels if it is wider
export function say(ctx, str, x, y, o) {
  const q = Object.assign({ size: 40, weight: 400, style: 'normal', font: SERIF, color: '#ece4d3', align: 'center', space: 0, fit: 0 }, o || {})
  let size = q.size
  const set = () => { ctx.font = `${q.style} ${q.weight} ${size}px ${q.font}`; try { ctx.letterSpacing = q.space ? `${q.space}px` : '0px' } catch (e) { } }
  set()
  if (q.fit) { const w = ctx.measureText(str).width; if (w > q.fit) { size = Math.floor(size * q.fit / w); set() } }
  ctx.fillStyle = q.color; ctx.textAlign = q.align; ctx.textBaseline = 'middle'
  // letter spacing adds a trailing gap: nudge centred text back by half of it
  ctx.fillText(str, q.align === 'center' && q.space ? x + q.space / 2 : x, y)
}

// a clock face: every digit in its own fixed cell, so the numbers never shimmy as they change
export function clockFace(ctx, str, cx, cy, size, color, weight) {
  ctx.font = `normal ${weight || 200} ${size}px ${SANS}`
  try { ctx.letterSpacing = '0px' } catch (e) { }
  const cell = ctx.measureText('0').width, dot = ctx.measureText('.').width * 1.1
  const widths = [...str].map(c => (c === '.' ? dot : cell))
  let x = cx - widths.reduce((a, b) => a + b, 0) / 2
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ;[...str].forEach((c, i) => { ctx.fillText(c, x + widths[i] / 2, cy); x += widths[i] })
}
