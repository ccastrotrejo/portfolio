import { CuttingMat } from './components/CuttingMat.tsx'
import { TOWER_CRANE_ASPECT, TowerCrane } from './components/TowerCrane.tsx'
import { useMatField } from './hooks/useMatField.ts'

export function App() {
  const { w, h, fw, fh, x0, x1, y0, y1 } = useMatField()
  const narrow = w < 640
  const left = Math.max(x0 + 40, Math.round(w * 0.08))
  const right = Math.max(w - x1 + 24, Math.round(w * 0.06))

  // On narrow screens the copy sits up top, so the crane gets what's left below it.
  const maxH = narrow ? fh - 360 : fh * 0.92
  const craneW = Math.round(Math.min(maxH * TOWER_CRANE_ASPECT, fw * (narrow ? 0.85 : 0.62)))
  const craneH = Math.round(craneW / TOWER_CRANE_ASPECT)

  return (
    <main className="site">
      <CuttingMat caption={!narrow} />
      <TowerCrane
        className="site__crane"
        style={{ width: craneW, height: craneH, right, bottom: h - y1 }}
      />
      <header className="site__id" style={{ left, top: y0 + 40 }}>
        <p className="site__name">Carlos Castro</p>
        <p className="site__role">Software Engineer</p>
      </header>
      <div
        className="site__copy"
        style={narrow ? { left, right, top: y0 + 112 } : { left, bottom: h - y1 + 96 }}
      >
        <h1 className="site__title">
          We’re working
          <br />
          on it.
        </h1>
        <p className="site__lede">
          A home for my projects, side builds, and experiments is on its way.
        </p>
      </div>
    </main>
  )
}
