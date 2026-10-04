/** Today plus the six days before it: the editable grace window. */
export const EDIT_WINDOW_DAYS = 6

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

export function addDays(date: Date, amount: number): Date {
  const next = startOfDay(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function differenceInCalendarDays(later: Date, earlier: Date): number {
  const a = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate())
  const b = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())
  return Math.round((a - b) / 86_400_000)
}

export function isFutureKey(dateKey: string, today = new Date()): boolean {
  return dateKey > toDateKey(today)
}

export function isWithinEditWindow(dateKey: string, today = new Date()): boolean {
  const diff = differenceInCalendarDays(startOfDay(today), parseDateKey(dateKey))
  return diff >= 0 && diff <= EDIT_WINDOW_DAYS
}

/** Monday-start week. Sunday is the last day and the quota checkpoint. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date)
  const weekday = day.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  return addDays(day, diff)
}

export function weekDateKeys(date: Date): string[] {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)))
}

export interface MonthCell {
  date: Date | null
  dateKey: string | null
}

export function getMonthGrid(year: number, month: number): MonthCell[] {
  const first = new Date(year, month, 1)
  const startPad = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: MonthCell[] = []

  for (let index = 0; index < startPad; index += 1) {
    cells.push({ date: null, dateKey: null })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({ date, dateKey: toDateKey(date) })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, dateKey: null })
  }

  return cells
}

export function recentDateKeys(today = new Date(), count = 7): string[] {
  const start = addDays(today, -(count - 1))
  return Array.from({ length: count }, (_, index) => toDateKey(addDays(start, index)))
}

const monthFormatter = new Intl.DateTimeFormat('tr-TR', {
  month: 'long',
  year: 'numeric',
})

const longFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatMonthTitle(year: number, month: number): string {
  const label = monthFormatter.format(new Date(year, month, 1))
  return label.charAt(0).toLocaleUpperCase('tr-TR') + label.slice(1)
}

export function formatLongDate(dateKey: string): string {
  return longFormatter.format(parseDateKey(dateKey))
}

export const WEEKDAY_LABELS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'] as const
