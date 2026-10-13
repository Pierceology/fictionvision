// THE DUCK. A tub, a rubber duck, your hand. Hold it under; it fights; let go or lose it; your time goes on the board.
// "There are two types of people in the world: those who hold their breath for as long as they can,
//  and those who hold their breath for as long as they have to." — Pierce
import * as THREE from 'three'
import { plate, say, clockFace, SERIF, SANS } from './text.js'

const QUOTE = ['There are two types of people in the world:', 'those who hold their breath for as long as they can,', 'and those who hold their breath for as long as they have to.']
const IVORY = '#ece4d3', GOLD = '#c9a96a', MUTED = 'rgba(236,228,211,0.62)'

export default async function start(p0) {
  const lot = p0.lot
  const S = Math.min(lot.width, lot.depth) / 12          // everything is drawn for a 12 m lot and scaled
  const H = lot.height
  // the review's browser has no GPU: no multisampling. The page picks the pixel ratio.
  try { p0.createRenderer({ antialias: false, powerPreference: 'high-performance' }) } catch (e) { }
  const scene = p0.scene, camera = p0.camera
  p0.controls.mode = 'none'
  p0.bodies.visible = false
  scene.background = new THREE.Color(0x06080a)
  // the city's own sky light has a warm ground colour that turns the duck's underside pink: cool it and turn it down
  scene.traverse(o => { if (o.isHemisphereLight) { o.intensity = 0.35; o.color.set(0xb8c8d6); o.groundColor.set(0x1c242a) } })

  /* ---- the light: one warm pool from above, a cool edge from behind ---- */
  scene.add(new THREE.AmbientLight(0x93a4b4, 0.5))
  const key = new THREE.SpotLight(0xffe6c0, 5, 0, 0.66, 0.9, 0)
  key.position.set(0.9 * S, 11 * S, 3.6 * S); key.target.position.set(0, 1 * S, -0.8 * S); scene.add(key, key.target)
  const edge = new THREE.DirectionalLight(0x9fd0e8, 0.9); edge.position.set(-5, 6, -8); scene.add(edge)

  /* ---- the room: dark stone, quiet walls ---- */
  const stone = new THREE.MeshStandardMaterial({ color: 0x23292f, roughness: 0.5, metalness: 0.15 })
  const floor = new THREE.Mesh(new THREE.BoxGeometry(lot.width, 0.2, lot.depth), stone); floor.position.y = 0.1; scene.add(floor)
  const grout = new THREE.MeshStandardMaterial({ color: 0x0f1316, roughness: 1 })
  const gx = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.01, lot.depth), grout, 7), gz = new THREE.InstancedMesh(new THREE.BoxGeometry(lot.width, 0.01, 0.04), grout, 7)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 7; i++) { gx.setMatrixAt(i, m4.makeTranslation((i - 3) * lot.width / 6, 0.205, 0)); gz.setMatrixAt(i, m4.makeTranslation(0, 0.205, (i - 3) * lot.depth / 6)) }
  scene.add(gx, gz)
  const plaster = new THREE.MeshStandardMaterial({ color: 0x2b3238, roughness: 0.95 })
  const wall = new THREE.Mesh(new THREE.BoxGeometry(lot.width, H, 0.3), plaster); wall.position.set(0, H / 2, -lot.depth / 2 + 0.15); scene.add(wall)
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, H, lot.depth), plaster); w.position.set(sx * (lot.width / 2 - 0.15), H / 2, 0); scene.add(w) }
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a96a, roughness: 0.32, metalness: 0.85 })
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(lot.width - 0.6, 0.05 * S, 0.05), brass); skirt.position.set(0, 0.45 * S, -lot.depth / 2 + 0.33); scene.add(skirt)

  /* ---- the words on the wall: the quote, then the clock and the week's best ---- */
  const quote = plate(2048, 640)
  {
    const c = quote.ctx
    QUOTE.forEach((l, i) => say(c, l, 1024, 110 + i * 100, { size: 68, style: 'italic', color: IVORY, fit: 1900 }))
    c.fillStyle = GOLD; c.fillRect(1024 - 50, 392, 100, 2)
    say(c, '— Pierce', 1024, 450, { size: 46, style: 'italic', color: GOLD })
    quote.done()
  }
  const wallText = (tex, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }))
  const quoteMesh = wallText(quote.texture, 9.6 * S, 3.0 * S)
  quoteMesh.position.set(0, 4.12 * S, -lot.depth / 2 + 0.34); scene.add(quoteMesh)
  const board = plate(1536, 768)
  const boardMesh = wallText(board.texture, 6.0 * S, 3.0 * S)
  boardMesh.position.set(0, 2.09 * S, -lot.depth / 2 + 0.34); scene.add(boardMesh)
  // two quiet columns either side of the clock: your best on the left, the week's best on the right
  const mine = plate(1024, 768), week = plate(1024, 768)
  const mineMesh = wallText(mine.texture, 3.2 * S, 2.4 * S), weekMesh = wallText(week.texture, 3.2 * S, 2.4 * S)
  mineMesh.position.set(-3.95 * S, 2.3 * S, -lot.depth / 2 + 0.34); weekMesh.position.set(3.95 * S, 2.3 * S, -lot.depth / 2 + 0.34); scene.add(mineMesh, weekMesh)

  /* ---- the tub: ivory porcelain, a brass band, deep water ---- */
  const R = 3.2 * S, WATER_Y = 1.15 * S
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.28 })
  const inner = new THREE.MeshStandardMaterial({ color: 0x5f7b82, roughness: 0.55, side: THREE.BackSide })
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.35 * S, R + 0.1 * S, 1.5 * S, 48, 1, true), porcelain); outer.position.y = 0.95 * S; scene.add(outer)
  const lining = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.35 * S, R + 0.1 * S, 1.5 * S, 48, 1, true), inner); lining.position.y = 0.95 * S; scene.add(lining)
  const tubBottom = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.1 * S, R + 0.1 * S, 0.1 * S, 48), new THREE.MeshStandardMaterial({ color: 0x6f8b92, roughness: 0.6 })); tubBottom.position.y = 0.25 * S; scene.add(tubBottom)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.35 * S, 0.2 * S, 12, 48), porcelain); rim.rotation.x = Math.PI / 2; rim.position.y = 1.7 * S; scene.add(rim)
  const band = new THREE.Mesh(new THREE.TorusGeometry(R + 0.3 * S, 0.035 * S, 6, 48), brass); band.rotation.x = Math.PI / 2; band.position.y = 1.42 * S; scene.add(band)
  // the water: deep in the middle, pale at the edge, a slow shimmer, a glint from the lamp, thin rings round the duck
  const waterUniforms = { uTime: { value: 0 }, uDuck: { value: new THREE.Vector2(0, 0) }, uDepth: { value: 0 }, uSplash: { value: 0 }, uSplashAt: { value: new THREE.Vector2(0, 0) } }
  const RAD = (R + 0.05 * S).toFixed(3)
  const water = new THREE.Mesh(new THREE.CircleGeometry(R + 0.05 * S, 64), new THREE.ShaderMaterial({
    uniforms: waterUniforms, transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime, uDepth, uSplash; uniform vec2 uDuck, uSplashAt; varying vec2 vP;
      void main(){
        float RAD = ${RAD};
        float r = length(vP) / RAD;
        vec3 deep = vec3(0.035, 0.22, 0.29), shallow = vec3(0.24, 0.58, 0.64);
        vec3 col = mix(deep, shallow, smoothstep(0.1, 1.0, r));
        float w = sin(vP.x * 2.1 + uTime * 0.6) * sin(vP.y * 2.5 - uTime * 0.5) + sin((vP.x + vP.y) * 3.3 + uTime * 0.9);
        col += w * 0.018;
        float g = pow(max(0.0, 1.0 - length(vP - vec2(0.9, 0.2) * ${S.toFixed(3)}) / (RAD * 0.95)), 5.0);
        col += vec3(1.0, 0.92, 0.76) * g * 0.28;
        float d = length(vP - uDuck);
        float ring = pow(0.5 + 0.5 * sin(d * 9.0 - uTime * 7.0), 5.0) * smoothstep(2.6, 0.0, d) * (0.18 + uDepth * 0.8);
        float sd = length(vP - uSplashAt);
        float sring = smoothstep(0.12, 0.0, abs(sd - uSplash * 3.2)) * max(0.0, 1.0 - uSplash);
        col = mix(col, vec3(0.88, 0.97, 1.0), clamp(ring * 0.55 + sring, 0.0, 1.0));
        col = mix(col, vec3(0.92, 0.98, 1.0), smoothstep(0.955, 1.0, r) * 0.55);
        gl_FragColor = vec4(col, mix(0.74, 0.9, smoothstep(0.2, 1.0, r)));
      }`
  }))
  water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y; scene.add(water)

  /* ---- the duck: glossy, with a proper flat bill ---- */
  const yellow = new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.36, emissive: 0x6a4600, emissiveIntensity: 0.55 })   // a rubber duck stays yellow in its own shadow
  const orange = new THREE.MeshStandardMaterial({ color: 0xff7a12, roughness: 0.35 })
  const black = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.2 })
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff })
  function makeDuck(mat) {
    const g = new THREE.Group()
    const ball = (r, sx, sy, sz, m, x, y, z, rz) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); if (rz) o.rotation.z = rz; g.add(o); return o }
    ball(0.62, 1.3, 0.84, 1, mat, 0, 0, 0)                          // body
    ball(0.27, 1.25, 0.72, 0.85, mat, -0.6, 0.3, 0, 0.9)             // tail, flicked up, grown into the body
    ball(0.42, 1, 1, 1, mat, 0.5, 0.78, 0)                            // head
    for (const z of [-1, 1]) ball(0.32, 1.25, 0.5, 0.36, mat, -0.12, 0.12, z * 0.47, -0.12)   // wings, tucked in
    // the bill: one flat, wide spoon of orange, tipped a little down
    ball(0.23, 1.55, 0.4, 1.15, orange, 0.98, 0.66, 0, -0.14)
    for (const z of [-1, 1]) {                                          // eyes with a spark
      ball(0.065, 1, 1, 1, black, 0.8, 0.86, z * 0.28)
      ball(0.02, 1, 1, 1, white, 0.845, 0.89, z * 0.29)
    }
    g.scale.setScalar(S)
    return g
  }
  const duck = makeDuck(yellow); scene.add(duck)
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.8 * S, 32), new THREE.MeshBasicMaterial({ color: 0x03242c, transparent: true, opacity: 0.0 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = WATER_Y + 0.01; scene.add(shadow)
  // the grip: a ring round your hand on the water that drains as the duck slips away from it. Empty ring, the duck is gone.
  const gripU = { uFill: { value: 1 }, uTime: { value: 0 } }
  const grip = new THREE.Mesh(new THREE.RingGeometry(1.02 * S, 1.12 * S, 96, 1), new THREE.ShaderMaterial({
    uniforms: gripU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uFill, uTime; varying vec2 vP;
      void main(){
        float a = fract(atan(vP.x, vP.y) / 6.2831853 + 0.5);              // 0..1 round the ring, starting at the far side
        float on = step(a, uFill);
        vec3 full = vec3(0.79, 0.66, 0.42), empty = vec3(0.93, 0.33, 0.25);
        vec3 col = mix(empty, full, smoothstep(0.15, 0.6, uFill));
        float pulse = uFill < 0.35 ? 0.65 + 0.35 * sin(uTime * 18.0) : 1.0;
        gl_FragColor = vec4(mix(vec3(1.0), col, on), (on * 0.92 * pulse) + (1.0 - on) * 0.14);
      }`,
  })); grip.rotation.x = -Math.PI / 2; grip.position.y = WATER_Y + 0.03; grip.visible = false; grip.renderOrder = 5; scene.add(grip)
  // bubbles while under: round and soft
  const dot = plate(64, 64)
  { const g = dot.ctx.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.6, 'rgba(220,245,255,0.5)'); g.addColorStop(1, 'rgba(220,245,255,0)'); dot.ctx.fillStyle = g; dot.ctx.fillRect(0, 0, 64, 64); dot.done() }
  const NB = 60, bubbleGeo = new THREE.BufferGeometry(), bPos = new Float32Array(NB * 3), bLife = new Float32Array(NB)
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3))
  const bubbles = new THREE.Points(bubbleGeo, new THREE.PointsMaterial({ map: dot.texture, color: 0xffffff, size: 0.2 * S, transparent: true, opacity: 0.9, depthWrite: false })); bubbles.visible = false; scene.add(bubbles)
  // confetti for a new best: gold and cream sparks that burst up from the duck and fall back
  const NC = 90, confGeo = new THREE.BufferGeometry(), cPos = new Float32Array(NC * 3), cVel = new Float32Array(NC * 3), cCol = new Float32Array(NC * 3)
  confGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3)); confGeo.setAttribute('color', new THREE.BufferAttribute(cCol, 3))
  const confetti = new THREE.Points(confGeo, new THREE.PointsMaterial({ map: dot.texture, size: 0.24 * S, vertexColors: true, transparent: true, depthWrite: false }))
  confetti.visible = false; confetti.renderOrder = 7; confetti.frustumCulled = false; scene.add(confetti)
  let confT = 9
  function burst() {
    confT = 0; confetti.visible = true; confetti.material.opacity = 1
    const pal = [[1, 0.82, 0.3], [1, 0.95, 0.75], [0.79, 0.66, 0.42], [1, 0.62, 0.22]]
    for (let i = 0; i < NC; i++) { const a = Math.random() * Math.PI * 2, sp = (0.8 + Math.random() * 2.2) * S; cPos.set([st.x, WATER_Y + 0.4 * S, st.z], i * 3); cVel.set([Math.cos(a) * sp, (3.5 + Math.random() * 4) * S, Math.sin(a) * sp], i * 3); cCol.set(pal[i % 4], i * 3) }
    confGeo.attributes.color.needsUpdate = true
  }


  /* ---- other players' ducks ---- */
  const others = new Map()
  function otherDuck(id) { let o = others.get(id); if (!o) { const p = p0.players.get(id); const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p && p.color ? p.color : '#ffcc1a'), roughness: 0.5 }); const g = makeDuck(mat); g.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.42; m.material.depthWrite = false; if (m.material.emissive) m.material.emissive.set(0x000000) } }); o = { g, x: 0, z: 0, y: 0, tx: 0, tz: 0, ty: 0 }; o.g.scale.multiplyScalar(0.8); scene.add(o.g); others.set(id, o) } return o }
  p0.on('message', (d, from) => { if (d && d.k === 'duck') { const o = otherDuck(from); o.tx = d.x; o.tz = d.z; o.ty = d.y } })
  p0.on('leave', p => { const o = others.get(p.id); if (o) { scene.remove(o.g); others.delete(p.id) } })
  p0.on('reconnect', () => { for (const o of others.values()) scene.remove(o.g); others.clear() })

  /* ---- camera ---- */
  camera.near = 0.1; camera.far = 200
  // a wide screen sees the whole wall at 64 degrees. A tall phone widens the lens until the quote fits,
  // and the two columns move up above the quote, where a tall screen has room.
  function layout() {
    const aspect = p0.width / Math.max(1, p0.height), wallZ = -lot.depth / 2 + 0.34
    if (aspect >= 1) {
      camera.fov = 64
      mineMesh.position.set(-3.95 * S, 2.3 * S, wallZ); weekMesh.position.set(3.95 * S, 2.3 * S, wallZ)
    } else {
      camera.fov = Math.min(100, Math.max(64, THREE.MathUtils.radToDeg(2 * Math.atan(0.44 / aspect))))
      mineMesh.position.set(-1.7 * S, 5.98 * S, wallZ); weekMesh.position.set(1.7 * S, 5.98 * S, wallZ)
    }
    camera.updateProjectionMatrix()
  }
  layout()
  p0.on('resize', layout)
  const camAt = new THREE.Vector3(0, 5.7 * S, Math.min(lot.depth / 2 - 0.3, 5.6 * S))
  const look = new THREE.Vector3(0, 2.75 * S, -1.6 * S)
  camera.position.copy(camAt); camera.lookAt(look)
  p0.me.position = { x: camAt.x, y: camAt.y, z: camAt.z }

  /* ---- the game ---- */
  const st = {
    x: 0, z: 0,            // where the duck is on the water (lot metres)
    y: 0, vy: 0,           // height of its waterline above rest: negative is under
    held: false, holdFor: 0, hand: new THREE.Vector2(0, 0),
    phase: 'ready',        // ready · held · flying · shown
    shownFor: 0, result: null, best: 0, nextBell: 5, lastPanic: 0, flash: 0, spin: 0, lastSent: 0, soundOn: false, wobble: 0,
    noiseA: Math.random() * 6, noiseB: Math.random() * 6,
  }
  let table = p0.table || []
  p0.on('table', t => { table = t; if (st.phase !== 'held') drawBoard() })
  p0.on('reward', r => { if (r.kind === 'score' && r.ok) { st.best = Math.max(st.best, r.best || 0); st.place = r.place; drawBoard() } })

  const ms = t => (t / 1000).toFixed(2) + ' s'
  const secs = t => (t / 1000).toFixed(2)
  // the board on the wall: big quiet numerals while you hold, the verdict after, the week's best under it
  function drawBoard() {
    const c = board.ctx, cx = 768
    board.clear()
    if (st.phase === 'held') {
      clockFace(c, secs(st.holdFor * 1000), cx, 330, 300, st.flash > 0 ? GOLD : IVORY, 200)
      say(c, 'SECONDS', cx, 540, { size: 30, font: SANS, weight: 500, color: GOLD, space: 14 })
    } else if (st.result) {
      say(c, st.result.tag, cx, 178, { size: st.result.newBest ? 44 : 34, font: SANS, weight: 500, color: GOLD, space: 14 })
      clockFace(c, secs(st.result.t), cx, 330, 220, st.result.newBest ? GOLD : IVORY, 200)
      say(c, st.result.line, cx, 510, { size: 54, style: 'italic', color: IVORY })
    } else {
      say(c, 'Press on the duck and hold it under.', cx, 330, { size: 62, style: 'italic', color: IVORY, fit: 1400 })
      say(c, 'Keep your hand on it. The ring is your grip.', cx, 420, { size: 42, style: 'italic', color: MUTED, fit: 1400 })
    }
    board.done()
    // your best this week
    mine.clear()
    if (st.best > 0) {
      say(mine.ctx, 'YOUR BEST', 512, 190, { size: 46, font: SANS, weight: 500, color: GOLD, space: 16 })
      clockFace(mine.ctx, secs(st.best), 512, 370, 230, IVORY, 200)
      if (st.place) say(mine.ctx, ordinal(st.place) + ' this week', 512, 545, { size: 60, style: 'italic', color: MUTED })
    }
    mine.done()
    // the week's best three
    week.clear()
    const rows = table.slice(0, 3)
    if (rows.length) {
      say(week.ctx, 'THIS WEEK', 512, 190, { size: 46, font: SANS, weight: 500, color: GOLD, space: 16 })
      rows.forEach((r, i) => {
        const ry = 330 + i * 118, col = r.you ? GOLD : IVORY
        say(week.ctx, String(i + 1), 110, ry, { size: 58, font: SANS, weight: 300, color: GOLD, align: 'right' })
        say(week.ctx, (r.you ? 'You' : (r.name || 'someone')).slice(0, 16), 160, ry, { size: 68, color: col, align: 'left', fit: 470 })
        say(week.ctx, ms(r.score), 960, ry, { size: 60, font: SANS, weight: 300, color: col, align: 'right' })
      })
    }
    week.done()
  }
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th')
  drawBoard()

  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -WATER_Y), hit = new THREE.Vector3(), ndc = new THREE.Vector2()
  function pointerOnWater() {
    const p = p0.input.pointer
    ndc.set((p.x / p0.width) * 2 - 1, -(p.y / p0.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    return ray.ray.intersectPlane(plane, hit) ? hit : null
  }
  const sounds = { play(name, o) { if (!st.soundOn) return; try { return p0.sound.play('assets/' + name + '.wav', o || {}) } catch (e) { return null } } }
  let bubbleLoop = null

  function grab() {
    if (st.phase !== 'ready' && st.phase !== 'shown') return
    const h = pointerOnWater(); if (!h) return
    const dx = h.x - st.x, dz = h.z - st.z
    if (Math.hypot(dx, dz) > 1.1 * S) return           // you have to press on the duck
    st.held = true; st.phase = 'held'; st.holdFor = 0; st.result = null; st.hand.set(h.x, h.z); st.y = -0.2 * S; st.vy = 0
    bubbles.visible = true; for (let i = 0; i < NB; i++) bLife[i] = -Math.random() * 1.5
    sounds.play('plunge', { volume: 0.7 }); bubbleLoop = sounds.play('bubbles', { volume: 0.25, loop: true })
    sounds.play('quack-under', { volume: 0.55, rate: 0.95 + Math.random() * 0.15 })
    st.nextBell = 5; st.lastPanic = 0; st.flash = 0
  }
  function release(why) {
    if (st.phase !== 'held') return
    st.held = false; st.phase = 'flying'
    const depth = Math.max(0, -st.y / S)
    st.vy = (2.4 + depth * 2.2) * S * 1.4
    const t = Math.round(st.holdFor * 1000)
    st.result = why === 'slipped'
      ? { tag: 'IT GOT AWAY', t, line: 'As long as you could.' }
      : { tag: 'YOU LET GO', t, line: 'As long as you had to.' }
    // a new best (yours, or the week's) is a celebration when it surfaces
    const weekTop = table.length ? Math.max(...table.map(r => r.score || 0)) : 0
    if (st.best > 0 && t > st.best) { st.result.newBest = true; st.result.tag = t > weekTop && weekTop > 0 ? 'TOP OF THE WEEK' : 'NEW BEST' }
    st.best = Math.max(st.best, t)
    if (bubbleLoop) { try { p0.sound.stop(bubbleLoop) } catch (e) { } bubbleLoop = null }
    bubbles.visible = false
    sounds.play('squeak', { volume: 0.8, rate: 0.9 + Math.random() * 0.2 })
    try { p0.score(t) } catch (e) { }
    st.shownFor = 0; drawBoard()
  }
  const DEBUG = false
  p0.on('pointerdown', e => { st.soundOn = true; if (DEBUG) { const p = p0.input.pointer; const v = new THREE.Vector3(st.x, WATER_Y, st.z).project(camera); p0.log('pointer', JSON.stringify({ p, e, w: p0.width, h: p0.height, duck: [(v.x + 1) / 2, (1 - v.y) / 2] })) } grab() })
  p0.on('pointerup', () => { if (st.phase === 'held') release('letgo') })
  p0.on('keydown', e => { st.soundOn = true; if (e && (e.code === 'KeyR' || e.code === 'Space')) { if (st.phase === 'shown' || st.phase === 'flying') { st.phase = 'ready'; st.result = null; drawBoard() } } })
  p0.hud('THE DUCK\nPress on the duck and keep pressing: it fights to get away.\nKeep your pointer on it: the ring is your grip, and when it runs out the duck escapes. A bell rings every five seconds.\nLet go when you have to. Your time goes on the wall. R clears the board.')

  /* ---- the loop ---- */
  let splashT = 9
  p0.loop((dt, time) => {
    dt = Math.min(dt, 0.05)
    waterUniforms.uTime.value = time
    st.noiseA += dt * 1.7; st.noiseB += dt * 2.3
    const depth = Math.max(0, -st.y / S)             // 0 at rest, grows as it goes under (in duck-metres)

    if (st.phase === 'held') {
      st.holdFor += dt
      if (st.holdFor >= st.nextBell) { sounds.play('bell', { volume: 0.55, rate: Math.min(2, 1 + (st.nextBell / 5 - 1) * 0.12) }); sounds.play('quack-under', { volume: 0.45, rate: 0.9 + Math.random() * 0.25 }); st.flash = 0.6; st.nextBell += 5; drawBoard() }
      { const gl = 1 - Math.hypot(st.hand.x - st.x, st.hand.y - st.z) / (1.15 * S); if (gl < 0.3 && time - st.lastPanic > 0.45) { sounds.play('squeak', { volume: 0.4, rate: 1.35 + Math.random() * 0.2 }); st.lastPanic = time } }
      const h = pointerOnWater(); if (h) st.hand.set(h.x, h.z)
      // pushed down: the longer you hold, the deeper, up to the floor of the tub
      const target = -Math.min(1.5, 0.25 + st.holdFor * 0.22) * S
      st.y += (target - st.y) * Math.min(1, dt * 4)
      // it fights: wanders sideways, more the deeper it is
      const fight = 0.35 + depth * 1.3 + st.holdFor * 0.08
      const vx = (Math.sin(st.noiseA) + Math.sin(st.noiseA * 2.7 + 1.3) * 0.5) * fight * S
      const vz = (Math.cos(st.noiseB) + Math.cos(st.noiseB * 1.9 + 0.4) * 0.5) * fight * S
      // and it is drawn to your hand a little, so it stays catchable
      st.x += (vx + (st.hand.x - st.x) * 1.2) * dt
      st.z += (vz + (st.hand.y - st.z) * 1.2) * dt
      const lim = R - 0.9 * S; const r = Math.hypot(st.x, st.z); if (r > lim) { st.x *= lim / r; st.z *= lim / r }
      if (Math.hypot(st.hand.x - st.x, st.hand.y - st.z) > 1.15 * S) release('slipped')
      if (Math.floor(st.holdFor * 10) !== Math.floor((st.holdFor - dt) * 10)) drawBoard()
      st.wobble = depth
      if (st.flash > 0) { st.flash = Math.max(0, st.flash - dt); if (st.flash === 0) drawBoard() }
    } else {
      // free: buoyancy brings it back to the waterline, with a bob
      const k = 28, c = 3.2
      st.vy += (-k * st.y - c * st.vy) * dt
      if (st.y > 0) st.vy -= 9.8 * S * dt * 0.6         // above water: only gravity pulls it down
      st.y += st.vy * dt
      if (st.phase === 'flying' && st.y <= 0.02 * S && st.vy < 0 && splashT > 0.5) {
        splashT = 0; sounds.play('splash', { volume: 0.6 }); waterUniforms.uSplashAt.value.set(st.x, -st.z); st.phase = 'shown'; st.shownFor = 0; drawBoard()
        if (st.result && st.result.newBest) { sounds.play('fanfare', { volume: 0.85 }); burst(); st.spin = 1.4 } else sounds.play('quack', { volume: 0.75, rate: 0.92 + Math.random() * 0.2 })
      }
      st.x += (Math.sin(st.noiseA * 0.3) * 0.08 * S - st.x * 0.05) * dt; st.z += (Math.cos(st.noiseB * 0.3) * 0.08 * S - st.z * 0.05) * dt
      st.wobble = Math.max(0, st.wobble - dt * 2)
      if (st.phase === 'shown') { st.shownFor += dt; if (st.shownFor > 9) { st.phase = 'ready'; st.result = null; drawBoard() } }
    }
    splashT += dt; waterUniforms.uSplash.value = Math.min(1.2, splashT * 1.6)
    waterUniforms.uDuck.value.set(st.x, -st.z); waterUniforms.uDepth.value = Math.min(1, depth)

    // draw the duck
    duck.position.set(st.x, WATER_Y + st.y - 0.25 * S, st.z)
    duck.rotation.set(Math.sin(time * 2.1) * 0.06 + st.wobble * Math.sin(time * 17) * 0.35, Math.atan2(st.hand.x - st.x, st.hand.y - st.z) * (st.held ? 1 : 0) + Math.sin(time * 0.7) * 0.4, Math.sin(time * 1.6) * 0.05 + st.wobble * Math.cos(time * 13) * 0.3)
    shadow.position.set(st.x, WATER_Y + 0.01, st.z); shadow.material.opacity = Math.min(0.55, depth * 0.5)
    if (st.spin > 0) { st.spin = Math.max(0, st.spin - dt); const k = 1 - st.spin / 1.4, e = k * k * (3 - 2 * k); duck.rotation.y += e * Math.PI * 4; duck.position.y += Math.sin(k * Math.PI) * 0.6 * S }
    if (confetti.visible) {
      confT += dt
      for (let i = 0; i < NC; i++) { cVel[i * 3 + 1] -= 7.5 * S * dt; cPos[i * 3] += cVel[i * 3] * dt; cPos[i * 3 + 1] += cVel[i * 3 + 1] * dt; cPos[i * 3 + 2] += cVel[i * 3 + 2] * dt }
      confGeo.attributes.position.needsUpdate = true; confetti.material.opacity = Math.max(0, 1 - Math.max(0, confT - 1.2) / 1.3); if (confT > 2.5) confetti.visible = false
    }
    // the grip meter
    const gripLeft = st.held ? Math.max(0, 1 - Math.hypot(st.hand.x - st.x, st.hand.y - st.z) / (1.15 * S)) : 0
    grip.visible = st.held; grip.position.set(st.hand.x, WATER_Y + 0.03, st.hand.y)
    gripU.uFill.value += (gripLeft - gripU.uFill.value) * Math.min(1, dt * 12); gripU.uTime.value = time
    if (bubbles.visible) {
      for (let i = 0; i < NB; i++) {
        bLife[i] += dt * (0.8 + (i % 5) * 0.15)
        if (bLife[i] > 1) { bLife[i] = 0; bPos[i * 3] = st.x + (Math.random() - 0.5) * 0.8 * S; bPos[i * 3 + 2] = st.z + (Math.random() - 0.5) * 0.8 * S }
        bPos[i * 3 + 1] = bLife[i] < 0 ? -10 : WATER_Y + st.y + bLife[i] * Math.max(0.3 * S, -st.y)
      }
      bubbleGeo.attributes.position.needsUpdate = true
    }
    for (const o of others.values()) { o.x += (o.tx - o.x) * Math.min(1, dt * 8); o.z += (o.tz - o.z) * Math.min(1, dt * 8); o.y += (o.ty - o.y) * Math.min(1, dt * 8); o.g.position.set(o.x, WATER_Y + o.y - 0.2 * S, o.z) }
    if (time - st.lastSent > 0.125 && p0.players.size > 1) { st.lastSent = time; try { p0.room.send({ k: 'duck', x: +st.x.toFixed(2), z: +st.z.toFixed(2), y: +st.y.toFixed(2) }) } catch (e) { } }
    // the camera breathes
    camera.position.set(camAt.x + Math.sin(time * 0.23) * 0.15 * S, camAt.y + Math.sin(time * 0.31) * 0.08 * S, camAt.z); camera.lookAt(look.x + st.x * 0.2, look.y, look.z)
  })

  // compile every material before the first frame
  try { await p0.renderer.compileAsync(scene, camera); p0.renderer.render(scene, camera) } catch (e) { }
}
