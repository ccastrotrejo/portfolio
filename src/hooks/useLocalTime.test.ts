import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocalTime } from './useLocalTime.ts'

describe('useLocalTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 02:41 UTC on Nov 5 is 9:41 pm the previous evening in New York.
    vi.setSystemTime(new Date('2026-11-05T02:41:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the current time in the given time zone once mounted', () => {
    const { result } = renderHook(() => useLocalTime('America/New_York'))
    expect(result.current).toMatch(/^9:41\spm$/)
  })

  it('advances as time passes', () => {
    const { result } = renderHook(() => useLocalTime('America/New_York'))
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(result.current).toMatch(/^9:42\spm$/)
  })
})
