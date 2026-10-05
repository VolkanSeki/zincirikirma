const APP_TITLE = 'Zinciri Kırma'
const SERIES_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const launchBasePath = detectBase(typeof window === 'undefined' ? 'http://localhost/' : window.location.href)
const launchSeriesSlug = readLaunchSeries()

export function appBasePath(): string {
  return launchBasePath
}

export function readSeries(href: string): string | null {
  try {
    const series = new URL(href).searchParams.get('series')?.trim() ?? ''
    return validSeries(series)
  } catch {
    return null
  }
}

export function seriesFromHref(href: string, root = ''): string | null {
  const fromQuery = readSeries(href)
  if (fromQuery) return fromQuery
  try {
    const url = new URL(href)
    const hashPath = url.hash.replace(/^#/, '').split('?')[0] ?? ''
    if (hashPath.startsWith('/')) {
      const fromHash = slugFromPath(hashPath)
      if (fromHash) return fromHash
    }
    return slugFromPath(stripBase(url.pathname, root))
  } catch {
    return null
  }
}

export function seriesLaunchPath(href: string, root = ''): string | null {
  try {
    const url = new URL(href)
    const slug = seriesFromHref(href, root)
    if (!slug) return null
    const onPath = slugFromPath(stripBase(url.pathname, root)) === slug
    const dirty = url.searchParams.has('series') || /^#\//.test(url.hash)
    if (onPath && !dirty) return null
    const base = root.endsWith('/') ? root.slice(0, -1) : root
    return `${base}/${slug}`
  } catch {
    return null
  }
}

export function slugFromPath(pathname: string): string | null {
  const slug = decodeURIComponent(pathname.replace(/^\/+/, '').replace(/\/+$/, ''))
  if (slug === '' || slug === 'index.html') return null
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
  setHomeScreenTitle(title.trim() || APP_TITLE)
}

export function unpinSeries(): void {
  if (boundSeries()) return
  setHomeScreenTitle(APP_TITLE)
}

function detectBase(href: string): string {
  try {
    const url = new URL(href)
    if (!url.hostname.endsWith('github.io')) return ''
    const repo = url.pathname.split('/').filter(Boolean)[0]
    return repo ? `/${repo}` : ''
  } catch {
    return ''
  }
}

function readLaunchSeries(): string | null {
  if (typeof window === 'undefined') return null
  return seriesFromHref(window.location.href, launchBasePath)
}

function stripBase(pathname: string, root: string): string {
  const base = root.endsWith('/') ? root.slice(0, -1) : root
  if (!base) return pathname
  if (pathname === base) return '/'
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || '/'
  return pathname
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
