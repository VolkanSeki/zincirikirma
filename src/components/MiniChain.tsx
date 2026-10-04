import type { Habit } from '../types.ts'
import { getDayState } from '../lib/dayState.ts'
import { recentDateKeys } from '../lib/dates.ts'
import { DayCell } from './DayCell.tsx'

export function MiniChain({ habit, today }: { habit: Habit; today: Date }) {
  const states = recentDateKeys(today, 7).map((key) => getDayState(habit, key, today))

  return (
    <div className="chain-grid" aria-hidden>
      {states.map((state, index) => {
        const next = states[index + 1]
        return (
          <DayCell
            key={state.dateKey}
            habit={habit}
            state={state}
            compact
            bridge={Boolean(next?.linked && state.linked)}
          />
        )
      })}
    </div>
  )
}
