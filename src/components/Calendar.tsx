import { useState } from 'react'
import type { Habit } from '../types.ts'
import { getDayState, isWeekSealed, sameRowChain } from '../lib/dayState.ts'
import { WEEKDAY_LABELS, getMonthGrid } from '../lib/dates.ts'
import { DayCell } from './DayCell.tsx'

export function Calendar({
  habit,
  today,
  year,
  month,
  onToggle,
}: {
  habit: Habit
  today: Date
  year: number
  month: number
  onToggle: (dateKey: string) => void
}) {
  const [stamp, setStamp] = useState<{ key: string; nonce: number } | null>(null)
  const cells = getMonthGrid(year, month)

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-x-[6px]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-1 text-center text-[10px] font-medium tracking-[0.14em] text-zinc-500">
            {label}
          </div>
        ))}
      </div>
      <div className="chain-grid">
        {cells.map((cell, index) => {
          if (!cell.date || !cell.dateKey) {
            return <div key={`pad-${index}`} className="aspect-square" />
          }

          const state = getDayState(habit, cell.dateKey, today)
          const links = sameRowChain(habit, cell.date, today)
          const animate = stamp?.key === cell.dateKey

          return (
            <DayCell
              key={cell.dateKey}
              habit={habit}
              state={state}
              bridge={links.right}
              animate={animate}
              stampKey={animate ? `${cell.dateKey}-${stamp.nonce}` : undefined}
              showLogDot={habit.type === 'weekly' && state.mark === 'cross' && !state.autoFilled && isWeekSealed(habit, cell.dateKey)}
              onPress={() => {
                setStamp((current) => ({
                  key: cell.dateKey!,
                  nonce: (current?.nonce ?? 0) + 1,
                }))
                onToggle(cell.dateKey!)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
