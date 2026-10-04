import { createContext } from 'react'
import type { Habit } from '../types.ts'
import type { NewHabitInput } from '../lib/habits.ts'

export interface HabitsContextValue {
  habits: Habit[]
  persistError: boolean
  addHabit: (input: NewHabitInput) => Habit | null
  removeHabit: (id: string) => void
  toggleDay: (id: string, dateKey: string) => void
}

export const HabitsContext = createContext<HabitsContextValue | null>(null)
