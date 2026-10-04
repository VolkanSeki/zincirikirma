import { describe, expect, it } from 'vitest'
import type { Habit } from '../types.ts'
import {
  applyToggle,
  countsForStreak,
  getDayState,
  isWeekSealed,
  sameRowChain,
  weekProgress,
} from './dayState.ts'
import { getMonthGrid, toDateKey, weekDateKeys } from './dates.ts'
import { createHabit, normalizeHabit } from './habits.ts'
import { slugify, uniqueSlug } from './slug.ts'
import { calculateStreak } from './streak.ts'

const today = new Date(2026, 9, 5)

function makeHabit(overrides: Partial<Habit> & Pick<Habit, 'type' | 'targetCount'>): Habit {
  return {
    id: 'habit-1',
    title: 'Test',
    slug: 'test',
    history: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('calendar dates', () => {
  it('treats 5 October 2026 as Monday and builds a Monday-first grid', () => {
    expect(today.getDay()).toBe(1)
    expect(toDateKey(today)).toBe('2026-10-05')
    const grid = getMonthGrid(2026, 9)
    expect(grid[0]?.date).toBeNull()
    expect(grid[3]?.dateKey).toBe('2026-10-01')
    expect(grid.length % 7).toBe(0)
  })

  it('starts weeks on Monday and ends them on Sunday', () => {
    expect(weekDateKeys(today)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ])
    expect(weekDateKeys(new Date(2026, 9, 4))[0]).toBe('2026-09-28')
    expect(weekDateKeys(new Date(2026, 9, 4))[6]).toBe('2026-10-04')
  })
})

describe('slugify', () => {
  it('folds Turkish characters into a url slug', () => {
    expect(slugify('Diş Fırçalama')).toBe('dis-fircalama')
    expect(slugify('Haftalık Spor!!!')).toBe('haftalik-spor')
    expect(slugify('İlk Gün')).toBe('ilk-gun')
    expect(slugify('Çay')).toBe('cay')
  })

  it('suffixes colliding slugs', () => {
    expect(uniqueSlug('cay', ['cay'])).toBe('cay-2')
    expect(uniqueSlug('cay', ['cay', 'cay-2'])).toBe('cay-3')
  })
})

describe('daily marking', () => {
  it('cycles a 1x day between empty and X', () => {
    const habit = makeHabit({ type: 'daily', targetCount: 1 })
    const once = applyToggle(habit, '2026-10-05', today)
    expect(once.history['2026-10-05']).toBe(1)
    expect(getDayState(once, '2026-10-05', today).mark).toBe('cross')
    expect(calculateStreak(once, today)).toBe(1)

    const cleared = applyToggle(once, '2026-10-05', today)
    expect(cleared.history['2026-10-05']).toBeUndefined()
    expect(calculateStreak(cleared, today)).toBe(0)
  })

  it('cycles a 2x day through slash, X, then clear', () => {
    let habit = makeHabit({ type: 'daily', targetCount: 2 })
    habit = applyToggle(habit, '2026-10-05', today)
    expect(getDayState(habit, '2026-10-05', today).mark).toBe('slash')
    expect(calculateStreak(habit, today)).toBe(0)

    habit = applyToggle(habit, '2026-10-05', today)
    expect(habit.history['2026-10-05']).toBe(2)
    expect(getDayState(habit, '2026-10-05', today).mark).toBe('cross')
    expect(calculateStreak(habit, today)).toBe(1)

    habit = applyToggle(habit, '2026-10-05', today)
    expect(habit.history['2026-10-05']).toBeUndefined()
    expect(calculateStreak(habit, today)).toBe(0)
  })

  it('refuses future days and days older than the grace window', () => {
    const habit = makeHabit({ type: 'daily', targetCount: 1 })
    expect(applyToggle(habit, '2026-10-06', today)).toBe(habit)
    expect(applyToggle(habit, '2026-09-27', today)).toBe(habit)
    expect(getDayState(habit, '2026-09-28', today).locked).toBe(true)
    expect(getDayState(habit, '2026-09-29', today).editable).toBe(true)
  })
})

describe('streak grace window', () => {
  it('bridges gaps inside the last 7 days and counts a completed day just outside them', () => {
    const habit = makeHabit({
      type: 'daily',
      targetCount: 1,
      history: {
        '2026-10-05': 1,
        '2026-10-04': 1,
        '2026-10-02': 1,
        '2026-09-28': 1,
        '2026-09-27': 1,
      },
    })

    expect(calculateStreak(habit, today)).toBe(5)
  })

  it('snaps the chain at the first locked empty day', () => {
    const habit = makeHabit({
      type: 'daily',
      targetCount: 1,
      history: {
        '2026-09-27': 1,
        '2026-09-26': 1,
      },
    })

    expect(calculateStreak(habit, today)).toBe(0)
  })

  it('does not zero the streak when today itself is still empty', () => {
    const habit = makeHabit({
      type: 'daily',
      targetCount: 1,
      history: { '2026-10-04': 1, '2026-10-03': 1 },
    })

    expect(calculateStreak(habit, today)).toBe(2)
  })
})

describe('weekly quota', () => {
  const wednesday = new Date(2026, 9, 7)

  it('seals the whole week once the quota is met and banks only lived days', () => {
    const habit = makeHabit({
      type: 'weekly',
      targetCount: 2,
      history: {
        '2026-10-05': 1,
        '2026-10-07': 1,
      },
    })

    expect(isWeekSealed(habit, '2026-10-07')).toBe(true)
    expect(weekProgress(habit, wednesday)).toEqual({ done: 2, target: 2, sealed: true })

    for (const key of weekDateKeys(wednesday)) {
      expect(getDayState(habit, key, wednesday).mark).toBe('cross')
      expect(getDayState(habit, key, wednesday).linked).toBe(true)
    }

    expect(getDayState(habit, '2026-10-06', wednesday).autoFilled).toBe(true)
    expect(getDayState(habit, '2026-10-05', wednesday).autoFilled).toBe(false)
    expect(countsForStreak(getDayState(habit, '2026-10-08', wednesday))).toBe(false)
    expect(calculateStreak(habit, wednesday)).toBe(3)
  })

  it('does not chain a week that is still short of its quota', () => {
    const habit = makeHabit({
      type: 'weekly',
      targetCount: 3,
      history: { '2026-10-05': 1, '2026-10-07': 1 },
    })

    expect(getDayState(habit, '2026-10-05', wednesday).mark).toBe('slash')
    expect(getDayState(habit, '2026-10-05', wednesday).linked).toBe(false)
    expect(calculateStreak(habit, wednesday)).toBe(0)
  })

  it('draws the chain across a sealed week but not from Sunday into Monday', () => {
    const habit = makeHabit({
      type: 'weekly',
      targetCount: 1,
      history: { '2026-10-05': 1 },
    })

    expect(sameRowChain(habit, new Date(2026, 9, 5), today)).toEqual({ left: false, right: true })
    expect(sameRowChain(habit, new Date(2026, 9, 6), today)).toEqual({ left: true, right: true })
    expect(sameRowChain(habit, new Date(2026, 9, 11), today)).toEqual({ left: true, right: false })
    expect(sameRowChain(habit, new Date(2026, 9, 8), today).right).toBe(true)
  })
})

describe('createHabit', () => {
  it('clamps targets and avoids duplicate slugs', () => {
    const first = createHabit({ title: 'Diş Fırçalama', slug: 'dis-fircalama', type: 'daily', targetCount: 2 }, [])
    expect(first?.slug).toBe('dis-fircalama')
    expect(first?.targetCount).toBe(2)

    const second = createHabit(
      { title: 'Diş Fırçalama', slug: 'dis-fircalama', type: 'weekly', targetCount: 9 },
      first ? [first] : [],
    )
    expect(second?.slug).toBe('dis-fircalama-2')
    expect(second?.targetCount).toBe(7)
    expect(createHabit({ title: '!!!', slug: '!!!', type: 'daily', targetCount: 1 }, [])).toBeNull()
  })

  it('drops invalid history entries while loading', () => {
    const habit = normalizeHabit({
      id: 'a',
      title: '  Spor  ',
      slug: 'Haftalık Spor',
      type: 'weekly',
      targetCount: 0,
      history: { '2026-10-05': 2, 'nope': 1, '2026-10-06': 0 },
      createdAt: '2026-10-01T00:00:00.000Z',
    })

    expect(habit).toMatchObject({
      title: 'Spor',
      slug: 'haftalik-spor',
      targetCount: 1,
      history: { '2026-10-05': 2 },
    })
  })
})
