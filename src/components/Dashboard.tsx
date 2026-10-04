import { useState } from 'react'
import { ChainMark } from './ChainMark.tsx'
import { HabitCard } from './HabitCard.tsx'
import { NewHabitModal } from './NewHabitModal.tsx'
import { Page } from './Page.tsx'
import { useHabits } from '../context/useHabits.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useToday } from '../hooks/useToday.ts'

export function Dashboard() {
  const { habits, persistError } = useHabits()
  const today = useToday()
  const [open, setOpen] = useState(false)
  usePageTitle('Zinciri Kırma')

  const ordered = [...habits].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <Page className="pb-36">
      <header>
        <p className="text-[11px] font-medium tracking-[0.28em] text-amber-400/80 uppercase">Don't break the chain</p>
        <h1 className="mt-2 font-serif text-[2.9rem] leading-[0.92] font-normal text-zinc-50 italic">Zinciri Kırma</h1>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-zinc-400">Her tamamlanan gün bir halka daha.</p>
      </header>

      {persistError && (
        <p className="mt-4 rounded-2xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          Kayıtlar bu tarayıcıda saklanamadı. Gizli pencerede depolama kapalı olabilir.
        </p>
      )}

      {ordered.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto flex items-center justify-center gap-2" aria-hidden>
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={
                  index === 2
                    ? 'flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-400/10 text-amber-300'
                    : 'h-11 w-11 rounded-xl border border-zinc-800 bg-zinc-900/70'
                }
              >
                {index === 2 && <ChainMark kind="cross" />}
              </div>
            ))}
          </div>
          <p className="mt-6 text-base text-zinc-200">Henüz bir serin yok.</p>
          <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-zinc-500">
            Diş fırçalama, spor, okuma. Bir kez ekle, her gün bir halka bırak.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {ordered.map((habit) => (
            <HabitCard key={habit.id} habit={habit} today={today} />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-black from-50% via-black/95 to-transparent px-5 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-amber-400 text-[15px] font-semibold text-black shadow-[0_12px_40px_rgba(251,191,36,0.2)] transition-transform active:scale-[0.98]"
        >
          + Yeni Seri Ekle
        </button>
      </div>

      {open && <NewHabitModal onClose={() => setOpen(false)} />}
    </Page>
  )
}
