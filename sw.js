self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.pathname.endsWith('/manifest.json')) {
    event.respondWith(seriesManifest(url))
    return
  }
  if (event.request.mode !== 'navigate') return
  event.respondWith(fetch(event.request))
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'badge' || typeof data.count !== 'number') return
  const count = data.count
  const task = count > 0 ? self.navigator.setAppBadge?.(count) : self.navigator.clearAppBadge?.()
  task?.catch(() => {})
})

function seriesManifest(url) {
  const series = url.searchParams.get('series') || ''
  const safeSeries = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(series) ? series : ''
  const rawTitle = (url.searchParams.get('title') || '').trim()
  const title = (safeSeries && rawTitle ? rawTitle : 'Zinciri Kırma').slice(0, 40)
  const scope = new URL('./', self.registration.scope)
  const start = new URL(scope.href)
  if (safeSeries) start.searchParams.set('series', safeSeries)
  const startUrl = `${start.pathname}${start.search}`
  const body = {
    id: safeSeries ? startUrl : `${scope.pathname}`,
    name: title,
    short_name: title,
    start_url: safeSeries ? startUrl : './',
    scope: scope.pathname,
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'tr',
    icons: [
      {
        src: 'apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-store',
    },
  })
}
