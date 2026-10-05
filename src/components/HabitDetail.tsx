import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { applyToggle, weekProgress } from '../lib/dayState.ts'
import { formatMonthTitle } from '../lib/dates.ts'
import { habitTypeLabel } from '../lib/habits.ts'
import { setBadgeCount } from '../lib/badge.ts'
import { boundSeries } from '../lib/homeScreen.ts'
import { calculateStreak } from '../lib/streak.ts'
import { cx } from '../lib/cx.ts'
import { useHabits } from '../context/useHabits.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useToday } from '../hooks/useToday.ts'
import { BadgeNotice } from './BadgeNotice.tsx'
import { Calendar } from './Calendar.tsx'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.tsx'
import { Page } from './Page.tsx'
import type { Habit } from '../types.ts'
import { ChainMark } from './ChainMark.tsx'

export function HabitDetail() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { habits, removeHabit, toggleDay } = useHabits()
  const habit = habits.find((item) => item.slug === slug)
  usePageTitle(habit ? `${habit.title} · Zinciri Kırma` : 'Seri bulunamadı · Zinciri Kırma')

  if (!habit) return <MissingHabit />

  return (
    <HabitView
      key={habit.id}
      habit={habit}
      onRemove={() => {
        removeHabit(habit.id)
        navigate('/', { replace: true })
      }}
      onToggle={(dateKey) => toggleDay(habit.id, dateKey)}
    />
  )
}

function HabitView({
  habit,
  onRemove,
  onToggle,
}: {
  habit: Habit
  onRemove: () => void
  onToggle: (dateKey: string) => void
}) {
  const today = useToday()
  const [cursor, setCursor] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }))
  const [confirming, setConfirming] = useState(false)
  const { habits } = useHabits()
  const streak = calculateStreak(habit, today)
  const progress = habit.type === 'weekly' ? weekProgress(habit, today) : null
  const bound = boundSeries()

  const handleToggle = (dateKey: string) => {
    const owner = bound ?? habit.slug
    const source = owner === habit.slug ? applyToggle(habit, dateKey, today) : habits.find((item) => item.slug === owner)
    setBadgeCount(source ? calculateStreak(source, today) : 0)
    onToggle(dateKey)
  }

  const isCurrent = cursor.year === today.getFullYear() && cursor.month === today.getMonth()

  const shiftMonth = (amount: number) => {
    setCursor((current) => {
      const next = new Date(current.year, current.month + amount, 1)
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      if (next > currentMonth) return current
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  return (
    <Page>
      <header className="relative flex h-10 items-center justify-center">
        <Link
          to="/"
          aria-label="Dashboard'a dön"
          className="absolute left-0 inline-flex h-10 items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/80 pr-3 pl-2 text-sm text-zinc-200"
        >
          <ArrowLeftIcon />
          Geri
        </Link>
        <h1 className="max-w-[55%] truncate text-center text-sm font-medium text-zinc-100">{habit.title}</h1>
      </header>

      <div className="mt-8 text-center">
        <p
          className={cx(
            'font-serif leading-none font-normal italic tabular-nums',
            String(streak).length >= 4 ? 'text-7xl' : 'text-[6.25rem]',
            streak > 0 ? 'streak-glow text-amber-300' : 'text-zinc-700',
          )}
        >
          {streak}
        </p>
        <p className="mt-2 text-[11px] tracking-[0.32em] text-zinc-500 uppercase">gün seri</p>
        <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent" />
        <p className="mt-4 text-sm text-zinc-300">{habitTypeLabel(habit)}</p>
        <BadgeNotice count={streak} />
        {progress && (
          <>
            <p className={cx('mt-1 text-sm', progress.sealed ? 'text-amber-200' : 'text-zinc-400')}>
              {progress.sealed ? 'Bu hafta zincire bağlandı' : `Bu hafta ${progress.done} / ${progress.target}`}
            </p>
            <div className="mx-auto mt-3 h-1 w-36 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.85)]"
                style={{ width: `${Math.min(100, (progress.done / progress.target) * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button type="button" className="nav-icon" onClick={() => shiftMonth(-1)} aria-label="Önceki ay">
          <ChevronLeftIcon />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-100">{formatMonthTitle(cursor.year, cursor.month)}</p>
          {!isCurrent && (
            <button
              type="button"
              className="mt-1 text-[11px] tracking-wide text-amber-300"
              onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
            >
              Bugüne dön
            </button>
          )}
        </div>
        <button type="button" className="nav-icon disabled:opacity-30" onClick={() => shiftMonth(1)} disabled={isCurrent} aria-label="Sonraki ay">
          <ChevronRightIcon />
        </button>
      </div>

      <div className="mt-4">
        <Calendar habit={habit} today={today} year={cursor.year} month={cursor.month} onToggle={handleToggle} />
      </div>

      <Legend habit={habit} />

      <div className="mt-10 border-t border-zinc-900 pt-5">
        {confirming ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
            <p className="text-sm text-zinc-300">Bu seri ve tüm geçmişi silinsin mi?</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="h-10 flex-1 rounded-xl border border-zinc-700 text-sm text-zinc-300" onClick={() => setConfirming(false)}>
                Vazgeç
              </button>
              <button
                type="button"
                className="h-10 flex-1 rounded-xl bg-red-500/15 text-sm font-medium text-red-300"
                onClick={onRemove}
              >
                Sil
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="text-sm text-zinc-600" onClick={() => setConfirming(true)}>
            Seriyi sil
          </button>
        )}
      </div>
    </Page>
  )
}

function Legend({ habit }: { habit: Habit }) {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
        {habit.type === 'daily' && habit.targetCount >= 2 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="cell cell-slash cell-compact cell-sample">
              <ChainMark kind="slash" />
            </span>
            yarım
          </span>
        )}
        {habit.type === 'weekly' && (
          <span className="inline-flex items-center gap-1.5">
            <span className="cell cell-slash cell-compact cell-sample">
              <ChainMark kind="slash" />
            </span>
            işaret
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="cell cell-cross cell-compact cell-sample">
            <ChainMark kind="cross" />
          </span>
          {habit.type === 'weekly' ? 'hafta kapandı' : 'tamam'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="cell cell-locked cell-compact cell-sample" />
          kilitli
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Bugün dahil son 7 gün düzenlenebilir. Daha eski bir boş gün zinciri orada keser.
        {habit.type === 'daily' && habit.targetCount >= 2 && ' Yalnızca tam X günleri birbirine bağlanır.'}
        {habit.type === 'weekly' && ' Kota dolunca haftanın 7 günü X X X X X X X blokuna dönüşür.'}
      </p>
    </div>
  )
}

function MissingHabit() {
  useEffect(() => {
    setBadgeCount(0)
  }, [])

  return (
    <Page>
      <Link
        to="/"
        aria-label="Dashboard'a dön"
        className="inline-flex h-10 items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/80 pr-3 pl-2 text-sm text-zinc-200"
      >
        <ArrowLeftIcon />
        Geri
      </Link>
      <div className="mt-20 text-center">
        <h1 className="font-serif text-4xl text-zinc-100 italic">Bu seri bulunamadı</h1>
        <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-zinc-500">
          Adres, serinin kayıtlı olduğu tarayıcıda açılır. Bu cihazda böyle bir seri yok.
        </p>
      </div>
    </Page>
  )
}
