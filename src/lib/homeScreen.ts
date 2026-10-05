const APP_TITLE = 'Zinciri Kırma'
const SERIES_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const launchSeriesSlug = readLaunchSeries()

export function readSeries(href: string): string | null {
  try {
    const series = new URL(href).searchParams.get('series')?.trim() ?? ''
    return validSeries(series)
  } catch {
    return null
  }
}

export function seriesFromHref(href: string): string | null {
  const fromQuery = readSeries(href)
  if (fromQuery) return fromQuery
  try {
    const hashPath = new URL(href).hash.replace(/^#/, '').split('?')[0] ?? ''
    return slugFromPath(hashPath.startsWith('/') ? hashPath : `/${hashPath}`)
  } catch {
    return null
  }
}

export function slugFromPath(pathname: string): string | null {
  const slug = decodeURIComponent(pathname.replace(/^\/+/, ''))
  return validSeries(slug)
}

export function boundSeries(): string | null {
  return isStandaloneApp() ? launchSeriesSlug : null
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone
  if (standalone === true) return true
  if (typeof window.matchMedia !== 'function') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  )
}

export function pinSeries(slug: string, title: string): void {
  if (!SERIES_SLUG.test(slug)) return
  if (boundSeries() && boundSeries() !== slug) return

  const url = new URL(window.location.href)
  if (url.searchParams.get('series') !== slug) {
    url.searchParams.set('series', slug)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
  setHomeScreenTitle(title.trim() || APP_TITLE)
  setManifestLink(slug, title)
}

export function unpinSeries(): void {
  if (boundSeries()) return
  const url = new URL(window.location.href)
  if (url.searchParams.has('series')) {
    url.searchParams.delete('series')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
  setHomeScreenTitle(APP_TITLE)
  setManifestLink(null, null)
}

function readLaunchSeries(): string | null {
  if (typeof window === 'undefined') return null
  return seriesFromHref(window.location.href)
}

function validSeries(series: string): string | null {
  return SERIES_SLUG.test(series) ? series : null
}

function setHomeScreenTitle(title: string): void {
  let meta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'apple-mobile-web-app-title')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', title)
}

function setManifestLink(slug: string | null, title: string | null): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (!link) return
  const href = new URL('manifest.json', document.baseURI)
  if (slug && title) {
    href.searchParams.set('series', slug)
    href.searchParams.set('title', title)
  }
  link.href = href.href
}
