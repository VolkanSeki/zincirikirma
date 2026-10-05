type BadgingNavigator = Navigator & {
  setAppBadge: (contents?: number) => Promise<void>
  clearAppBadge: () => Promise<void>
  standalone?: boolean
}

export type BadgeSupport = 'skip' | 'install' | 'prompt' | 'denied' | 'ready'

let desiredCount = 0
let tokenSeq = 0
let permissionRequest: Promise<NotificationPermission> | null = null
let promptArmed = false
let hooksInstalled = false

const listeners = new Set<() => void>()

// iOS ana ekran rozeti yalnızca bildirim izni verilmiş web uygulamasında görünür.
// İzin istemi kullanıcı jesti olmadan yutulur; jest yoksa bir sonraki dokunuşa bırakılır.
export function setBadgeCount(count: number): void {
  if (!badgeNavigator()) return
  installHooks()
  desiredCount = normalize(count)
  beginWrite()
}

export function enableBadge(count: number): Promise<boolean> {
  if (!badgeNavigator()) return Promise.resolve(false)
  installHooks()
  desiredCount = normalize(count)
  if (!iosNeedsPermission() || Notification.permission === 'granted') {
    beginWrite()
    return Promise.resolve(true)
  }
  if (Notification.permission === 'denied') return Promise.resolve(false)

  const pending = askPermission()
  if (!pending) return Promise.resolve(false)
  return pending.then((permission) => {
    notify()
    if (permission !== 'granted') return false
    beginWrite()
    return true
  })
}

export function badgeSupport(): BadgeSupport {
  if (typeof navigator === 'undefined' || !isIos()) return 'skip'
  if (!('setAppBadge' in navigator) || typeof Notification === 'undefined') return 'install'
  if (Notification.permission === 'granted') return 'ready'
  if (Notification.permission === 'denied') return 'denied'
  return 'prompt'
}

export function subscribeBadgeSupport(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function beginWrite(): void {
  const nav = badgeNavigator()
  if (!nav) return
  const value = desiredCount
  const token = ++tokenSeq
  const permission = permissionForBadge()

  void permission
    .then(async (allowed) => {
      if (!allowed || token !== tokenSeq) return
      if (value > 0) await nav.setAppBadge(value)
      else await nav.clearAppBadge()
      mirrorToServiceWorker(value)
    })
    .catch(() => undefined)
}

function permissionForBadge(): Promise<boolean> {
  if (!iosNeedsPermission()) return Promise.resolve(true)
  if (Notification.permission === 'granted') return Promise.resolve(true)
  if (Notification.permission === 'denied') return Promise.resolve(false)
  if (permissionRequest) return permissionRequest.then((permission) => permission === 'granted')
  if (!hasUserGesture()) {
    armPrompt()
    return Promise.resolve(false)
  }

  const pending = askPermission()
  return pending ? pending.then((permission) => permission === 'granted') : Promise.resolve(false)
}

function askPermission(): Promise<NotificationPermission> | null {
  try {
    permissionRequest ??= Notification.requestPermission().finally(() => {
      permissionRequest = null
    })
    return permissionRequest
  } catch {
    return null
  }
}

function armPrompt(): void {
  if (promptArmed || typeof window === 'undefined') return
  promptArmed = true
  window.addEventListener(
    'pointerup',
    () => {
      promptArmed = false
      const pending = askPermission()
      if (!pending) return
      void pending.then((permission) => {
        notify()
        if (permission === 'granted') beginWrite()
        else if (Notification.permission === 'default') armPrompt()
      })
    },
    { capture: true, once: true },
  )
}

function installHooks(): void {
  if (hooksInstalled || typeof window === 'undefined') return
  hooksInstalled = true

  const refreshIfAllowed = () => {
    if (iosNeedsPermission() && Notification.permission !== 'granted') return
    beginWrite()
  }
  window.addEventListener('pagehide', refreshIfAllowed)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') refreshIfAllowed()
  })

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register(new URL('sw.js', document.baseURI).href).catch(() => undefined)
  }
}

function mirrorToServiceWorker(count: number): void {
  const ready = navigator.serviceWorker?.ready
  if (!ready) return
  void ready
    .then((registration) => {
      registration.active?.postMessage({ type: 'badge', count })
    })
    .catch(() => undefined)
}

function badgeNavigator(): BadgingNavigator | null {
  if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) return null
  return navigator as BadgingNavigator
}

function iosNeedsPermission(): boolean {
  return isIos() && typeof Notification !== 'undefined'
}

function hasUserGesture(): boolean {
  const activation = navigator.userActivation
  if (!activation) return true
  return activation.isActive
}

function isIos(): boolean {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function normalize(count: number): number {
  return Math.max(0, Math.trunc(count) || 0)
}

function notify(): void {
  listeners.forEach((listener) => listener())
}
