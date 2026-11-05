import { useEffect, useState } from 'react'

/**
 * Current time in `timeZone` (e.g. "9:41 pm"), refreshed every 10 seconds.
 * Returns `null` until mounted so prerendered HTML never contains a build-time clock.
 */
export function useLocalTime(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    })
    const tick = () => setTime(formatter.format(new Date()).replace(' ', '\u202f').toLowerCase())
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [timeZone])

  return time
}
