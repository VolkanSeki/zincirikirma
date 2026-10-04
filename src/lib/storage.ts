import type { Habit } from '../types.ts'
import { normalizeHabit } from './habits.ts'
import { uniqueSlug } from './slug.ts'

export const STORAGE_KEY = 'zinciri-kirma.habits'

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const habits: Habit[] = []
    for (const entry of parsed) {
      const habit = normalizeHabit(entry)
      if (!habit) continue
      habit.slug = uniqueSlug(habit.slug, habits.map((item) => item.slug))
      habits.push(habit)
    }
    return habits
  } catch {
    return []
  }
}

export function saveHabits(habits: Habit[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
    return true
  } catch {
    return false
  }
}
