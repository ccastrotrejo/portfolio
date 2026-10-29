/**
 * Original wireframe model of a luffing-jib tower crane, projected once at
 * module load into SVG path strings. Units are roughly metres; y is up.
 */
type V = [number, number, number]
type Seg = [V, V]

const chords: Seg[] = []
const lacing: Seg[] = []
const cables: Seg[] = []
const detail: Seg[] = []

const add = (arr: Seg[], a: V, b: V) => arr.push([a, b])

const lerp = (a: V, b: V, t: number): V => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
/** A rope between two points, sagging under its own weight (shallow parabola). */
const rope = (a: V, end: V, sagRatio = 0.006, n = 10, gap = 0) => {
  const full = Math.hypot(end[0] - a[0], end[1] - a[1], end[2] - a[2])
  const b = lerp(a, end, 1 - gap / full)
  const span = full - gap
  const sag = span * sagRatio
  let prev = a
  for (let i = 1; i <= n; i++) {
    const t = i / n
    const p = lerp(a, b, t)
    const q: V = [p[0], p[1] - 4 * sag * t * (1 - t), p[2]]
    add(cables, prev, q)
    prev = q
  }
}

const plus = (p: V, ...vs: [V, number][]): V =>
  vs.reduce<V>((acc, [v, k]) => [acc[0] + v[0] * k, acc[1] + v[1] * k, acc[2] + v[2] * k], p)

/* Camera, shared by face culling below and the projection at the bottom. */
const YAW = (34 * Math.PI) / 180
const PITCH = 0
const EYE = 1.7
const DIST = 66
const CAM: V = [-DIST * Math.sin(YAW), EYE, -DIST * Math.cos(YAW)]

type Face = 'left' | 'right' | 'bottom' | 'top' | 'back' | 'front'

/**
 * A closed solid drawn with hidden lines removed: only edges of faces turned
 * toward the camera. Lattice stays see-through (box); plate and casting don't.
 */
function solidBox(
  arr: Seg[],
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  hide: Face[] = [],
) {
  const c = (i: number): V => [i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0]
  const mid: V = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]
  const faces: [Face, V, number[]][] = [
    ['left', [-1, 0, 0], [0, 2, 6, 4]],
    ['right', [1, 0, 0], [1, 3, 7, 5]],
    ['bottom', [0, -1, 0], [0, 1, 5, 4]],
    ['top', [0, 1, 0], [2, 3, 7, 6]],
    ['back', [0, 0, -1], [0, 1, 3, 2]],
    ['front', [0, 0, 1], [4, 5, 7, 6]],
  ]
  const seen = new Set<string>()
  for (const [name, n, idx] of faces) {
    if (hide.includes(name)) continue
    const facing = n[0] * (CAM[0] - mid[0]) + n[1] * (CAM[1] - mid[1]) + n[2] * (CAM[2] - mid[2])
    if (facing <= 0) continue
    for (let k = 0; k < 4; k++) {
      const a = idx[k]
      const b = idx[(k + 1) % 4]
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (seen.has(key)) continue
      seen.add(key)
      add(arr, c(a), c(b))
    }
  }
}

function box(arr: Seg[], x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  const c = (x: number, y: number, z: number): V => [x, y, z]
  for (const y of [y0, y1]) {
    add(arr, c(x0, y, z0), c(x1, y, z0))
    add(arr, c(x1, y, z0), c(x1, y, z1))
    add(arr, c(x1, y, z1), c(x0, y, z1))
    add(arr, c(x0, y, z1), c(x0, y, z0))
  }
  for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) add(arr, c(x, y0, z), c(x, y1, z))
}

function ring(arr: Seg[], cx: number, y: number, cz: number, r: number, n = 28) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(arr, [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r], [cx + Math.cos(b) * r, y, cz + Math.sin(b) * r])
  }
}

/* ---------- Foundation ---------- */
solidBox(chords, -2.8, 2.8, -1.2, 0, -2.8, 2.8)
for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
  box(detail, x * 1.2 - 0.3, x * 1.2 + 0.3, 0, 0.25, z * 1.2 - 0.3, z * 1.2 + 0.3)
}

/* ---------- Ground ---------- */
const ground: Seg[] = []
// Contact shadow cast away from a light at upper left: short hatching beside the footing.
for (let z = -2.6; z <= 2.6; z += 0.4) add(ground, [2.9, -1.2, z], [2.9 + 1.6 - Math.abs(z) * 0.35, -1.2, z - 0.5])
add(ground, [-3.4, -1.2, 2.8], [4.2, -1.2, 2.8])

/* ---------- Mast ---------- */
const S = 1.2
const PANEL = 2
const PANELS = 20
const TOP = PANEL * PANELS
const corner = (i: number, y: number, inset = 0): V => {
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]][i % 4]
  return [c[0] * (S - inset), y, c[1] * (S - inset)]
}

for (let i = 0; i < 4; i++) {
  add(chords, corner(i, 0), corner(i, TOP))
  // Second edge of the angle-steel chord
  add(detail, corner(i, 0, 0.14), corner(i, TOP, 0.14))
}
for (let k = 0; k <= PANELS; k++) {
  const y = k * PANEL
  const joint = k % 3 === 0
  for (let i = 0; i < 4; i++) {
    add(joint ? chords : lacing, corner(i, y), corner(i + 1, y))
    if (joint && k > 0 && k < PANELS) add(detail, corner(i, y + 0.18), corner(i + 1, y + 0.18))
  }
}
for (let k = 0; k < PANELS; k++) {
  const y0 = k * PANEL
  const y1 = y0 + PANEL
  for (let f = 0; f < 4; f++) {
    if ((k + f) % 2 === 0) add(lacing, corner(f, y0), corner(f + 1, y1))
    else add(lacing, corner(f + 1, y0), corner(f, y1))
  }
}

// Rest platforms with grating
for (const k of [6, 12, 18]) {
  const y = k * PANEL + 0.05
  for (let g = -S + 0.3; g < S; g += 0.3) add(detail, [g, y, -S], [g, y, S - 0.9])
}

// Ladder with safety cage
for (const x of [-0.3, 0.3]) add(lacing, [x, 0, 0.75], [x, TOP, 0.75])
for (let y = 0.3; y < TOP; y += 0.3) add(detail, [-0.3, y, 0.75], [0.3, y, 0.75])
const hoop = (y: number) => {
  const n = 10
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (i / n)
    const b = Math.PI * ((i + 1) / n)
    add(detail, [-Math.cos(a) * 0.38, y, 0.75 - Math.sin(a) * 0.55], [-Math.cos(b) * 0.38, y, 0.75 - Math.sin(b) * 0.55])
  }
}
for (let y = 2.4; y < TOP; y += 1.2) hoop(y)
for (const a of [0.25, 0.5, 0.75].map((t) => Math.PI * t)) {
  add(detail, [-Math.cos(a) * 0.38, 2.4, 0.75 - Math.sin(a) * 0.55], [-Math.cos(a) * 0.38, TOP, 0.75 - Math.sin(a) * 0.55])
}

/* ---------- Slewing unit ---------- */
ring(chords, 0, TOP, 0, 1.6)
ring(chords, 0, TOP + 0.4, 0, 1.6)
for (let i = 0; i < 48; i++) {
  const a = (i / 48) * Math.PI * 2
  const r0 = 1.6
  const r1 = 1.72
  add(detail, [Math.cos(a) * r0, TOP + 0.1, Math.sin(a) * r0], [Math.cos(a) * r1, TOP + 0.1, Math.sin(a) * r1])
  add(detail, [Math.cos(a) * r1, TOP + 0.1, Math.sin(a) * r1], [Math.cos(a) * r1, TOP + 0.3, Math.sin(a) * r1])
}
const PLAT = TOP + 2.4
solidBox(chords, -1.3, 1.3, TOP + 0.4, PLAT, -1.3, 1.3)
for (let x = -0.9; x < 1.3; x += 0.4) add(detail, [x, TOP + 0.6, -1.3], [x, PLAT - 0.2, -1.3])

/* ---------- Operator cab ---------- */
const CAB = { x0: 1.3, x1: 2.9, y0: TOP + 0.6, y1: TOP + 2.6, z0: 0.1, z1: 1.7 }
solidBox(chords, CAB.x0, CAB.x1, CAB.y0, CAB.y1, CAB.z0, CAB.z1)
solidBox(lacing, CAB.x0 - 0.05, CAB.x1 + 0.1, CAB.y1, CAB.y1 + 0.15, CAB.z0 - 0.1, CAB.z1 + 0.05, ['bottom'])
{
  // Glazing with a mullion and a single glare stroke, on the visible face
  const wy0 = CAB.y0 + 0.45
  const wy1 = CAB.y1 - 0.2
  const fx0 = CAB.x0 + 0.15
  const fx1 = CAB.x1 - 0.15
  const fz = CAB.z0
  add(lacing, [fx0, wy0, fz], [fx1, wy0, fz])
  add(lacing, [fx1, wy0, fz], [fx1, wy1, fz])
  add(lacing, [fx1, wy1, fz], [fx0, wy1, fz])
  add(lacing, [fx0, wy1, fz], [fx0, wy0, fz])
  add(detail, [(fx0 + fx1) / 2, wy0, fz], [(fx0 + fx1) / 2, wy1, fz])
  add(detail, [fx0 + 0.15, wy1 - 0.15, fz], [fx0 + 0.45, wy1 - 0.55, fz])
}

/* ---------- Tower head (A-frame) ---------- */
const PEAK: V = [0, PLAT + 9, 0]
const headBase = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => [x, PLAT, z] as V)
headBase.forEach((b) => add(chords, b, PEAK))
for (let l = 1; l < 5; l++) {
  const t = l / 5
  for (let i = 0; i < 4; i++) {
    const a = lerp(headBase[i], PEAK, t)
    const b = lerp(headBase[(i + 1) % 4], PEAK, t)
    add(lacing, a, b)
    const a0 = lerp(headBase[i], PEAK, t - 0.2)
    add(lacing, a0, (l + i) % 2 ? b : a)
  }
}
// Head sheaves and aircraft warning light
for (const z of [-0.25, 0.25]) {
  const n = 14
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(chords, [Math.cos(a) * 0.4, PEAK[1] + 0.2 + Math.sin(a) * 0.4, z], [Math.cos(b) * 0.4, PEAK[1] + 0.2 + Math.sin(b) * 0.4, z])
  }
}
add(lacing, [0, PEAK[1] + 0.6, 0], [0, PEAK[1] + 1.3, 0])
ring(lacing, 0, PEAK[1] + 1.4, 0, 0.12, 10)
ring(detail, 0, PEAK[1] + 1.55, 0, 0.12, 10)

/* ---------- Platform handrail ---------- */
for (const [ax, az, bx, bz] of [[-1.3, -1.3, 1.3, -1.3], [1.3, -1.3, 1.3, 1.3], [1.3, 1.3, -1.3, 1.3]]) {
  add(lacing, [ax, PLAT + 1.0, az], [bx, PLAT + 1.0, bz])
  add(detail, [ax, PLAT + 0.5, az], [bx, PLAT + 0.5, bz])
  add(detail, [ax, PLAT, az], [ax, PLAT + 1.0, az])
}

/* ---------- Luffing jib ---------- */
const THETA = (34 * Math.PI) / 180
const ROOT: V = [-1.3, PLAT, 0]
const U: V = [-Math.cos(THETA), Math.sin(THETA), 0]
const W: V = [Math.sin(THETA), Math.cos(THETA), 0]
const LAT: V = [0, 0, 1]
const LEN = 30
const JP = 20

const section = (t: number) => {
  const r = t / LEN
  const grow = Math.min(1, t / 3)
  const b = (1.7 - 1.0 * r) * (0.4 + 0.6 * grow)
  const h = (1.7 - 1.2 * r) * grow
  const c = plus(ROOT, [U, t])
  return {
    L: plus(c, [LAT, -b / 2]),
    R: plus(c, [LAT, b / 2]),
    T: plus(c, [W, h]),
  }
}

const jib = Array.from({ length: JP + 1 }, (_, k) => section((k / JP) * LEN))
for (let k = 0; k < JP; k++) {
  const a = jib[k]
  const b = jib[k + 1]
  add(chords, a.L, b.L)
  add(chords, a.R, b.R)
  add(chords, a.T, b.T)
  add(lacing, a.L, a.R)
  add(lacing, a.L, a.T)
  add(lacing, a.R, a.T)
  if (k % 2 === 0) {
    add(lacing, a.L, b.R)
    add(lacing, a.L, b.T)
    add(lacing, a.R, b.T)
  } else {
    add(lacing, a.R, b.L)
    add(lacing, a.T, b.L)
    add(lacing, a.T, b.R)
  }
  // Section joints every 5 panels
  if (k % 5 === 0 && k > 0) {
    const j = section((k / JP) * LEN + 0.2)
    add(detail, j.L, j.R)
    add(detail, j.L, j.T)
    add(detail, j.R, j.T)
  }
}
const tip = jib[JP]
add(lacing, tip.L, tip.R)
add(lacing, tip.L, tip.T)
add(lacing, tip.R, tip.T)

// Foot pins
for (const z of [-0.35, 0.35]) {
  const n = 10
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(detail, [ROOT[0] + Math.cos(a) * 0.18, ROOT[1] + Math.sin(a) * 0.18, z], [ROOT[0] + Math.cos(b) * 0.18, ROOT[1] + Math.sin(b) * 0.18, z])
  }
}

// Jib-head sheave. Only the near one is drawn: the far sheave sits directly
// behind it, and drawing both reads as two overlapping coins.
const TIP = plus(ROOT, [U, LEN + 0.45], [W, 0.15])
const SHEAVE_R = 0.42
{
  const z = -0.3
  const n = 20
  const p = (ang: number, r: number) => plus(TIP, [U, Math.cos(ang) * r], [W, Math.sin(ang) * r], [LAT, z])
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(lacing, p(a, SHEAVE_R), p(b, SHEAVE_R))
    add(detail, p(a, SHEAVE_R - 0.08), p(b, SHEAVE_R - 0.08))
    add(detail, p(a, 0.09), p(b, 0.09))
  }
}
add(lacing, tip.L, plus(TIP, [LAT, -0.3]))
add(lacing, tip.T, plus(TIP, [W, SHEAVE_R]))

/* ---------- Counter-jib ---------- */
const CJ = 12
for (const z of [-0.9, 0.9]) {
  add(chords, [1.3, PLAT, z], [CJ, PLAT, z])
  add(lacing, [1.3, PLAT + 1.1, z], [CJ, PLAT + 1.1, z])
  add(detail, [1.3, PLAT + 0.55, z], [CJ, PLAT + 0.55, z])
  add(chords, [1.3, PLAT - 0.6, z * 0.7], [CJ - 1, PLAT - 0.6, z * 0.7])
}
for (let x = 1.3; x <= CJ + 0.01; x += 1.0) {
  add(lacing, [x, PLAT, -0.9], [x, PLAT, 0.9])
  add(lacing, [x, PLAT, 0.9], [x, PLAT + 1.1, 0.9])
  add(lacing, [x, PLAT, -0.9], [x, PLAT + 1.1, -0.9])
  if (x + 1 <= CJ - 0.99) {
    add(lacing, [x, PLAT, 0.9], [x + 1, PLAT - 0.6, 0.63])
    add(lacing, [x, PLAT, -0.9], [x + 1, PLAT - 0.6, -0.63])
  }
}
for (let x = 1.55; x < CJ; x += 0.5) add(detail, [x, PLAT + 0.02, -0.9], [x, PLAT + 0.02, 0.9])

// Hoist winch: drum, motor, gearbox
{
  const cx = 4.3
  const cy = PLAT + 0.7
  const r = 0.55
  const zs = [-0.75, 0.25]
  const n = 18
  for (const z of zs) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const b = ((i + 1) / n) * Math.PI * 2
      add(chords, [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], [cx + Math.cos(b) * r, cy + Math.sin(b) * r, z])
      add(detail, [cx + Math.cos(a) * (r + 0.12), cy + Math.sin(a) * (r + 0.12), z], [cx + Math.cos(b) * (r + 0.12), cy + Math.sin(b) * (r + 0.12), z])
    }
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    add(i % 2 ? detail : lacing, [cx + Math.cos(a) * r, cy + Math.sin(a) * r, zs[0]], [cx + Math.cos(a) * r, cy + Math.sin(a) * r, zs[1]])
  }
  for (let z = zs[0] + 0.1; z < zs[1]; z += 0.1) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const b = ((i + 1) / n) * Math.PI * 2
      if (Math.sin(a) < 0.2) continue
      add(detail, [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], [cx + Math.cos(b) * r, cy + Math.sin(b) * r, z + 0.1 / n])
    }
  }
  solidBox(chords, cx - 0.5, cx + 0.5, PLAT + 0.2, PLAT + 1.1, 0.35, 0.85)
  for (let x = cx - 0.4; x < cx + 0.5; x += 0.1) add(detail, [x, PLAT + 0.3, 0.35], [x, PLAT + 1.0, 0.35])
  // Hoist rope leaves the drum toward the tower head
  rope([cx - r * 0.6, cy + r * 0.8, -0.25], [0.1, PEAK[1] + 0.2, -0.05], 0.01)
}

// Electrical cabinet
solidBox(chords, 6.1, 7.1, PLAT, PLAT + 1.6, -0.85, -0.25)
add(lacing, [6.6, PLAT + 0.05, -0.85], [6.6, PLAT + 1.55, -0.85])
for (let y = PLAT + 1.2; y < PLAT + 1.5; y += 0.08) add(detail, [6.2, y, -0.85], [6.5, y, -0.85])
add(detail, [6.5, PLAT + 0.8, -0.85], [6.5, PLAT + 0.95, -0.85])

/* ---------- Counterweight stack ---------- */
const CW0 = 9
const CW1 = 11.6
const SLAB = 0.75
for (let i = 0; i < 5; i++) {
  const y1 = PLAT - 0.6 - i * SLAB
  const y0 = y1 - SLAB + 0.06
  solidBox(i === 0 || i === 4 ? chords : lacing, CW0, CW1, y0, y1, -1.1, 1.1, i < 4 ? ['bottom'] : [])
  for (const x of [CW0 + 0.6, CW1 - 0.6]) add(detail, [x, y0 + 0.15, -1.1], [x, y1 - 0.15, -1.1])
}
for (const x of [CW0 + 0.3, CW1 - 0.3]) {
  add(chords, [x, PLAT - 0.6, 0], [x, PLAT, 0.6])
  add(chords, [x, PLAT - 0.6, 0], [x, PLAT, -0.6])
}

/* ---------- Luffing ropes, pendants, backstays ---------- */
const PEND_A = jib[13].T
const PEND_B = jib[JP].T
const SPREADER = lerp(PEAK, PEND_A, 0.22)
solidBox(lacing, SPREADER[0] - 0.25, SPREADER[0] + 0.25, SPREADER[1] - 0.2, SPREADER[1] + 0.2, -0.4, 0.4)
for (const dz of [-0.24, -0.08, 0.08, 0.24]) rope(plus(PEAK, [LAT, dz]), plus(SPREADER, [LAT, dz]), 0.004)
for (const dz of [-0.14, 0.14]) {
  rope(plus(SPREADER, [LAT, dz]), plus(PEND_A, [LAT, dz]))
  rope(plus(SPREADER, [LAT, dz]), plus(PEND_B, [LAT, dz]), 0.006, 10, 0.5)
  rope(plus(PEAK, [LAT, dz]), [CJ, PLAT + 1.1, dz * 6], 0.008)
}
rope([0, PEAK[1] + 0.2, 0], plus(TIP, [W, SHEAVE_R]), 0.012, 10, 0.35)

/* ---------- Hook block ---------- */
const HOOK_Y = 44
const hookX = TIP[0]
// Two falls, spaced so they read as reeved rope rather than one heavy bar.
for (const dx of [-SHEAVE_R + 0.06, SHEAVE_R - 0.06]) {
  add(cables, [TIP[0] + dx, TIP[1], -0.3], [hookX + dx * 0.55, HOOK_Y + 1.8, -0.3])
}
{
  // Small parts stay fine-lined however near they are, so the eye goes to the structure.
  const bx0 = hookX - 0.45
  const bx1 = hookX + 0.45
  solidBox(lacing, bx0, bx1, HOOK_Y, HOOK_Y + 1.6, -0.32, 0.32)
  solidBox(lacing, bx0 - 0.05, bx1 + 0.05, HOOK_Y + 1.6, HOOK_Y + 1.8, -0.36, 0.36)
  const cy = HOOK_Y + 0.95
  const n = 16
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(detail, [hookX + Math.cos(a) * 0.3, cy + Math.sin(a) * 0.3, -0.32], [hookX + Math.cos(b) * 0.3, cy + Math.sin(b) * 0.3, -0.32])
    add(detail, [hookX + Math.cos(a) * 0.08, cy + Math.sin(a) * 0.08, -0.32], [hookX + Math.cos(b) * 0.08, cy + Math.sin(b) * 0.08, -0.32])
  }
  solidBox(detail, hookX - 0.14, hookX + 0.14, HOOK_Y - 0.3, HOOK_Y, -0.14, 0.14)
}
{
  // Hook: tapered bowl (thick at the back, thin at the point) with a safety latch
  const cx = hookX - 0.26
  const cy = HOOK_Y - 1.05
  const SWEEP = (215 * Math.PI) / 180
  const outer: V[] = []
  const inner: V[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const a = -t * SWEEP
    const thick = 0.24 * (1 - 0.75 * t)
    outer.push([cx + Math.cos(a) * (0.22 + thick), cy + Math.sin(a) * (0.22 + thick), 0])
    inner.push([cx + Math.cos(a) * 0.22, cy + Math.sin(a) * 0.22, 0])
  }
  for (let i = 0; i < outer.length - 1; i++) {
    add(lacing, outer[i], outer[i + 1])
    add(detail, inner[i], inner[i + 1])
  }
  add(lacing, [hookX + 0.1, HOOK_Y - 0.3, 0], outer[0])
  add(detail, [hookX - 0.04, HOOK_Y - 0.3, 0], inner[0])
  add(lacing, outer[outer.length - 1], inner[inner.length - 1])
  add(detail, [hookX - 0.04, HOOK_Y - 0.5, 0], inner[inner.length - 1])
}

/* ---------- Projection ----------
 * Two-point perspective with corrected verticals (the shift-lens convention of
 * architectural illustration): horizontals recede to vanishing points, but
 * plumb lines stay plumb so the hoist rope reads as hanging under gravity.
 */

type Cam = { x: number; y: number; depth: number }

const camera = ([x, y, z]: V): Cam => {
  const xr = x * Math.cos(YAW) - z * Math.sin(YAW)
  const zr = x * Math.sin(YAW) + z * Math.cos(YAW) + DIST
  const yc = y - EYE
  const yp = yc * Math.cos(PITCH) - zr * Math.sin(PITCH)
  const depth = yc * Math.sin(PITCH) + zr * Math.cos(PITCH)
  return { x: (xr / depth) * 100, y: (-yp / depth) * 100, depth }
}

type Kind = 'chords' | 'lacing' | 'cables' | 'detail' | 'ground'
const groups: [Kind, Seg[]][] = [
  ['chords', chords],
  ['lacing', lacing],
  ['cables', cables],
  ['detail', detail],
  ['ground', ground],
]

const projected = groups.flatMap(([kind, segs]) =>
  segs.map(([a, b]) => {
    const pa = camera(a)
    const pb = camera(b)
    return { kind, pa, pb, depth: (pa.depth + pb.depth) / 2 }
  }),
)

const pts = projected.flatMap((s) => [s.pa, s.pb])
const minX = Math.min(...pts.map((p) => p.x))
const maxX = Math.max(...pts.map((p) => p.x))
const minY = Math.min(...pts.map((p) => p.y))
const maxY = Math.max(...pts.map((p) => p.y))
const VB_H = 600
const scale = VB_H / (maxY - minY)
const VB_W = Math.ceil((maxX - minX) * scale)

// Depth steps for atmospheric perspective: 0 = farthest, STEPS - 1 = nearest.
// Many small steps read as a continuous fade instead of visible jumps.
export const STEPS = 8
const structDepths = projected.filter((s) => s.kind !== 'ground').map((s) => s.depth)
const nearD = Math.min(...structDepths)
const farD = Math.max(...structDepths)
const step = (d: number) => {
  const t = (farD - d) / (farD - nearD)
  return Math.min(STEPS - 1, Math.max(0, Math.floor(t * STEPS)))
}

const f = (n: number) => n.toFixed(1)
const seg = (a: Cam, b: Cam) =>
  `M${f((a.x - minX) * scale)} ${f((a.y - minY) * scale)}L${f((b.x - minX) * scale)} ${f((b.y - minY) * scale)}`

const kinds: Kind[] = ['ground', 'detail', 'lacing', 'cables', 'chords']

/** Path data per depth step (far → near) and per line kind. */
const layers = Array.from({ length: STEPS }, (_, i) => {
  const inStep = projected.filter((s) => (s.kind === 'ground' ? i === STEPS - 1 : step(s.depth) === i))
  const paths = Object.fromEntries(
    kinds.map((k) => [
      k,
      inStep
        // Detail reduction: the finest parts on the far side are left out.
        .filter((s) => s.kind === k && !(k === 'detail' && i < 2))
        .map((s) => seg(s.pa, s.pb))
        .join(''),
    ]),
  ) as Record<Kind, string>
  return { step: i, paths }
})

/** Projected crane drawing: viewBox size plus path data layered far → near. */
export const towerCrane = {
  width: VB_W,
  height: VB_H,
  layers,
}
