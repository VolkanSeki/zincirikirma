export type HabitType = 'daily' | 'weekly'

export interface Habit {
  id: string
  title: string
  slug: string
  type: HabitType
  targetCount: number
  history: Record<string, number>
  createdAt: string
}

export type MarkKind = 'none' | 'slash' | 'cross'

export interface DayState {
  dateKey: string
  value: number
  mark: MarkKind
  /** Visual chain membership. Future days of a sealed week are included. */
  linked: boolean
  /** Weekly quota painted this day without an explicit log. */
  autoFilled: boolean
  editable: boolean
  locked: boolean
  today: boolean
  future: boolean
}
