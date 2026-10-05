self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'badge' || typeof data.count !== 'number') return
  const count = data.count
  const task = count > 0 ? self.navigator.setAppBadge?.(count) : self.navigator.clearAppBadge?.()
  task?.catch(() => {})
})
