import { useEffect, useState } from 'react'

export const MAT_MINOR = 24
export const MAT_MAJOR = MAT_MINOR * 5
const MARGIN = 44

/** Viewport size plus the cutting mat's grid-snapped working field. */
export function useMatField() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { w, h } = size
  const fw = Math.max(MAT_MINOR, Math.floor((w - MARGIN * 2) / MAT_MINOR) * MAT_MINOR)
  const fh = Math.max(MAT_MINOR, Math.floor((h - MARGIN * 2) / MAT_MINOR) * MAT_MINOR)
  const x0 = Math.round((w - fw) / 2)
  const y0 = Math.round((h - fh) / 2)
  return { w, h, fw, fh, x0, y0, x1: x0 + fw, y1: y0 + fh }
}
