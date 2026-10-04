import type { DayState } from '../types.ts'
import { cx } from '../lib/cx.ts'

export function dayCellClass(state: DayState, compact = false): string {
  return cx(
    'cell',
    compact && 'cell-compact',
    state.mark === 'cross' && 'cell-cross',
    state.mark === 'slash' && 'cell-slash',
    state.future && !state.linked && 'cell-future',
    state.locked && 'cell-locked',
    state.future && state.linked && 'cell-sealed-future',
    state.today && 'cell-today',
    state.editable && 'cell-pressable',
  )
}
