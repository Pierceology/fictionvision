// THE DUCK on a phone: the Duck's dark room, its warm light, and two lines saying it plays on a computer.
// Pierce, 2026-10-13: the game was great on desktop, so it comes back there; phones get this card instead.
import * as THREE from 'three'
import { plate, say } from './text.js'

const IVORY = '#ece4d3', GOLD = '#c9a96a'
const LINES = ['The Duck plays on a computer.', 'Come back on a desktop and hold it under.']

export async function phoneCard(p0) {
  const lot = p0.lot
  const S = Math.min(lot.width, lot.depth) / 12
  const H = lot.height
  try { p0.createRenderer({ antialias: false, powerPreference: 'high-performance' }) } catch (e) { }
  const scene = p0.scene, camera = p0.camera
  p0.controls.mode = 'none'
  p0.bodies.visible = false
  scene.background = new THREE.Color(0x06080a)
  scene.traverse(o => { if (o.isHemisphereLight) { o.intensity = 0.35; o.color.set(0xb8c8d6); o.groundColor.set(0x1c242a) } })

  /* ---- the light: one warm pool on the wall ---- */
  scene.add(new THREE.AmbientLight(0x93a4b4, 0.35))
  const key = new THREE.SpotLight(0xffe6c0, 6, 0, 0.5, 0.9, 0)
  key.position.set(0.6 * S, 11 * S, 2 * S); key.target.position.set(0, 4 * S, -lot.depth / 2); scene.add(key, key.target)

  /* ---- the room: the Duck's dark stone and quiet walls ---- */
  const stone = new THREE.MeshStandardMaterial({ color: 0x23292f, roughness: 0.5, metalness: 0.15 })
  const floor = new THREE.Mesh(new THREE.BoxGeometry(lot.width, 0.2, lot.depth), stone); floor.position.y = 0.1; scene.add(floor)
  const plaster = new THREE.MeshStandardMaterial({ color: 0x2b3238, roughness: 0.95 })
  const wall = new THREE.Mesh(new THREE.BoxGeometry(lot.width, H, 0.3), plaster); wall.position.set(0, H / 2, -lot.depth / 2 + 0.15); scene.add(wall)
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, H, lot.depth), plaster); w.position.set(sx * (lot.width / 2 - 0.15), H / 2, 0); scene.add(w) }

  /* ---- the line: sized to the screen, hung just in front of the lens, so a phone reads it as well as a desk ---- */
  const card = plate(1536, 640)
  {
    const c = card.ctx
    c.fillStyle = GOLD; c.fillRect(768 - 60, 120, 120, 3)
    LINES.forEach((l, i) => say(c, l, 768, 280 + i * 130, { size: 96, style: 'italic', color: IVORY, fit: 1440 }))
    card.done()
  }
  const cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 640 / 1536), new THREE.MeshBasicMaterial({ map: card.texture, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }))
  cardMesh.renderOrder = 20
  scene.add(camera); camera.add(cardMesh)

  /* ---- the camera: standing in the room, facing the lit wall ---- */
  camera.near = 0.1; camera.far = 200; camera.fov = 60
  const camAt = new THREE.Vector3(0, 3 * S, Math.min(lot.depth / 2 - 0.3, 5.6 * S)), look = new THREE.Vector3(0, 4 * S, -lot.depth / 2)
  function layout() {
    const aspect = p0.width / Math.max(1, p0.height)
    camera.fov = aspect < 1 ? 70 : 60; camera.updateProjectionMatrix()
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), vw = vh * aspect
    // as wide as a phone allows, never wider than a calm line on a desk
    const w = Math.min(vw * 0.9, vh * 1.25)
    cardMesh.scale.setScalar(w); cardMesh.position.set(0, vh * 0.04, -1)
  }
  layout()
  p0.on('resize', layout)
  camera.position.copy(camAt); camera.lookAt(look)
  p0.me.position = { x: camAt.x, y: camAt.y, z: camAt.z }
  p0.hud('THE DUCK\nThe Duck plays on a computer. Come back on a desktop and hold it under.')

  p0.loop((dt, time) => {
    camera.position.set(camAt.x + Math.sin(time * 0.23) * 0.1 * S, camAt.y + Math.sin(time * 0.31) * 0.05 * S, camAt.z); camera.lookAt(look)
  })
  try { await p0.renderer.compileAsync(scene, camera); p0.renderer.render(scene, camera) } catch (e) { }
}
