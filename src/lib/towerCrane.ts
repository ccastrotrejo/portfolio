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
const plus = (p: V, ...vs: [V, number][]): V =>
  vs.reduce<V>((acc, [v, k]) => [acc[0] + v[0] * k, acc[1] + v[1] * k, acc[2] + v[2] * k], p)

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
box(chords, -2.8, 2.8, -1.2, 0, -2.8, 2.8)
for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
  box(detail, x * 1.2 - 0.3, x * 1.2 + 0.3, 0, 0.25, z * 1.2 - 0.3, z * 1.2 + 0.3)
}

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
box(chords, -1.3, 1.3, TOP + 0.4, PLAT, -1.3, 1.3)
add(lacing, [-1.3, TOP + 0.4, 1.3], [1.3, PLAT, 1.3])
add(lacing, [1.3, TOP + 0.4, -1.3], [1.3, PLAT, 1.3])
add(lacing, [1.3, TOP + 0.4, 1.3], [-1.3, PLAT, 1.3])

/* ---------- Operator cab ---------- */
const CAB = { x0: 1.3, x1: 2.9, y0: TOP + 0.6, y1: TOP + 2.6, z0: 0.1, z1: 1.7 }
box(chords, CAB.x0, CAB.x1, CAB.y0, CAB.y1, CAB.z0, CAB.z1)
box(lacing, CAB.x0 - 0.05, CAB.x1 + 0.1, CAB.y1, CAB.y1 + 0.15, CAB.z0 - 0.05, CAB.z1 + 0.1)
{
  // Front (z = z1) and side (x = x1) glazing with mullions
  const wy0 = CAB.y0 + 0.45
  const wy1 = CAB.y1 - 0.2
  const fx0 = CAB.x0 + 0.15
  const fx1 = CAB.x1 - 0.15
  const fz = CAB.z1
  add(lacing, [fx0, wy0, fz], [fx1, wy0, fz])
  add(lacing, [fx1, wy0, fz], [fx1, wy1, fz])
  add(lacing, [fx1, wy1, fz], [fx0, wy1, fz])
  add(lacing, [fx0, wy1, fz], [fx0, wy0, fz])
  add(detail, [(fx0 + fx1) / 2, wy0, fz], [(fx0 + fx1) / 2, wy1, fz])
  const sz0 = CAB.z0 + 0.15
  const sz1 = CAB.z1 - 0.15
  const sx = CAB.x1
  add(lacing, [sx, wy0, sz0], [sx, wy0, sz1])
  add(lacing, [sx, wy0, sz1], [sx, wy1, sz1])
  add(lacing, [sx, wy1, sz1], [sx, wy1, sz0])
  add(lacing, [sx, wy1, sz0], [sx, wy0, sz0])
  add(detail, [sx, wy0, (sz0 + sz1) / 2], [sx, wy1, (sz0 + sz1) / 2])
  // Glare strokes
  add(detail, [fx0 + 0.15, wy1 - 0.15, fz], [fx0 + 0.45, wy1 - 0.55, fz])
  add(detail, [sx, wy1 - 0.15, sz0 + 0.15], [sx, wy1 - 0.5, sz0 + 0.5])
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

// Sheaves at the jib head
const TIP = plus(ROOT, [U, LEN + 0.6], [W, 0.2])
for (const z of [-0.35, 0.35]) {
  const n = 16
  const p = (ang: number, r: number) => plus(TIP, [U, Math.cos(ang) * r], [W, Math.sin(ang) * r], [LAT, z])
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(chords, p(a, 0.6), p(b, 0.6))
    add(detail, p(a, 0.15), p(b, 0.15))
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    add(detail, p(a, 0.15), p(a, 0.55))
  }
}
add(lacing, tip.L, plus(TIP, [LAT, -0.35]))
add(lacing, tip.R, plus(TIP, [LAT, 0.35]))
add(lacing, tip.T, plus(TIP, [W, 0.6]))
{
  const light = plus(tip.T, [W, 0.7])
  add(lacing, tip.T, light)
  ring(detail, light[0], light[1] + 0.1, light[2], 0.12, 10)
}

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
  box(chords, cx - 0.5, cx + 0.5, PLAT + 0.2, PLAT + 1.1, 0.35, 0.85)
  for (let x = cx - 0.4; x < cx + 0.5; x += 0.1) add(detail, [x, PLAT + 0.3, 0.85], [x, PLAT + 1.0, 0.85])
  // Hoist rope leaves the drum toward the tower head
  add(cables, [cx - r * 0.6, cy + r * 0.8, -0.25], [0.1, PEAK[1] + 0.2, -0.05])
}

// Electrical cabinet
box(chords, 6.1, 7.1, PLAT, PLAT + 1.6, -0.85, -0.25)
add(lacing, [6.6, PLAT + 0.05, -0.25], [6.6, PLAT + 1.55, -0.25])
for (let y = PLAT + 1.2; y < PLAT + 1.5; y += 0.08) add(detail, [6.2, y, -0.25], [6.5, y, -0.25])
add(detail, [6.5, PLAT + 0.8, -0.25], [6.5, PLAT + 0.95, -0.25])

/* ---------- Counterweight stack ---------- */
const CW0 = 9
const CW1 = 11.6
const SLAB = 0.75
for (let i = 0; i < 5; i++) {
  const y1 = PLAT - 0.6 - i * SLAB
  const y0 = y1 - SLAB + 0.06
  box(i === 0 || i === 4 ? chords : lacing, CW0, CW1, y0, y1, -1.1, 1.1)
  for (const x of [CW0 + 0.6, CW1 - 0.6]) add(detail, [x, y0 + 0.15, 1.1], [x, y1 - 0.15, 1.1])
}
for (const x of [CW0 + 0.3, CW1 - 0.3]) {
  add(chords, [x, PLAT - 0.6, 0], [x, PLAT, 0.6])
  add(chords, [x, PLAT - 0.6, 0], [x, PLAT, -0.6])
}

/* ---------- Luffing ropes, pendants, backstays ---------- */
const PEND_A = jib[13].T
const PEND_B = jib[JP].T
const SPREADER = lerp(PEAK, PEND_A, 0.22)
box(chords, SPREADER[0] - 0.25, SPREADER[0] + 0.25, SPREADER[1] - 0.2, SPREADER[1] + 0.2, -0.4, 0.4)
for (const dz of [-0.24, -0.08, 0.08, 0.24]) add(cables, plus(PEAK, [LAT, dz]), plus(SPREADER, [LAT, dz]))
for (const dz of [-0.14, 0.14]) {
  add(cables, plus(SPREADER, [LAT, dz]), plus(PEND_A, [LAT, dz]))
  add(cables, plus(SPREADER, [LAT, dz]), plus(PEND_B, [LAT, dz]))
  add(cables, plus(PEAK, [LAT, dz]), [CJ, PLAT + 1.1, dz * 6])
}
add(cables, [0, PEAK[1] + 0.2, 0], TIP)

/* ---------- Hook block ---------- */
const HOOK_Y = 44
const hookX = TIP[0]
const hookZ = 0
for (const dz of [-0.27, -0.09, 0.09, 0.27]) {
  add(cables, [hookX + (dz > 0 ? 0.05 : -0.05), TIP[1] - 0.6, hookZ + dz], [hookX, HOOK_Y + 1.7, hookZ + dz])
}
{
  const bx0 = hookX - 0.5
  const bx1 = hookX + 0.5
  box(chords, bx0, bx1, HOOK_Y, HOOK_Y + 1.7, -0.35, 0.35)
  box(lacing, bx0 - 0.05, bx1 + 0.05, HOOK_Y + 1.55, HOOK_Y + 1.8, -0.4, 0.4)
  const cy = HOOK_Y + 1.05
  const n = 16
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const b = ((i + 1) / n) * Math.PI * 2
    add(lacing, [hookX + Math.cos(a) * 0.38, cy + Math.sin(a) * 0.38, 0.35], [hookX + Math.cos(b) * 0.38, cy + Math.sin(b) * 0.38, 0.35])
    add(detail, [hookX + Math.cos(a) * 0.1, cy + Math.sin(a) * 0.1, 0.35], [hookX + Math.cos(b) * 0.1, cy + Math.sin(b) * 0.1, 0.35])
  }
  for (const [dx, dy] of [[-0.35, 0.2], [0.35, 0.2], [-0.35, 1.5], [0.35, 1.5]]) ring(detail, hookX + dx, HOOK_Y + dy, 0.35, 0.05, 6)
  box(chords, hookX - 0.18, hookX + 0.18, HOOK_Y - 0.35, HOOK_Y, -0.18, 0.18)
}
{
  // Hook: shank, bowl, point, and safety latch
  const cx = hookX - 0.32
  const cy = HOOK_Y - 1.2
  const arc = (r: number) => {
    const pts: V[] = []
    for (let i = 0; i <= 20; i++) {
      const a = -(i / 20) * ((205 * Math.PI) / 180)
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0])
    }
    return pts
  }
  const outer = arc(0.52)
  const inner = arc(0.26)
  for (let i = 0; i < outer.length - 1; i++) {
    add(chords, outer[i], outer[i + 1])
    add(lacing, inner[i], inner[i + 1])
  }
  add(chords, [cx + 0.52, HOOK_Y - 0.35, 0], outer[0])
  add(lacing, [cx + 0.26, HOOK_Y - 0.35, 0], inner[0])
  const point: V = [cx - 0.42, cy + 0.42, 0]
  add(chords, outer[outer.length - 1], point)
  add(lacing, inner[inner.length - 1], point)
  add(detail, [cx + 0.26, HOOK_Y - 0.55, 0], plus(point, [[0.06, -0.04, 0], 1]))
}
/* ---------- Projection ---------- */
const YAW = (34 * Math.PI) / 180
const CAM_Y = 6
const DIST = 80

const project = ([x, y, z]: V): [number, number] => {
  const xr = x * Math.cos(YAW) - z * Math.sin(YAW)
  const zr = x * Math.sin(YAW) + z * Math.cos(YAW)
  const depth = zr + DIST
  return [(xr / depth) * 100, (-(y - CAM_Y) / depth) * 100]
}

const all = [...chords, ...lacing, ...cables, ...detail].flatMap(([a, b]) => [project(a), project(b)])
const minX = Math.min(...all.map((p) => p[0]))
const maxX = Math.max(...all.map((p) => p[0]))
const minY = Math.min(...all.map((p) => p[1]))
const maxY = Math.max(...all.map((p) => p[1]))
const VB_H = 600
const scale = VB_H / (maxY - minY)
const VB_W = Math.ceil((maxX - minX) * scale)

const toPath = (segs: Seg[]) =>
  segs
    .map(([a, b]) => {
      const [ax, ay] = project(a)
      const [bx, by] = project(b)
      const f = (n: number) => n.toFixed(1)
      return `M${f((ax - minX) * scale)} ${f((ay - minY) * scale)}L${f((bx - minX) * scale)} ${f((by - minY) * scale)}`
    })
    .join('')

/** Projected crane drawing: viewBox size plus one path per stroke weight. */
export const towerCrane = {
  width: VB_W,
  height: VB_H,
  paths: {
    detail: toPath(detail),
    lacing: toPath(lacing),
    chords: toPath(chords),
    cables: toPath(cables),
  },
}
