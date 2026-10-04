import { useContext } from 'react'
import { HabitsContext } from './habits-context.ts'
import type { HabitsContextValue } from './habits-context.ts'

export function useHabits(): HabitsContextValue {
  const value = useContext(HabitsContext)
  if (!value) throw new Error('useHabits yalnızca HabitsProvider içinde kullanılabilir.')
  return value
}
