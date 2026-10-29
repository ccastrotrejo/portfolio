import { MAT_MAJOR, MAT_MINOR, useMatField } from '../hooks/useMatField.ts'

interface CuttingMatProps {
  /** Show the vertical maker's caption along the left edge. */
  caption?: boolean
}

/** Full-viewport grayscale cutting mat: grid, framed field, rulers, grain. */
export function CuttingMat({ caption = true }: CuttingMatProps) {
  const { w, h, fw, fh, x0, y0, x1, y1 } = useMatField()

  let minor = ''
  let major = ''
  for (let x = x0 + MAT_MINOR; x < x1; x += MAT_MINOR) {
    const seg = `M${x} ${y0}V${y1}`
    if ((x - x0) % MAT_MAJOR === 0) major += seg
    else minor += seg
  }
  for (let y = y1 - MAT_MINOR; y > y0; y -= MAT_MINOR) {
    const seg = `M${x0} ${y}H${x1}`
    if ((y1 - y) % MAT_MAJOR === 0) major += seg
    else minor += seg
  }

  let ticks = ''
  const labels: { x: number; y: number; n: number; axis: 'x' | 'y' }[] = []
  const half = MAT_MINOR / 2
  const tick = (d: number) => (d % MAT_MAJOR === 0 ? 10 : d % MAT_MINOR === 0 ? 6 : 3)
  for (let d = 0; d <= fw; d += half) {
    ticks += `M${x0 + d} ${y0}v${-tick(d)}M${x0 + d} ${y1}v${tick(d)}`
    if (d % MAT_MAJOR === 0 && d > 0) labels.push({ x: x0 + d, y: y0 - 16, n: d / MAT_MAJOR, axis: 'x' })
  }
  for (let d = 0; d <= fh; d += half) {
    ticks += `M${x0} ${y1 - d}h${-tick(d)}M${x1} ${y1 - d}h${tick(d)}`
    if (d % MAT_MAJOR === 0 && d > 0) labels.push({ x: x0 - 18, y: y1 - d, n: d / MAT_MAJOR, axis: 'y' })
  }

  return (
    <svg className="mat" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <filter id="mat-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <g fill="none" stroke="currentColor" shapeRendering="crispEdges">
        <path d={minor} className="mat__minor" />
        <path d={major} className="mat__major" />
        <rect x={x0} y={y0} width={fw} height={fh} className="mat__frame" />
        <path d={ticks} className="mat__tick" />
      </g>

      <g className="mat__label">
        {labels.map((l) => (
          <text key={`${l.axis}${l.n}`} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle">
            {l.n}
          </text>
        ))}
        {caption && (
          <text
            x={x0 + 14}
          y={y0 + 14}
            transform={`rotate(90 ${x0 + 14} ${y0 + 14})`}
            dominantBaseline="middle"
          >
            SELF-HEALING CUTTING MAT · GRID 1:5 · REV. 0
          </text>
        )}
      </g>

      <rect width={w} height={h} filter="url(#mat-grain)" className="mat__grain" />
    </svg>
  )
}
