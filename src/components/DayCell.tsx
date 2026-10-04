import type { Habit } from '../types.ts'
import type { DayState } from '../types.ts'
import { describeDay } from '../lib/dayState.ts'
import { parseDateKey } from '../lib/dates.ts'
import { cx } from '../lib/cx.ts'
import { ChainMark } from './ChainMark.tsx'
import { dayCellClass } from './dayCellClass.ts'

export function DayCell({
  habit,
  state,
  bridge,
  compact = false,
  animate = false,
  stampKey,
  showLogDot = false,
  onPress,
}: {
  habit: Habit
  state: DayState
  bridge: boolean
  compact?: boolean
  animate?: boolean
  stampKey?: string
  showLogDot?: boolean
  onPress?: () => void
}) {
  const dayNumber = parseDateKey(state.dateKey).getDate()
  const numberTone = state.today ? 'text-amber-200' : state.mark === 'none' ? 'text-zinc-500' : 'text-amber-200/70'

  const content = (
    <>
      {bridge && <span className="chain-bridge" />}
      {!compact && (
        <span className={cx('absolute top-0.5 left-1 z-10 text-[9px] font-medium tabular-nums', numberTone)}>
          {dayNumber}
        </span>
      )}
      {state.mark === 'none' && compact && (
        <span className={cx('relative z-10 text-[11px] font-medium tabular-nums', numberTone)}>{dayNumber}</span>
      )}
      <ChainMark key={stampKey ?? state.mark} kind={state.mark} animate={animate} />
      {showLogDot && (
        <span className="absolute bottom-1 z-10 h-1 w-1 rounded-full bg-amber-100 shadow-[0_0_6px_rgba(254,243,199,0.95)]" />
      )}
    </>
  )

  if (!onPress) {
    return <div className={dayCellClass(state, compact)}>{content}</div>
  }

  return (
    <button
      type="button"
      className={dayCellClass(state, compact)}
      disabled={!state.editable}
      aria-label={describeDay(habit, state)}
      onClick={onPress}
    >
      {content}
    </button>
  )
}
