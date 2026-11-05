import { useRef } from 'react'
import { usePointerSpot } from '../hooks/usePointerSpot.ts'

/**
 * Dot-paper background for the page: a dot grid in the margins that clears behind
 * the reading column, with a spotlight that brightens dots around the mouse.
 * Purely decorative; positioned behind its parent's content.
 */
export function DotField() {
  const fieldRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  usePointerSpot(fieldRef, spotRef)

  return (
    <div ref={fieldRef} className="dot-field" aria-hidden="true">
      <div className="dot-field__dots" />
      <div ref={spotRef} className="dot-field__dots dot-field__spot" />
    </div>
  )
}
