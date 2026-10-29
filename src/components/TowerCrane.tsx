import type { CSSProperties } from 'react'
import { STEPS, towerCrane } from '../lib/towerCrane.ts'

const PAD = 6
const { width, height, layers } = towerCrane

/** Width / height of the rendered drawing, including padding. */
export const TOWER_CRANE_ASPECT = (width + PAD * 2) / (height + PAD)

// Depth cueing: nearer lines are slightly heavier and darker, farther ones
// thinner and lighter, interpolated evenly across the depth steps.
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const weight = (i: number) => lerp(0.8, 1.15, i / (STEPS - 1))
const ink = (i: number) => lerp(0.62, 1, i / (STEPS - 1))

interface TowerCraneProps {
  className?: string
  style?: CSSProperties
}

/**
 * Detailed line drawing of a tower crane; the bottom edge is the ground.
 * Layers are drawn far → near. Each nearer layer first lays down a halo in the
 * background color along its main members, breaking the lines behind it.
 */
export function TowerCrane({ className, style }: TowerCraneProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox={`${-PAD} ${-PAD} ${width + PAD * 2} ${height + PAD}`}
      role="img"
      aria-label="A detailed line drawing of a tower crane"
    >
      <g fill="none" strokeLinejoin="round">
        {layers.map(({ step, paths }) => {
          const k = weight(step)
          return (
            <g key={step}>
              {step >= STEPS / 2 && (
                <path
                  d={paths.chords}
                  className="tower-crane__halo"
                  strokeWidth={2.4 * k}
                  strokeLinecap="butt"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <g stroke="currentColor" strokeOpacity={ink(step)} strokeLinecap="round">
                <path d={paths.ground} strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                <path d={paths.detail} strokeWidth={0.35 * k} vectorEffect="non-scaling-stroke" />
                <path d={paths.lacing} strokeWidth={0.55 * k} vectorEffect="non-scaling-stroke" />
                <path d={paths.cables} strokeWidth={0.6 * k} vectorEffect="non-scaling-stroke" />
                <path d={paths.chords} strokeWidth={1.1 * k} vectorEffect="non-scaling-stroke" />
              </g>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
