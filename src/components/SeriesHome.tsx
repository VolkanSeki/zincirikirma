import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useHabits } from '../context/useHabits.ts'
import { setBadgeCount } from '../lib/badge.ts'
import { boundSeries, isStandaloneApp, pinSeries, slugFromPath, unpinSeries } from '../lib/homeScreen.ts'
import { calculateStreak } from '../lib/streak.ts'
import { useToday } from '../hooks/useToday.ts'

export function SeriesHome() {
  const { habits } = useHabits()
  const today = useToday()
  const location = useLocation()
  const navigate = useNavigate()
  const slug = slugFromPath(location.pathname)
  const bound = boundSeries()

  useEffect(() => {
    if (!bound || location.pathname !== '/') return
    navigate(`/${bound}`, { replace: true })
  }, [bound, location.pathname, navigate])

  useEffect(() => {
    if (bound) return
    if (slug) {
      const habit = habits.find((item) => item.slug === slug)
      if (habit) pinSeries(habit.slug, habit.title)
      return
    }
    unpinSeries()
  }, [bound, habits, slug])

  useEffect(() => {
    const owner = bound ?? (isStandaloneApp() ? null : slug)
    if (!owner) {
      setBadgeCount(0)
      return
    }
    const habit = habits.find((item) => item.slug === owner)
    setBadgeCount(habit ? calculateStreak(habit, today) : 0)
  }, [bound, habits, slug, today])

  return null
}
