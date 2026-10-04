import type { DayState, Habit, MarkKind } from '../types.ts'
import {
  formatLongDate,
  isFutureKey,
  isWithinEditWindow,
  parseDateKey,
  toDateKey,
  weekDateKeys,
} from './dates.ts'

export function readValue(habit: Habit, dateKey: string): number {
  const value = habit.history[dateKey] ?? 0
  return value > 0 ? value : 0
}

export function weeklyMarkedCount(habit: Habit, dateKey: string): number {
  return weekDateKeys(parseDateKey(dateKey)).filter((key) => readValue(habit, key) >= 1).length
}

export function isWeekSealed(habit: Habit, dateKey: string): boolean {
  if (habit.type !== 'weekly') return false
  return weeklyMarkedCount(habit, dateKey) >= Math.max(1, habit.targetCount)
}

export function weekProgress(habit: Habit, today = new Date()): {
  done: number
  target: number
  sealed: boolean
} {
  const target = Math.max(1, habit.targetCount)
  const done = weeklyMarkedCount(habit, toDateKey(today))
  return { done, target, sealed: done >= target }
}

export function getDayState(habit: Habit, dateKey: string, today = new Date()): DayState {
  const todayKey = toDateKey(today)
  const value = readValue(habit, dateKey)
  const future = isFutureKey(dateKey, today)
  const editable = isWithinEditWindow(dateKey, today)
  const locked = !future && !editable
  const todayFlag = dateKey === todayKey

  if (habit.type === 'daily') {
    const mark = dailyMark(habit.targetCount, value)
    return {
      dateKey,
      value,
      mark,
      linked: mark === 'cross' && !future,
      autoFilled: false,
      editable,
      locked,
      today: todayFlag,
      future,
    }
  }

  const explicit = value >= 1
  if (isWeekSealed(habit, dateKey)) {
    return {
      dateKey,
      value,
      mark: 'cross',
      linked: true,
      autoFilled: !explicit,
      editable,
      locked,
      today: todayFlag,
      future,
    }
  }

  return {
    dateKey,
    value,
    mark: explicit ? 'slash' : 'none',
    linked: false,
    autoFilled: false,
    editable,
    locked,
    today: todayFlag,
    future,
  }
}

function dailyMark(targetCount: number, value: number): MarkKind {
  if (targetCount <= 1) return value >= 1 ? 'cross' : 'none'
  if (value === 1) return 'slash'
  if (value >= 2) return 'cross'
  return 'none'
}

/** Lived chain days. Future X's of a sealed week stay visual until that day arrives. */
export function countsForStreak(state: DayState): boolean {
  return state.linked && !state.future
}

export function nextHistoryValue(habit: Habit, current: number): number {
  if (habit.type === 'weekly' || habit.targetCount <= 1) {
    return current >= 1 ? 0 : 1
  }
  if (current <= 0) return 1
  if (current === 1) return 2
  return 0
}

export function applyToggle(habit: Habit, dateKey: string, today = new Date()): Habit {
  if (!isWithinEditWindow(dateKey, today)) return habit
  const next = nextHistoryValue(habit, readValue(habit, dateKey))
  const history = { ...habit.history }
  if (next <= 0) delete history[dateKey]
  else history[dateKey] = next
  return { ...habit, history }
}

export function sameRowChain(
  habit: Habit,
  date: Date,
  today = new Date(),
): { left: boolean; right: boolean } {
  const state = getDayState(habit, toDateKey(date), today)
  if (!state.linked) return { left: false, right: false }
  const previous = getDayState(habit, toDateKey(addDaysSafe(date, -1)), today).linked
  const next = getDayState(habit, toDateKey(addDaysSafe(date, 1)), today).linked
  return {
    left: date.getDay() !== 1 && previous,
    right: date.getDay() !== 0 && next,
  }
}

function addDaysSafe(date: Date, amount: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + amount)
  return next
}

export function describeDay(habit: Habit, state: DayState): string {
  const date = formatLongDate(state.dateKey)
  if (state.future && state.mark === 'none') return `${date}, gelecek gün`
  if (state.mark === 'cross' && state.autoFilled) return `${date}, kota ile tamamlandı`
  if (state.mark === 'cross') return `${date}, tamamlandı`
  if (state.mark === 'slash' && habit.type === 'weekly') return `${date}, işaretlendi`
  if (state.mark === 'slash') return `${date}, yarım`
  if (state.locked || state.future) return `${date}, kilitli`
  return `${date}, boş`
}
