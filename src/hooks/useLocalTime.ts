import { useEffect, useState } from 'react'

const format = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone })
    .format(new Date())
    .replace(' ', '\u202f')
    .toLowerCase()

/** Current time in `timeZone` (e.g. "9:41 pm"), refreshed every 10 seconds. */
export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState(() => format(timeZone))

  useEffect(() => {
    const id = setInterval(() => setTime(format(timeZone)), 10_000)
    return () => clearInterval(id)
  }, [timeZone])

  return time
}
