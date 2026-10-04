import { Link } from 'react-router-dom'
import type { Habit } from '../types.ts'
import { weekProgress } from '../lib/dayState.ts'
import { habitTypeLabel } from '../lib/habits.ts'
import { calculateStreak } from '../lib/streak.ts'
import { ChevronRightIcon } from './Icons.tsx'
import { MiniChain } from './MiniChain.tsx'

export function HabitCard({ habit, today }: { habit: Habit; today: Date }) {
  const streak = calculateStreak(habit, today)
  const progress = habit.type === 'weekly' ? weekProgress(habit, today) : null

  return (
    <Link
      to={`/${habit.slug}`}
      className="block rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform active:scale-[0.985]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-medium tracking-tight text-zinc-50">{habit.title}</h2>
          <p className="mt-1 text-xs tracking-wide text-zinc-500">{habitTypeLabel(habit)}</p>
        </div>
        <span className="mt-0.5 text-zinc-600">
          <ChevronRightIcon />
        </span>
      </div>
      <p className="mt-4 text-[15px] font-medium text-amber-200">🔥 {streak} Gün</p>
      <div className="mt-3">
        <MiniChain habit={habit} today={today} />
      </div>
      {progress && (
        <p className="mt-3 text-xs text-zinc-400">
          Bu hafta {progress.done}/{progress.target}
          {progress.sealed && <span className="text-amber-300/90"> · zincir kapandı</span>}
        </p>
      )}
    </Link>
  )
}
