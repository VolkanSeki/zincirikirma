import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { ArrowLeftIcon } from './Icons.tsx'
import { Page } from './Page.tsx'

export function NotFound() {
  usePageTitle('Sayfa bulunamadı · Zinciri Kırma')

  return (
    <Page>
      <Link
        to="/"
        aria-label="Dashboard'a dön"
        className="inline-flex h-10 items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/80 pr-3 pl-2 text-sm text-zinc-200"
      >
        <ArrowLeftIcon />
        Geri
      </Link>
      <div className="mt-20 text-center">
        <h1 className="font-serif text-4xl text-zinc-100 italic">Sayfa bulunamadı</h1>
        <p className="mt-3 text-sm text-zinc-500">Bu adres bir seriye çıkmıyor.</p>
      </div>
    </Page>
  )
}
