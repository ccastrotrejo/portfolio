import { useEffect, type RefObject } from 'react'

const FINE_POINTER = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/**
 * Tracks a mouse pointer over the page and writes its position, relative to `field`,
 * onto `spot` as `--mx`/`--my`. Sets `data-pointer` on `field` while the pointer is
 * inside the window. No-ops on touch devices and under reduced motion.
 */
export function usePointerSpot(
  field: RefObject<HTMLElement | null>,
  spot: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const fieldEl = field.current
    const spotEl = spot.current
    if (!fieldEl || !spotEl || !window.matchMedia(FINE_POINTER).matches) return

    let x = 0
    let y = 0
    let frame = 0

    const apply = () => {
      frame = 0
      const box = fieldEl.getBoundingClientRect()
      spotEl.style.setProperty('--mx', `${x - box.left}px`)
      spotEl.style.setProperty('--my', `${y - box.top}px`)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      fieldEl.setAttribute('data-pointer', '')
      schedule()
    }
    const onLeave = () => fieldEl.removeAttribute('data-pointer')

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [field, spot])
}
