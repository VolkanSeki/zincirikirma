type BadgingNavigator = Navigator & {
  setAppBadge: (contents?: number) => Promise<void>
  clearAppBadge: () => Promise<void>
  standalone?: boolean
}

let desiredCount = 0
let tokenSeq = 0
let queue: Promise<void> = Promise.resolve()
let permissionRequest: Promise<boolean> | null = null
let gestureRetryArmed = false

// iOS ana ekran web uygulamaları rozeti yalnızca bildirim izni varken gösterir.
// İzin istemi kullanıcı jesti olmadan yutulduğu için jest yoksa bir sonraki tıklamaya bırakılır.
export function setBadgeCount(count: number): void {
  if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) return

  const nav = navigator as BadgingNavigator
  desiredCount = Math.max(0, Math.trunc(count) || 0)
  const value = desiredCount
  const token = ++tokenSeq
  const permission = permissionForBadge()

  queue = queue
    .catch(() => undefined)
    .then(async () => {
      if (token !== tokenSeq) return
      const allowed = await permission
      if (!allowed || token !== tokenSeq) return
      if (value > 0) await nav.setAppBadge(value)
      else await nav.clearAppBadge()
    })
    .catch(() => undefined)
}

function permissionForBadge(): Promise<boolean> {
  if (!isIosHomeScreen() || typeof Notification === 'undefined') return Promise.resolve(true)
  if (Notification.permission === 'granted') return Promise.resolve(true)
  if (Notification.permission === 'denied') return Promise.resolve(false)
  if (permissionRequest) return permissionRequest
  if (!hasUserGesture()) {
    armGestureRetry()
    return Promise.resolve(false)
  }

  try {
    permissionRequest = Notification.requestPermission()
      .then((permission) => permission === 'granted')
      .catch(() => false)
      .finally(() => {
        permissionRequest = null
      })
    return permissionRequest
  } catch {
    return Promise.resolve(false)
  }
}

function hasUserGesture(): boolean {
  const activation = navigator.userActivation
  if (!activation) return true
  return activation.isActive
}

function armGestureRetry(): void {
  if (gestureRetryArmed || typeof window === 'undefined') return
  gestureRetryArmed = true
  window.addEventListener(
    'click',
    () => {
      gestureRetryArmed = false
      setBadgeCount(desiredCount)
    },
    { once: true },
  )
}

function isIosHomeScreen(): boolean {
  return isIos() && isStandalone()
}

function isIos(): boolean {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function isStandalone(): boolean {
  if ((navigator as BadgingNavigator).standalone === true) return true
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  )
}
