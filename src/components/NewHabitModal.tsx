import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { HabitType } from '../types.ts'
import { slugify, uniqueSlug } from '../lib/slug.ts'
import { useHabits } from '../context/useHabits.ts'
import { CloseIcon } from './Icons.tsx'

type Frequency = 'daily-1' | 'daily-2' | 'weekly'

const FREQUENCIES: { id: Frequency; label: string; hint: string }[] = [
  {
    id: 'daily-1',
    label: 'Günlük 1×',
    hint: 'Bir dokunuş günü X ile kapatır. İkinci dokunuş işareti kaldırır.',
  },
  {
    id: 'daily-2',
    label: 'Günlük 2×',
    hint: 'İlk dokunuş eğik çizgi (/), ikinci dokunuş X. Üçüncü dokunuş temizler. Zincire yalnızca X girer.',
  },
  {
    id: 'weekly',
    label: 'Haftalık',
    hint: 'Hedef gün sayısına ulaşınca o haftanın 7 günü tek zincir blokuna dönüşür.',
  },
]

export function NewHabitModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { habits, addHabit } = useHabits()
  const titleId = useId()
  const slugId = useId()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDirty, setSlugDirty] = useState(false)
  const [frequency, setFrequency] = useState<Frequency>('daily-1')
  const [weeklyTarget, setWeeklyTarget] = useState(3)
  const [error, setError] = useState('')

  const cleaned = slugify(slug)
  const finalSlug = uniqueSlug(cleaned, habits.map((habit) => habit.slug))
  const hint = FREQUENCIES.find((item) => item.id === frequency)?.hint ?? ''
  const canSubmit = title.trim().length > 0 && finalSlug.length > 0

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      setError('Başlık bir bağlantı adı üretebilmeli.')
      return
    }

    const type: HabitType = frequency === 'weekly' ? 'weekly' : 'daily'
    const targetCount = frequency === 'daily-2' ? 2 : frequency === 'weekly' ? weeklyTarget : 1
    const habit = addHabit({ title, slug: finalSlug, type, targetCount })
    if (!habit) {
      setError('Başlık bir bağlantı adı üretebilmeli.')
      return
    }
    onClose()
    navigate(`/${habit.slug}`)
  }

  return createPortal(
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-habit-title"
        className="sheet-in w-full max-w-[430px] rounded-t-[28px] border border-zinc-800 bg-zinc-950 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />
        <div className="mb-5 flex items-center justify-between">
          <h2 id="new-habit-title" className="text-lg font-medium tracking-tight text-zinc-50">
            Yeni seri
          </h2>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400"
            onClick={onClose}
            aria-label="Kapat"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block" htmlFor={titleId}>
            <span className="mb-1.5 block text-xs tracking-wide text-zinc-500">Başlık</span>
            <input
              id={titleId}
              autoFocus
              value={title}
              maxLength={48}
              enterKeyHint="done"
              onChange={(event) => {
                const next = event.target.value
                setTitle(next)
                setError('')
                if (!slugDirty) setSlug(slugify(next))
              }}
              placeholder="Diş fırçalama"
              className="h-12 w-full rounded-2xl border border-zinc-800 bg-black px-3.5 text-base text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-400/60"
            />
          </label>

          <fieldset>
            <legend className="mb-1.5 text-xs tracking-wide text-zinc-500">Tür</legend>
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-zinc-800 bg-black p-1">
              {FREQUENCIES.map((item) => {
                const selected = frequency === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFrequency(item.id)}
                    className={
                      selected
                        ? 'h-10 rounded-xl bg-zinc-800 text-[13px] font-medium text-amber-200'
                        : 'h-10 rounded-xl text-[13px] font-medium text-zinc-500'
                    }
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{hint}</p>
          </fieldset>

          {frequency === 'weekly' && (
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black px-3 py-2">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 text-lg text-zinc-200 disabled:opacity-30"
                onClick={() => setWeeklyTarget((value) => Math.max(1, value - 1))}
                disabled={weeklyTarget <= 1}
                aria-label="Hedefi azalt"
              >
                −
              </button>
              <p className="text-sm text-zinc-200">
                Haftada <span className="font-medium text-amber-200">{weeklyTarget}</span> gün
              </p>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 text-lg text-zinc-200 disabled:opacity-30"
                onClick={() => setWeeklyTarget((value) => Math.min(7, value + 1))}
                disabled={weeklyTarget >= 7}
                aria-label="Hedefi artır"
              >
                +
              </button>
            </div>
          )}

          <label className="block" htmlFor={slugId}>
            <span className="mb-1.5 block text-xs tracking-wide text-zinc-500">Adres</span>
            <div className="flex h-12 items-center rounded-2xl border border-zinc-800 bg-black px-3.5 focus-within:border-amber-400/60">
              <span className="text-base text-zinc-600">#/</span>
              <input
                id={slugId}
                value={slug}
                maxLength={48}
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={(event) => {
                  setSlugDirty(true)
                  setSlug(event.target.value)
                  setError('')
                }}
                className="h-full w-full bg-transparent text-base text-zinc-200 outline-none"
              />
            </div>
            {finalSlug && finalSlug !== cleaned && (
              <p className="mt-1.5 text-xs text-amber-200/80">Bu adres dolu. Kaydedilecek: #/{finalSlug}</p>
            )}
            {title.trim() && !cleaned && (
              <p className="mt-1.5 text-xs text-red-300">Bu başlık bir adres üretemiyor.</p>
            )}
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-amber-400 text-[15px] font-semibold text-black shadow-[0_12px_40px_rgba(251,191,36,0.18)] transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            Seriyi oluştur
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
