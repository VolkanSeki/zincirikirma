import { useEffect, useState } from 'react'
import { startOfDay } from '../lib/dates.ts'

export function useToday(): Date {
  const [today, setToday] = useState(() => startOfDay(new Date()))

  useEffect(() => {
    const sync = () => {
      const next = startOfDay(new Date())
      setToday((current) => (current.getTime() === next.getTime() ? current : next))
    }
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return today
}
