import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Habit } from '../types.ts'
import { applyToggle } from '../lib/dayState.ts'
import { createHabit } from '../lib/habits.ts'
import type { NewHabitInput } from '../lib/habits.ts'
import { loadHabits, saveHabits, STORAGE_KEY } from '../lib/storage.ts'
import { HabitsContext } from './habits-context.ts'

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [persistError, setPersistError] = useState(false)

  const commit = useCallback((next: Habit[]) => {
    setHabits(next)
    setPersistError(!saveHabits(next))
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setHabits(loadHabits())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addHabit = useCallback(
    (input: NewHabitInput) => {
      const created = createHabit(input, habits)
      if (!created) return null
      commit([created, ...habits])
      return created
    },
    [habits, commit],
  )

  const removeHabit = useCallback(
    (id: string) => {
      commit(habits.filter((habit) => habit.id !== id))
    },
    [habits, commit],
  )

  const toggleDay = useCallback(
    (id: string, dateKey: string) => {
      commit(habits.map((habit) => (habit.id === id ? applyToggle(habit, dateKey) : habit)))
    },
    [habits, commit],
  )

  const value = useMemo(
    () => ({ habits, persistError, addHabit, removeHabit, toggleDay }),
    [habits, persistError, addHabit, removeHabit, toggleDay],
  )

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
}
