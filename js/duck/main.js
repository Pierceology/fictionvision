// THE DUCK. A tub, a rubber duck, your hand. Hold it under; it fights; let go or lose it; your time goes on the board.
// "There are two types of people in the world: those who hold their breath for as long as they can,
//  and those who hold their breath for as long as they have to." — Pierce
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { plate, say, clockFace, SERIF, SANS } from './text.js'
import { phoneCard } from './phone-card.js'
// a phone or a small tablet, read from the browser's own name (the city gives a game no device flag)
const isPhone = () => { try { const ua = (self.navigator && self.navigator.userAgent) || ''; return /iPhone|iPod|Android.+Mobile|Windows Phone|webOS|BlackBerry/i.test(ua) } catch (e) { return false } }

const QUOTE = ['There are two types of people in the world:', 'those who hold their breath for as long as they can,', 'and those who hold their breath for as long as they have to.']
// the same words for a phone held upright: short lines, one size, so they read across a narrow screen
const QUOTE_TALL = ['There are two types of people in the world:', 'those who hold their breath', 'for as long as they can,', 'and those who hold their breath', 'for as long as they have to.']
const IVORY = '#ece4d3', GOLD = '#c9a96a', MUTED = 'rgba(236,228,211,0.62)'

export default async function start(p0) {
  // phones get the card: the game is made for a mouse on a desktop (Pierce, 2026-10-13)
  if (isPhone()) return phoneCard(p0)
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
  // the same gold line runs all the way round the room: both side walls and the front
  for (const sx of [-1, 1]) { const sk = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05 * S, lot.depth - 0.6), brass); sk.position.set(sx * (lot.width / 2 - 0.33), 0.45 * S, 0); scene.add(sk) }
  { const sk = new THREE.Mesh(new THREE.BoxGeometry(lot.width - 0.6, 0.05 * S, 0.05), brass); sk.position.set(0, 0.45 * S, lot.depth / 2 - 0.33); scene.add(sk) }

  /* ---- the words on the wall: the quote, then the clock and the week's best ---- */
  const quote = plate(2048, 640)
  {
    const c = quote.ctx
    QUOTE.forEach((l, i) => say(c, l, 1024, 200 + i * 100, { size: 68, style: 'italic', color: IVORY, fit: 1900 }))
    // unsigned, at his word: the line is the room's, not a man quoting himself
    quote.done()
  }
  const wallText = (tex, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }))
  const quoteMesh = wallText(quote.texture, 9.6 * S, 3.0 * S)
  quoteMesh.position.set(0, 4.12 * S, -lot.depth / 2 + 0.34); scene.add(quoteMesh)
  const quoteTall = plate(1536, 800)
  {
    const c = quoteTall.ctx
    c.font = `italic 400 84px ${SERIF}`
    const size = Math.floor(84 * Math.min(1, 1460 / Math.max(...QUOTE_TALL.map(l => c.measureText(l).width))))
    QUOTE_TALL.forEach((l, i) => say(c, l, 768, 120 + i * 140, { size, style: 'italic', color: IVORY }))
    quoteTall.done()
  }
  const board = plate(1536, 768)
  const boardMesh = wallText(board.texture, 6.0 * S, 3.0 * S)
  boardMesh.position.set(0, 2.09 * S, -lot.depth / 2 + 0.34); scene.add(boardMesh)
  // two quiet columns either side of the clock: your best on the left, the week's best on the right
  const mine = plate(1024, 768), week = plate(1024, 768)
  const mineMesh = wallText(mine.texture, 3.2 * S, 2.4 * S), weekMesh = wallText(week.texture, 3.2 * S, 2.4 * S)
  mineMesh.position.set(-3.95 * S, 2.3 * S, -lot.depth / 2 + 0.34); weekMesh.position.set(3.95 * S, 2.3 * S, -lot.depth / 2 + 0.34); scene.add(mineMesh, weekMesh)

  const SHOW_POSTERS = false   // parked: the side walls sit at a grazing angle, so the posters came out skewed and small; see NOW.md Front 5
  /* ---- two posters, one on each side wall: a mock ad for hold-under kits, and a WANTED poster for the week's longest hold ---- */
  const PAPER = '#e8dcc0', INK = '#1d1a14', RED = '#a8321f', DEEP = '#2a6f86'
  const adL = plate(768, 1056), adR = plate(768, 1056)
  const poster = (pl, draw) => {
    const c = pl.ctx; c.clearRect(0, 0, 768, 1056)
    c.fillStyle = PAPER; c.fillRect(0, 0, 768, 1056)
    c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(22, 22, 724, 1012); c.lineWidth = 2; c.strokeRect(36, 36, 696, 984)
    draw(c); pl.done()
  }
  // a flat little rubber duck, drawn in code: round body, round head, orange bill
  const duckArt = (c, x, y, k, tilt) => {
    c.save(); c.translate(x, y); c.rotate(tilt || 0); c.scale(k, k)
    c.fillStyle = '#f4b61c'; c.beginPath(); c.ellipse(0, 0, 120, 84, 0, 0, 7); c.fill()
    c.beginPath(); c.ellipse(-92, -34, 40, 20, -0.5, 0, 7); c.fill()                         // tail
    c.beginPath(); c.arc(62, -96, 60, 0, 7); c.fill()                                        // head
    c.fillStyle = '#e8870f'; c.beginPath(); c.ellipse(120, -86, 40, 17, 0.08, 0, 7); c.fill() // bill
    c.fillStyle = INK; c.beginPath(); c.arc(78, -112, 8, 0, 7); c.fill()
    c.fillStyle = '#e0a00e'; c.beginPath(); c.ellipse(-10, 6, 52, 36, -0.2, 0, 7); c.fill()   // wing
    c.restore()
  }
  poster(adL, c => {
    say(c, 'NEW!', 384, 120, { size: 44, font: SANS, weight: 700, color: RED, space: 12 })
    say(c, 'SUBMERGE', 384, 205, { size: 128, weight: 700, color: INK, fit: 660 })
    say(c, 'The Rubber Duck Hold-Under Kit', 384, 285, { size: 40, style: 'italic', color: INK, fit: 660 })
    // the picture: a duck peeking over a wave, bubbles rising, the body down in the blue
    c.fillStyle = DEEP; c.fillRect(70, 560, 628, 270)
    duckArt(c, 380, 590, 1.35, 0)
    c.fillStyle = DEEP; c.beginPath(); c.moveTo(70, 560); for (let i = 0; i <= 28; i++) c.lineTo(70 + i * 22.4, 560 + Math.sin(i * 1.4) * 16); c.lineTo(698, 640); c.lineTo(70, 640); c.fill()
    c.fillStyle = 'rgba(255,255,255,0.7)'; for (const [bx, by, br] of [[520, 520, 16], [560, 460, 22], [505, 400, 12], [585, 370, 18], [540, 320, 10]]) { c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill() }
    say(c, '"Blub."', 560, 345, { size: 44, style: 'italic', color: INK })
    say(c, 'Now with 40% more bubbles.', 384, 890, { size: 44, weight: 700, color: INK, fit: 660 })
    say(c, 'The duck is fine. The duck is always fine.', 384, 950, { size: 28, style: 'italic', color: INK, fit: 660 })
    say(c, 'Rubber ducks only. Void where prohibited by ducks.', 384, 992, { size: 22, font: SANS, color: 'rgba(29,26,20,0.7)', fit: 660 })
  })
  function drawWanted() {
    const top = (table || [])[0]
    poster(adR, c => {
      say(c, 'WANTED', 384, 150, { size: 150, weight: 700, color: RED, fit: 660, space: 6 })
      say(c, 'for holding it under', 384, 245, { size: 46, style: 'italic', color: INK, fit: 660 })
      c.fillStyle = INK; c.fillRect(90, 290, 588, 3)
      duckArt(c, 384, 520, 1.5, -0.08)
      c.fillStyle = INK; c.fillRect(90, 690, 588, 3)
      say(c, 'LONGEST HOLD THIS WEEK', 384, 745, { size: 30, font: SANS, weight: 700, color: INK, space: 8, fit: 660 })
      say(c, top ? String(top.name || 'someone').slice(0, 16) : 'someone patient', 384, 835, { size: 90, weight: 700, color: INK, fit: 640 })
      say(c, top ? ms(top.score) : 'not yet', 384, 920, { size: 70, font: SANS, weight: 300, color: RED, fit: 640 })
      say(c, 'REWARD: the badge, and bragging rights.', 384, 985, { size: 28, style: 'italic', color: INK, fit: 660 })
    })
  }
  const posterMat = t => new THREE.MeshBasicMaterial({ map: t, color: 0xb9b4a8, toneMapped: false })
  const posterL = new THREE.Mesh(new THREE.PlaneGeometry(3.3 * S, 4.54 * S), posterMat(adL.texture)), posterR = new THREE.Mesh(new THREE.PlaneGeometry(3.3 * S, 4.54 * S), posterMat(adR.texture))
  posterL.rotation.y = Math.PI / 2; posterL.position.set(-lot.width / 2 + 0.34, 4.6 * S, -2.2 * S)
  posterR.rotation.y = -Math.PI / 2; posterR.position.set(lot.width / 2 - 0.34, 4.6 * S, -2.2 * S)
  // a brass frame and a small lamp over each, so they read as hung, not stuck on
  for (const pm of [posterL, posterR]) {
    if (!SHOW_POSTERS) continue
    const fr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.7 * S, 3.46 * S), brass); fr.position.copy(pm.position); fr.position.x += pm.position.x < 0 ? -0.04 : 0.04; scene.add(fr)
    const lamp = new THREE.PointLight(0xffe2b0, 5, 7 * S, 1.6); lamp.position.set(pm.position.x + (pm.position.x < 0 ? 0.9 : -0.9), pm.position.y + 2.6 * S, pm.position.z); scene.add(lamp)
  }
  posterL.visible = posterR.visible = SHOW_POSTERS
  scene.add(posterL, posterR)

  /* ---- the ad: a wide banner across the top of the back wall, straight on to the camera, above the quote ---- */
  let bannerGroup = null, bannerHide = false   // not tied to tallView: the picture can arrive before that is declared
  const BANNER_W = 6.6 * S, BANNER_H = BANNER_W * 890 / 4096
  ;(async () => {
    try {
      const r = await fetch(p0.asset('assets/ad-banner.jpg')); const bmp = await createImageBitmap(await r.blob(), { imageOrientation: 'flipY' })
      const tex = new THREE.Texture(bmp); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true
      const g = new THREE.Group(), z = -lot.depth / 2 + 0.34
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(BANNER_W, BANNER_H), new THREE.MeshBasicMaterial({ map: tex, color: 0xd6d6d6, toneMapped: false })); pic.position.set(0, 0, 0); g.add(pic)
      // a slim brass frame
      for (const [w, h, x, y] of [[BANNER_W + 0.16, 0.08, 0, BANNER_H / 2 + 0.04], [BANNER_W + 0.16, 0.08, 0, -BANNER_H / 2 - 0.04], [0.08, BANNER_H, -BANNER_W / 2 - 0.04, 0], [0.08, BANNER_H, BANNER_W / 2 + 0.04, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), brass); f.position.set(x, y, -0.01); g.add(f) }
      g.position.set(0, 5.85 * S, z); g.visible = !bannerHide; scene.add(g); bannerGroup = g
    } catch (e) { try { p0.log('the ad banner did not load') } catch (e2) { } }
  })()

  /* ---- the tub: ivory porcelain, a brass band, deep water ---- */
  const R = 3.2 * S, WATER_Y = 1.15 * S
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.28 })
  const inner = new THREE.MeshStandardMaterial({ color: 0x5f7b82, roughness: 0.55, side: THREE.BackSide })
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.35 * S, R + 0.1 * S, 1.5 * S, 48, 1, true), porcelain); outer.position.y = 0.95 * S; scene.add(outer)
  const lining = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.35 * S, R + 0.1 * S, 1.5 * S, 48, 1, true), inner); lining.position.y = 0.95 * S; scene.add(lining)
  const tubBottom = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.1 * S, R + 0.1 * S, 0.1 * S, 48), new THREE.MeshStandardMaterial({ color: 0x6f8b92, roughness: 0.6 })); tubBottom.position.y = 0.25 * S; scene.add(tubBottom)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.35 * S, 0.2 * S, 12, 48), porcelain); rim.rotation.x = Math.PI / 2; rim.position.y = 1.7 * S; scene.add(rim)
  const band = new THREE.Mesh(new THREE.TorusGeometry(R + 0.3 * S, 0.035 * S, 6, 48), brass); band.rotation.x = Math.PI / 2; band.position.y = 1.42 * S; scene.add(band)
  // the water: a real moving surface. Slow swells, rings that spread from the duck (stronger the harder it fights), a splash ring;
  // seen from above you look into it (teal, deeper in the middle), at a slant it turns to a dark mirror of the room,
  // and the lamp's highlight rides the waves. A thin bright line where it meets the porcelain.
  const waterUniforms = { uTime: { value: 0 }, uDuck: { value: new THREE.Vector2(0, 0) }, uDepth: { value: 0 }, uSplash: { value: 0 }, uSplashAt: { value: new THREE.Vector2(0, 0) }, uLamp: { value: new THREE.Vector3(0.9 * S, 11 * S, 3.6 * S) }, uGlint: { value: 1 } }
  // the water meets the tub's sloped wall where the wall actually is at the waterline (seen from above, a smaller disc left a slot)
  const WR = R + 0.1 * S + 0.25 * S * (WATER_Y - 0.2 * S) / (1.5 * S)
  const RAD = WR.toFixed(3), SS = S.toFixed(3)
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2 * WR, 2 * WR, 56, 56), new THREE.ShaderMaterial({
    uniforms: waterUniforms, transparent: true, depthWrite: false,
    vertexShader: `uniform float uTime, uDepth, uSplash; uniform vec2 uDuck, uSplashAt;
      varying vec2 vP; varying vec3 vW, vN;
      float hgt(vec2 p) {
        float h = sin(p.x * 1.3 + uTime * 0.9) * 0.012 + sin(p.y * 1.7 - uTime * 0.7) * 0.010 + sin((p.x + p.y) * 2.9 + uTime * 1.6) * 0.006 + sin((p.x - p.y) * 4.3 - uTime * 2.1) * 0.004;
        float d = length(p - uDuck);
        h += sin(d * 7.0 - uTime * 6.0) * 0.03 * (0.25 + uDepth) * exp(-d * 0.9);
        float sd = length(p - uSplashAt);
        h += sin(sd * 6.0 - uSplash * 14.0) * 0.08 * max(0.0, 1.0 - uSplash) * exp(-abs(sd - uSplash * 3.2) * 1.5);
        return h * ${SS} * smoothstep(${RAD}, ${RAD} * 0.9, length(p));
      }
      void main() {
        vec2 p = position.xy; vP = p;
        float e = 0.05, h = hgt(p);
        float gx = (hgt(p + vec2(e, 0.0)) - hgt(p - vec2(e, 0.0))) / (2.0 * e), gy = (hgt(p + vec2(0.0, e)) - hgt(p - vec2(0.0, e))) / (2.0 * e);
        vN = normalize(vec3(-gx, 1.0, gy));                                   // the plane lies flat: local y is world -z
        vec4 w = modelMatrix * vec4(p, h, 1.0); vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `uniform vec3 uLamp; uniform float uTime, uGlint; varying vec2 vP; varying vec3 vW, vN;
      void main() {
        float r = length(vP) / ${RAD}; if (r > 1.0) discard;
        vec3 N = normalize(vN + vec3(sin(vP.x * 23.0 + uTime * 2.3) * sin(vP.y * 7.0 - uTime) * 0.025, 0.0, cos(vP.y * 19.0 - uTime * 1.9) * sin(vP.x * 9.0 + uTime * 1.3) * 0.025)), V = normalize(cameraPosition - vW);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 body = mix(vec3(0.02, 0.13, 0.17), vec3(0.09, 0.33, 0.37), smoothstep(0.25, 1.0, r));
        vec3 Rf = reflect(-V, N);
        vec3 env = mix(vec3(0.025, 0.03, 0.035), vec3(0.17, 0.16, 0.14), smoothstep(-0.1, 0.6, Rf.y));
        float l = max(dot(Rf, normalize(uLamp - vW)), 0.0);
        float spec = pow(l, 500.0) * 5.0 * uGlint + pow(l, 60.0) * 0.35 * mix(0.3, 1.0, uGlint);
        vec3 col = mix(body, env, fres) + vec3(1.0, 0.9, 0.74) * spec;
        col += vec3(0.55, 0.66, 0.66) * smoothstep(0.975, 1.0, r) * 0.35;
        float a = clamp(mix(0.8, 0.98, fres) + spec + smoothstep(0.6, 1.0, r) * 0.15, 0.0, 1.0);
        gl_FragColor = vec4(col, a);
      }`
  }))
  water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y; scene.add(water)

  /* ---- the duck: Pierce's own painted Meshy duck (assets/duck.glb, sized and turned to fit); the drawn one below only if it fails to load ---- */
  let duckModel = null
  try { const gl = await new GLTFLoader().loadAsync(p0.asset('assets/duck.glb')); gl.scene.traverse(o => { if (o.isMesh && !duckModel) duckModel = o }) } catch (e) { p0.log('duck model did not load', String(e)) }
  const yellow = new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.36, emissive: 0x6a4600, emissiveIntensity: 0.55 })   // a rubber duck stays yellow in its own shadow
  const orange = new THREE.MeshStandardMaterial({ color: 0xff7a12, roughness: 0.35 })
  const black = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.2 })
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff })
  function makeDuck(mat) {
    const g = new THREE.Group()
    if (duckModel) {
      const m = duckModel.clone()
      if (mat && mat !== yellow) m.material = mat
      else { m.material = duckModel.material.clone(); m.material.roughness = 0.26; m.material.emissive = new THREE.Color(0xffffff); m.material.emissiveMap = m.material.map; m.material.emissiveIntensity = 0.22 }   // a rubber duck stays yellow in its own shadow
      g.add(m); g.scale.setScalar(S); return g
    }
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
  // a wide screen sees the whole wall at 64 degrees from eye height.
  // A phone held upright looks down into the tub from above, like a phone held over a bath. Its words are sized to the
  // screen, not to the far wall (there they were too small to read): the same plates, hung just in front of the lens,
  // across the top of the screen, and the tub fills everything under them.
  const camAt = new THREE.Vector3(), look = new THREE.Vector3()
  let tallView = false, boardReady = false
  scene.add(camera)
  const hudPlane = (tex, hw) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, hw), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }))
    m.renderOrder = 20; m.visible = false; m.userData.hw = hw; camera.add(m); return m
  }
  const hudQuote = hudPlane(quoteTall.texture, 800 / 1536), hudBoard = hudPlane(board.texture, 0.5)
  const hudMine = hudPlane(mine.texture, 0.75), hudWeek = hudPlane(week.texture, 0.75)
  // where the words end on a phone, in screen widths from the top: the tub starts under it
  const HUD_BOTTOM = 0.98
  // a plate `w` screen-widths wide, centred at `cx` (0 to 1 across), its top `top` screen-widths down from the top edge
  const hudK = () => Math.min(1, 0.6 / (HUD_BOTTOM * p0.width / Math.max(1, p0.height)))   // a short screen gives the words at most 60% of its height
  function putHud(m, w, cx, top) {
    const aspect = p0.width / Math.max(1, p0.height), vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), vw = vh * aspect, k = hudK()
    w *= k; top *= k; cx = 0.5 + (cx - 0.5) * k
    m.scale.setScalar(w * vw); m.position.set((cx - 0.5) * vw, vh * (0.5 - (top + w * m.userData.hw / 2) * aspect), -1)
  }
  // at rest: the week's best, the quote, then how to play. Holding or after a round, the clock and the verdict take the quote's place.
  function placeHud() {
    const on = tallView
    for (const m of [hudQuote, hudBoard, hudMine, hudWeek]) m.visible = on
    if (!on) return
    const rest = !st.held && !st.result, both = st.best > 0
    // clear of the city's corner button, top left
    if (both) { putHud(hudMine, 0.5, 0.26, 0.06); putHud(hudWeek, 0.5, 0.74, 0.06) } else putHud(hudWeek, 0.56, 0.5, 0.05)
    hudMine.visible = both
    hudQuote.visible = rest
    putHud(hudQuote, 0.94, 0.5, 0.31)
    putHud(hudBoard, 0.94, 0.5, rest ? 0.645 : 0.33)
  }
  function layout() {
    const aspect = p0.width / Math.max(1, p0.height), wallZ = -lot.depth / 2 + 0.34
    const tall = aspect < 0.85, was = tallView
    tallView = tall
    // on a phone the wall keeps no words: they are on the screen
    quoteMesh.visible = boardMesh.visible = mineMesh.visible = weekMesh.visible = !tall; posterL.visible = posterR.visible = !tall && SHOW_POSTERS; bannerHide = tall; if (bannerGroup) bannerGroup.visible = !tall
    // from straight above the lamp's hard glint breaks into white flecks: a phone keeps only the soft sheen
    waterUniforms.uGlint.value = tall ? 0.12 : 1
    if (!tall) {
      camera.fov = 64
      camAt.set(0, 5.7 * S, Math.min(lot.depth / 2 - 0.3, 5.6 * S)); look.set(0, 2.75 * S, -1.6 * S)
      boardMesh.position.set(0, 2.09 * S, wallZ); boardMesh.scale.setScalar(1)
      mineMesh.position.set(-3.95 * S, 2.3 * S, wallZ); weekMesh.position.set(3.95 * S, 2.3 * S, wallZ); mineMesh.scale.setScalar(1); weekMesh.scale.setScalar(1)
    } else {
      // the far rim sits just under the words, the near rim just above the bottom edge; the camera rises until the tub fits side to side
      const zc = Math.min(lot.depth / 2 - 0.3, 5.7 * S), rr = R + 0.55 * S, rimY = 1.9 * S
      const topF = Math.min(0.62, HUD_BOTTOM * aspect * hudK() + 0.01), botF = 0.975, a = 0.5 - topF, b = 0.5 - botF
      const v = new THREE.Vector3()
      camera.aspect = aspect
      const aim = (h, pitch, T) => {
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(T))
        camAt.set(0, h, zc); look.set(0, h + Math.sin(pitch) * 10 * S, zc - Math.cos(pitch) * 10 * S)
        camera.position.copy(camAt); camera.lookAt(look); camera.updateProjectionMatrix(); camera.updateMatrixWorld()
        let wide = 0
        for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2; v.set(Math.cos(t) * rr, rimY, Math.sin(t) * rr).project(camera); wide = Math.max(wide, Math.abs(v.x)) }
        return wide
      }
      // screen y (0 at the top) = 0.5 - tan(e - pitch) / (2 tan(fov / 2)): find the pitch that puts the two rims where they belong.
      // A camera too low has none (the tub spans too wide an angle), so it rises and tries again.
      const solve = h => {
        const e1 = Math.atan2(rimY - h, zc + rr), e2 = Math.atan2(rimY - h, zc - rr)
        const f = q => Math.tan(e1 - q) * b - Math.tan(e2 - q) * a
        for (let q = e2 + 0.01, prev = f(q); q < Math.PI / 2 + e2 - 0.02; q += 0.002) {
          const cur = f(q + 0.002)
          if (Math.sign(cur) !== Math.sign(prev)) { const pitch = q + 0.001, T = Math.tan(e2 - pitch) / (2 * b); return T > 0.1 && T < 2.2 ? { pitch, T, e2 } : null }
          prev = cur
        }
        return null
      }
      let ok = false
      for (let h = 9 * S; h <= 24 * S && !ok; h += 0.5 * S) { const r = solve(h); if (r && aim(h, r.pitch, r.T) <= 0.92) ok = true }
      if (!ok) {
        // a narrow screen: the tub can't fit side to side at that height, so the lens opens until it does, the near rim
        // pinned just above the bottom edge, and the dark wall takes the extra room above it
        const h = 14 * S, e2 = Math.atan2(rimY - h, zc - rr)
        let T = 0.7
        for (let i = 0; i < 12; i++) {
          const pitch = e2 - Math.atan(2 * T * b), wide = aim(h, pitch, T)
          if (wide <= 0.92) { ok = true; break }
          T *= wide / 0.92 * 1.02
        }
        if (!ok) { camera.fov = 70; camAt.set(0, 16 * S, zc); look.set(0, 0, -1.5 * S) }   // never edge-on
      }
    }
    camera.updateProjectionMatrix()
    camera.position.copy(camAt); camera.lookAt(look)
    if (boardReady) placeHud()
    if (boardReady && was !== tall) drawBoard()
  }
  layout()
  p0.on('resize', layout)
  p0.me.position = { x: camAt.x, y: camAt.y, z: camAt.z }

  /* ---- the game ---- */
  const st = {
    x: 0, z: 0,            // where the duck is on the water (lot metres)
    y: 0, vy: 0,           // height of its waterline above rest: negative is under
    held: false, holdFor: 0, hand: new THREE.Vector2(0, 0),
    phase: 'ready',        // ready · held · flying · shown
    shownFor: 0, result: null, best: 0, nextBell: 5, lastPanic: 0, flash: 0, spin: 0, lastSent: 0, soundOn: false, wobble: 0,
    noiseA: Math.random() * 6, noiseB: Math.random() * 6, lift: 0, liftTo: 0,
  }
  let table = p0.table || []
  p0.on('table', t => { table = t; if (st.phase !== 'held') drawBoard() })
  // the badges (items 372 and 373, made for this lot): Held It Under for ten seconds, As Long As You Had To for the top of the week
  const BADGE = { under: 372, top: 373 }
  const give = id => { try { if (p0.items && p0.items.give) p0.items.give(id) } catch (e) { } }
  p0.on('reward', r => {
    if (r.kind === 'score' && r.ok) { st.best = Math.max(st.best, r.best || 0); st.place = r.place; if (r.place === 1) give(BADGE.top); drawBoard() }
    if (r.kind === 'item' && r.ok && r.item && st.result) { st.result.badge = r.item.name || ''; drawBoard() }
  })

  const ms = t => (t / 1000).toFixed(2) + ' s'
  const secs = t => (t / 1000).toFixed(2)
  // the board on the wall: big quiet numerals while you hold, the verdict after, the week's best under it
  const canChallenge = typeof p0.invite === 'function', CH = { x: 768 - 250, y: 528, w: 500, h: 64 }
  // a phone reads the wall from farther off: the verdict and the button grow, and the button stays easy to hit
  const CH_WIDE = { x: 768 - 250, y: 528, w: 500, h: 64 }, CH_TALL = { x: 768 - 380, y: 580, w: 760, h: 110 }
  function onChallenge() {
    const p = p0.input.pointer; ndc.set((p.x / p0.width) * 2 - 1, -(p.y / p0.height) * 2 + 1); ray.setFromCamera(ndc, camera)
    const h = ray.intersectObject(tallView ? hudBoard : boardMesh, false)[0]; if (!h || !h.uv) return false
    const x = h.uv.x * 1536, y = (1 - h.uv.y) * 768
    const m = tallView ? 60 : 10        // a thumb on a phone needs more room than a mouse
    return x > CH.x - m && x < CH.x + CH.w + m && y > CH.y - m && y < CH.y + CH.h + m
  }
  function challenge() {
    const t = st.result ? st.result.t : st.best
    try { p0.invite({ kind: 'team', note: t > 0 ? `I held the duck under for ${secs(t)} seconds. Hold it longer.` : 'Hold the duck under. It fights.' }) } catch (e) { }
  }
  function drawBoard() {
    const c = board.ctx, cx = 768
    board.clear()
    if (st.phase === 'held') {
      clockFace(c, secs(st.holdFor * 1000), cx, 330, 300, st.flash > 0 ? GOLD : IVORY, 200)
      say(c, 'SECONDS', cx, 540, { size: 30, font: SANS, weight: 500, color: GOLD, space: 14 })
    } else if (st.result) {
      const T = tallView
      Object.assign(CH, T ? CH_TALL : CH_WIDE)
      say(c, st.result.tag, cx, T ? 70 : 130, { size: T ? (st.result.newBest ? 64 : 54) : (st.result.newBest ? 44 : 34), font: SANS, weight: 500, color: GOLD, space: 14, fit: 1460 })
      if (st.result.badge) say(c, 'BADGE · ' + st.result.badge.toUpperCase(), cx, T ? 140 : 182, { size: T ? 40 : 28, font: SANS, weight: 500, color: GOLD, space: 10, fit: 1400 })
      clockFace(c, secs(st.result.t), cx, T ? 310 : 320, T ? 250 : 210, st.result.newBest ? GOLD : IVORY, 200)
      say(c, st.result.line, cx, T ? 495 : 470, { size: T ? 76 : 54, style: 'italic', color: IVORY, fit: 1460 })
      // one tap sends this time to the whole city: the city's own invitation card, with the time on it, to World chat
      if (canChallenge) {
        // the box is measured from its own words (letter spacing and all), so no letter can ever sit outside its border
        const hot = st.challengeHot, col = hot ? '#e6c88a' : GOLD, label = 'CHALLENGE THE CITY', size = T ? 46 : 30, sp = T ? 14 : 12
        c.font = `500 ${size}px ${SANS}`; try { c.letterSpacing = `${sp}px` } catch (e) { }
        const tw = c.measureText(label).width; try { c.letterSpacing = '0px' } catch (e) { }
        CH.w = Math.min(1460, Math.round(tw + size * 2.2)); CH.x = Math.round(cx - CH.w / 2)
        c.strokeStyle = col; c.lineWidth = T ? 3 : 2; c.strokeRect(CH.x, CH.y, CH.w, CH.h)
        say(c, label, cx, CH.y + CH.h / 2 + 2, { size, font: SANS, weight: 500, color: col, space: sp })
      }
    } else {
      // a phone sees the wall from farther off: the same two lines, larger
      say(c, 'Press on the duck and hold it under.', cx, 330, { size: tallView ? 96 : 62, style: 'italic', color: IVORY, fit: 1460 })
      say(c, 'Keep your hand on it. The ring is your grip.', cx, tallView ? 450 : 420, { size: tallView ? 64 : 42, style: 'italic', color: MUTED, fit: 1460 })
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
        // a medal for each of the three: gold, silver, bronze, with a crown on the first
        const M = [['#f3d27a', '#b8892a', '#8a6414'], ['#eef2f6', '#aab4bf', '#6f7a86'], ['#e3a574', '#b0693a', '#7a431f']][i], mc = week.ctx
        const gr = mc.createRadialGradient(92, ry - 12, 4, 96, ry, 40); gr.addColorStop(0, M[0]); gr.addColorStop(0.6, M[1]); gr.addColorStop(1, M[2])
        mc.fillStyle = gr; mc.beginPath(); mc.arc(96, ry, 38, 0, 7); mc.fill(); mc.strokeStyle = M[2]; mc.lineWidth = 3; mc.stroke()
        say(mc, String(i + 1), 96, ry + 2, { size: 46, font: SERIF, weight: 700, color: '#2a1d08' })
        if (i === 0) { mc.fillStyle = M[0]; mc.beginPath(); mc.moveTo(66, ry - 46); mc.lineTo(72, ry - 76); mc.lineTo(84, ry - 58); mc.lineTo(96, ry - 80); mc.lineTo(108, ry - 58); mc.lineTo(120, ry - 76); mc.lineTo(126, ry - 46); mc.closePath(); mc.fill() }
        const tint = r.you ? GOLD : i === 0 ? '#f6e3a8' : i === 1 ? '#e6ebf0' : '#efc8a6'
        say(week.ctx, (r.you ? 'You' : (r.name || 'someone')).slice(0, 16), 160, ry, { size: 68, color: tint, align: 'left', fit: 470 })
        say(week.ctx, ms(r.score), 960, ry, { size: 60, font: SANS, weight: 300, color: tint, align: 'right' })
      })
    }
    week.done()
    drawWanted()
  }
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th')
  drawBoard()
  boardReady = true
  placeHud()

  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -WATER_Y), hit = new THREE.Vector3(), ndc = new THREE.Vector2()
  // `lift`: pixels above the finger. On a phone the duck rides just above your thumb, where you can see it
  function pointerOnWater(lift) {
    const p = p0.input.pointer
    ndc.set((p.x / p0.width) * 2 - 1, -((p.y - (lift || 0)) / p0.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    return ray.ray.intersectPlane(plane, hit) ? hit : null
  }
  const sounds = { play(name, o) { if (!st.soundOn) return; try { return p0.sound.play('assets/' + name + '.wav', o || {}) } catch (e) { return null } } }
  // the bubbles' loop runs only while the duck is held: stopped on release, and again every frame it is not held, whatever form
  // the city's handle takes (an id, 0, or a promise of one), so it can never run on after a round
  let bubbleLoop = null
  function startBubbles() { stopBubbles(); const r = sounds.play('bubbles', { volume: 0.25, loop: true }); if (r == null) return; bubbleLoop = r; if (typeof r.then === 'function') r.then(id => { if (bubbleLoop === r) bubbleLoop = id; else { try { p0.sound.stop(id) } catch (e) { } } }) }
  function stopBubbles() { const b = bubbleLoop; bubbleLoop = null; if (b == null) return; if (typeof b.then === 'function') b.then(id => { try { p0.sound.stop(id) } catch (e) { } }); else { try { p0.sound.stop(b) } catch (e) { } } }

  function grab() {
    if (st.phase !== 'ready' && st.phase !== 'shown') return
    const h = pointerOnWater(); if (!h) return
    const dx = h.x - st.x, dz = h.z - st.z
    if (Math.hypot(dx, dz) > 1.1 * S) return           // you have to press on the duck
    st.held = true; st.phase = 'held'; st.holdFor = 0; st.result = null; st.hand.set(h.x, h.z); st.y = -0.2 * S; st.vy = 0
    st.lift = 0; st.liftTo = tallView ? Math.min(90, p0.height * 0.12) : 0
    bubbles.visible = true; for (let i = 0; i < NB; i++) bLife[i] = -Math.random() * 1.5
    sounds.play('plunge', { volume: 0.7 }); startBubbles()
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
    stopBubbles()
    bubbles.visible = false
    sounds.play('squeak', { volume: 0.8, rate: 0.9 + Math.random() * 0.2 })
    try { p0.score(t) } catch (e) { }
    if (t >= 10000) give(BADGE.under)
    st.shownFor = 0; drawBoard()
  }
  const DEBUG = false
  p0.on('pointerdown', e => { st.soundOn = true; if (canChallenge && st.result && st.phase !== 'held' && onChallenge()) { challenge(); return } if (DEBUG) { const p = p0.input.pointer; const v = new THREE.Vector3(st.x, WATER_Y, st.z).project(camera); p0.log('pointer', JSON.stringify({ p, e, w: p0.width, h: p0.height, duck: [(v.x + 1) / 2, (1 - v.y) / 2] })) } grab() })
  p0.on('pointerup', () => { if (st.phase === 'held') release('letgo') })
  p0.on('keydown', e => { st.soundOn = true; if (e && (e.code === 'KeyR' || e.code === 'Space')) { if (st.phase === 'shown' || st.phase === 'flying') { st.phase = 'ready'; st.result = null; drawBoard() } } })
  // the city's How to play box is plain text at a width we don't set: every line short enough that it never wraps to leave one word alone
  p0.hud('THE DUCK\nPress on the duck and keep pressing.\nIt fights. The gold ring is your grip.\nLet go when you have to.\nYour time goes on the wall. R starts over.')

  /* ---- the loop ---- */
  let splashT = 9
  p0.loop((dt, time) => {
    if (tallView) placeHud()
    if (bubbleLoop != null && st.phase !== 'held') stopBubbles()
    dt = Math.min(dt, 0.05)
    waterUniforms.uTime.value = time
    st.noiseA += dt * 1.7; st.noiseB += dt * 2.3
    const depth = Math.max(0, -st.y / S)             // 0 at rest, grows as it goes under (in duck-metres)

    if (st.phase === 'held') {
      st.holdFor += dt
      if (st.holdFor >= st.nextBell) { st.flash = 0.6; st.nextBell += 5; drawBoard() }
      // on a phone the duck glides up out from under your thumb as you press, and rides there
      if (st.lift < st.liftTo) {
        const a = pointerOnWater(st.lift); const ax = a ? a.x : 0, az = a ? a.z : 0
        const next = Math.min(st.liftTo, st.lift + dt * st.liftTo / 0.25)
        const b = pointerOnWater(next)
        if (a && b && Math.hypot(st.x + b.x - ax, st.z + b.z - az) < R - 0.9 * S) { st.x += b.x - ax; st.z += b.z - az; st.lift = next } else st.liftTo = st.lift
      }
      const h = pointerOnWater(st.lift); if (h) st.hand.set(h.x, h.z)
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
        splashT = 0; sounds.play('splash', { volume: 0.6 }); setTimeout(() => sounds.play('quack' + (1 + Math.floor(Math.random() * 3)), { volume: 0.75, rate: 0.95 + Math.random() * 0.1 }), 160);
        // a real mallard's quack as it breaks the surface (this comment once sat mid-line and switched off the end of the round)
        waterUniforms.uSplashAt.value.set(st.x, -st.z); st.phase = 'shown'; st.shownFor = 0; drawBoard()
        if (st.result && st.result.newBest) { burst(); st.spin = 1.4 }
      }
      st.x += (Math.sin(st.noiseA * 0.3) * 0.08 * S - st.x * 0.05) * dt; st.z += (Math.cos(st.noiseB * 0.3) * 0.08 * S - st.z * 0.05) * dt
      st.wobble = Math.max(0, st.wobble - dt * 2)
      // a safety net: if the splash never comes, the round still ends, so a press can start the next one (a phone has no R)
      if (st.phase === 'flying') { st.shownFor += dt; if (st.shownFor > 5) { st.phase = 'shown'; st.shownFor = 0; drawBoard() } }
      if (st.phase === 'shown') { st.shownFor += dt; if (st.shownFor > 14) { st.phase = 'ready'; st.result = null; drawBoard() } }
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
