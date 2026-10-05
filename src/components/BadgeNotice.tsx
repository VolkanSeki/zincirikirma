import { useEffect, useState } from 'react'
import { badgeSupport, enableBadge, subscribeBadgeSupport } from '../lib/badge.ts'
import type { BadgeSupport } from '../lib/badge.ts'

export function BadgeNotice({ count }: { count: number }) {
  const [support, setSupport] = useState<BadgeSupport>(() => badgeSupport())

  useEffect(() => subscribeBadgeSupport(() => setSupport(badgeSupport())), [])

  if (support === 'skip' || support === 'ready') return null

  if (support === 'install') {
    return (
      <p className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs leading-relaxed text-zinc-400">
        Rozet, Safari sekmesinde görünmez. İkonu ana ekrandan sil, siteyi yeniden ekle ve Web Uygulaması olarak aç.
      </p>
    )
  }

  if (support === 'denied') {
    return (
      <p className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs leading-relaxed text-zinc-400">
        Rozet kapalı. Ayarlar → Bildirimler → Zinciri Kırma içinde bildirimlere ve rozetlere izin ver.
      </p>
    )
  }

  return (
    <button
      type="button"
      onPointerUp={() => {
        void enableBadge(count).then((granted) => {
          if (granted) setSupport('ready')
          else setSupport(badgeSupport())
        })
      }}
      className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 text-sm font-medium text-amber-200"
    >
      Ana ekran rozetini aç
    </button>
  )
}
