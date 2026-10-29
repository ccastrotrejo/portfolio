const zigzag = (
  from: number,
  to: number,
  step: number,
  a: number,
  b: number,
  axis: 'x' | 'y',
) => {
  const points: string[] = []
  const dir = to > from ? 1 : -1
  for (let i = 0, p = from; dir * (to - p) >= 0; i++, p += dir * step) {
    const q = i % 2 === 0 ? a : b
    points.push(axis === 'x' ? `${p},${q}` : `${q},${p}`)
  }
  return points.join(' ')
}

/** Line-art tower crane lowering a block onto an unfinished floor. */
export function Crane() {
  return (
    <svg
      className="crane"
      viewBox="0 0 260 200"
      role="img"
      aria-label="A tower crane lowering a block onto a building under construction"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <line x1="4" y1="196" x2="256" y2="196" />

        {/* Mast */}
        <line x1="56" y1="44" x2="56" y2="196" />
        <line x1="68" y1="44" x2="68" y2="196" />
        <polyline points={zigzag(196, 44, 19, 56, 68, 'y')} strokeWidth="1" />

        {/* Jib and counter-jib */}
        <line x1="20" y1="36" x2="244" y2="36" />
        <line x1="20" y1="44" x2="244" y2="44" />
        <line x1="244" y1="36" x2="244" y2="44" />
        <polyline points={zigzag(68, 244, 11, 44, 36, 'x')} strokeWidth="1" />

        {/* Cat head and pendant lines */}
        <polyline points="56,36 62,12 68,36" />
        <line x1="62" y1="12" x2="22" y2="36" strokeWidth="1" />
        <line x1="62" y1="12" x2="180" y2="36" strokeWidth="1" />

        <rect x="68" y="44" width="10" height="9" />

        {/* Building with an unfinished top floor */}
        <rect x="176" y="140" width="38" height="56" />
        <line x1="176" y1="158.67" x2="214" y2="158.67" />
        <line x1="176" y1="177.33" x2="214" y2="177.33" />
        <rect x="176" y="122" width="38" height="18" strokeDasharray="3 3" />
      </g>

      <rect x="22" y="44" width="18" height="14" fill="currentColor" />

      <g className="crane__trolley">
        <rect
          x="95"
          y="44"
          width="10"
          height="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect className="crane__cable" x="99.25" y="48" width="1.5" height="30" fill="currentColor" />
        <g className="crane__load">
          <path
            d="M100 78 v3 a2.5 2.5 0 0 1 -5 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect x="91" y="84" width="18" height="10" fill="currentColor" />
        </g>
      </g>
    </svg>
  )
}
