const SERIES_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const launchBasePath = detectBase(typeof window === 'undefined' ? 'http://localhost/' : window.location.href)

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
