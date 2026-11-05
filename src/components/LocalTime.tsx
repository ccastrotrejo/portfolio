import { useLocalTime } from '../hooks/useLocalTime.ts'

interface LocalTimeProps {
  timeZone: string
  city: string
}

/**
 * Live local time ("9:41 pm in New York"). Owns its own ticking state so the rest of
 * the page doesn't re-render every interval. Empty until mounted (see useLocalTime).
 */
export function LocalTime({ timeZone, city }: LocalTimeProps) {
  const time = useLocalTime(timeZone)
  return <p className="site__time">{time !== null ? `${time} in ${city}` : null}</p>
}
