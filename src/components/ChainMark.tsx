import type { MarkKind } from '../types.ts'
import { cx } from '../lib/cx.ts'

export function ChainMark({ kind, animate = false }: { kind: MarkKind; animate?: boolean }) {
  if (kind === 'none') return null

  return (
    <svg
      viewBox="0 0 48 48"
      className={cx('mark-glow h-[48%] w-[48%]', animate && 'mark-stamp')}
      aria-hidden
    >
      {kind === 'cross' && (
        <path
          d="M13 13 L35 35"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      )}
      <path
        d="M35 13 L13 35"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
