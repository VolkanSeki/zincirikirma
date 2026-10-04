import type { Habit, HabitType } from '../types.ts'
import { slugify, uniqueSlug } from './slug.ts'

export interface NewHabitInput {
  title: string
  slug: string
  type: HabitType
  targetCount: number
}

export function habitTypeLabel(habit: Pick<Habit, 'type' | 'targetCount'>): string {
  if (habit.type === 'weekly') return `Haftalık · ${habit.targetCount} gün`
  if (habit.targetCount >= 2) return 'Günlük · 2 kez'
  return 'Günlük · 1 kez'
}

export function clampTarget(type: HabitType, targetCount: number): number {
  if (type === 'daily') return targetCount >= 2 ? 2 : 1
  return Math.min(7, Math.max(1, Math.round(targetCount) || 1))
}

export function createHabit(input: NewHabitInput, existing: Habit[]): Habit | null {
  const title = input.title.trim()
  const slug = uniqueSlug(slugify(input.slug || title), existing.map((habit) => habit.slug))
  if (!title || !slug) return null

  return {
    id: crypto.randomUUID(),
    title,
    slug,
    type: input.type,
    targetCount: clampTarget(input.type, input.targetCount),
    history: {},
    createdAt: new Date().toISOString(),
  }
}

export function normalizeHabit(value: unknown): Habit | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Partial<Habit>
  if (raw.type !== 'daily' && raw.type !== 'weekly') return null
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string' || typeof raw.slug !== 'string') return null
  if (typeof raw.createdAt !== 'string') return null

  const history: Record<string, number> = {}
  if (raw.history && typeof raw.history === 'object') {
    for (const [key, entry] of Object.entries(raw.history)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue
      if (typeof entry !== 'number' || !Number.isFinite(entry) || entry <= 0) continue
      history[key] = entry >= 2 ? 2 : 1
    }
  }

  const slug = slugify(raw.slug) || slugify(raw.title) || raw.id

  return {
    id: raw.id,
    title: raw.title.trim() || 'Seri',
    slug,
    type: raw.type,
    targetCount: clampTarget(raw.type, typeof raw.targetCount === 'number' ? raw.targetCount : 1),
    history,
    createdAt: raw.createdAt,
  }
}
