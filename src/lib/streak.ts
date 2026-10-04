import type { Habit } from '../types.ts'
import { countsForStreak, getDayState } from './dayState.ts'
import { addDays, startOfDay, toDateKey } from './dates.ts'

const MAX_LOOKBACK_DAYS = 20_000

/**
 * Walk backward from today.
 * Linked days extend the streak. Empty days inside the 7-day window are grace
 * gaps: they do not add a day and they do not break the chain. The first empty
 * day older than that window snaps the chain.
 */
export function calculateStreak(habit: Habit, today = new Date()): number {
  let streak = 0
  let cursor = startOfDay(today)

  for (let index = 0; index < MAX_LOOKBACK_DAYS; index += 1) {
    const state = getDayState(habit, toDateKey(cursor), today)
    if (countsForStreak(state)) streak += 1
    else if (state.locked) break
    cursor = addDays(cursor, -1)
  }

  return streak
}
