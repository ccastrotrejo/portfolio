import type { CSSProperties } from 'react'
import { towerCrane } from '../lib/towerCrane.ts'

const PAD = 6
const { width, height, paths } = towerCrane

/** Width / height of the rendered drawing, including padding. */
export const TOWER_CRANE_ASPECT = (width + PAD * 2) / (height + PAD)

interface TowerCraneProps {
  className?: string
  style?: CSSProperties
}

/** Detailed line drawing of a tower crane; the bottom edge is the foundation. */
export function TowerCrane({ className, style }: TowerCraneProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox={`${-PAD} ${-PAD} ${width + PAD * 2} ${height + PAD}`}
      role="img"
      aria-label="A detailed line drawing of a tower crane"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths.detail} strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
        <path d={paths.lacing} strokeWidth="0.55" vectorEffect="non-scaling-stroke" />
        <path d={paths.chords} strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
        <path d={paths.cables} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  )
}
