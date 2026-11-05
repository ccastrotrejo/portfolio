import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DotField } from './DotField.tsx'

function mockFinePointer(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }))
}

function movePointer(pointerType: string, clientX: number, clientY: number) {
  const event = new MouseEvent('pointermove', { clientX, clientY })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  window.dispatchEvent(event)
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

describe('DotField', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is hidden from assistive technology', () => {
    mockFinePointer(true)
    const { container } = render(<DotField />)
    expect(container.querySelector('.dot-field')).toHaveProperty('ariaHidden', 'true')
  })

  it('follows a mouse with the spotlight', async () => {
    mockFinePointer(true)
    const { container } = render(<DotField />)
    const field = container.querySelector<HTMLElement>('.dot-field')!
    const spot = container.querySelector<HTMLElement>('.dot-field__spot')!

    movePointer('mouse', 120, 80)
    await nextFrame()

    expect(field.hasAttribute('data-pointer')).toBe(true)
    expect(spot.style.getPropertyValue('--mx')).toBe('120px')
    expect(spot.style.getPropertyValue('--my')).toBe('80px')
  })

  it('ignores touch input', async () => {
    mockFinePointer(true)
    const { container } = render(<DotField />)
    movePointer('touch', 120, 80)
    await nextFrame()
    expect(container.querySelector('.dot-field')!.hasAttribute('data-pointer')).toBe(false)
  })

  it('stays inert without a fine pointer or with reduced motion', async () => {
    mockFinePointer(false)
    const { container } = render(<DotField />)
    movePointer('mouse', 120, 80)
    await nextFrame()
    expect(container.querySelector('.dot-field')!.hasAttribute('data-pointer')).toBe(false)
  })

  it('hides the spotlight when the pointer leaves the page', () => {
    mockFinePointer(true)
    const { container } = render(<DotField />)
    movePointer('mouse', 120, 80)
    document.documentElement.dispatchEvent(new Event('pointerleave'))
    expect(container.querySelector('.dot-field')!.hasAttribute('data-pointer')).toBe(false)
  })
})
