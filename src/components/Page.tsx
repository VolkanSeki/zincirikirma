import type { ReactNode } from 'react'
import { cx } from '../lib/cx.ts'

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'min-h-dvh px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
