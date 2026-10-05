import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadBadge(
  options: {
    supported?: boolean
    ios?: boolean
    standalone?: boolean
    permission?: NotificationPermission
    userGesture?: boolean
    setAppBadge?: () => Promise<void>
  } = {},
) {
  vi.resetModules()

  const setAppBadge = vi.fn(options.setAppBadge ?? (async () => undefined))
  const clearAppBadge = vi.fn(async () => undefined)
  const requestPermission = vi.fn(async () => 'granted' as NotificationPermission)
  const navigatorMock: Record<string, unknown> = {
    userAgent: options.ios ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' : 'Mozilla/5.0',
    platform: 'MacIntel',
    maxTouchPoints: options.ios ? 5 : 0,
    standalone: options.standalone ?? false,
    userActivation: { isActive: options.userGesture ?? true, hasBeenActive: true },
  }

  if (options.supported !== false) {
    navigatorMock.setAppBadge = setAppBadge
    navigatorMock.clearAppBadge = clearAppBadge
  }

  vi.stubGlobal('navigator', navigatorMock)
  if (options.permission) {
    vi.stubGlobal('Notification', {
      permission: options.permission,
      requestPermission,
    })
  }

  const { setBadgeCount } = await import('./badge.ts')
  return { setBadgeCount, setAppBadge, clearAppBadge, requestPermission }
}

async function settle(): Promise<void> {
  for (let step = 0; step < 8; step += 1) await Promise.resolve()
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('setBadgeCount', () => {
  it('does nothing when the Badging API is missing', async () => {
    const { setBadgeCount, setAppBadge } = await loadBadge({ supported: false })
    setBadgeCount(4)
    await settle()
    expect(setAppBadge).not.toHaveBeenCalled()
  })

  it('sets a positive count and clears zero', async () => {
    const badge = await loadBadge()
    badge.setBadgeCount(6)
    await settle()
    expect(badge.setAppBadge).toHaveBeenCalledWith(6)

    badge.setBadgeCount(0)
    await settle()
    expect(badge.clearAppBadge).toHaveBeenCalledOnce()
  })

  it('swallows badge API failures', async () => {
    const { setBadgeCount } = await loadBadge({
      setAppBadge: async () => {
        throw new Error('badge rejected')
      },
    })
    setBadgeCount(2)
    await settle()
  })

  it('asks for notification permission on an iOS home screen app before badging', async () => {
    const badge = await loadBadge({
      ios: true,
      standalone: true,
      permission: 'default',
      userGesture: true,
    })
    badge.setBadgeCount(3)
    await settle()
    expect(badge.requestPermission).toHaveBeenCalledOnce()
    expect(badge.setAppBadge).toHaveBeenCalledWith(3)
  })

  it('sets the badge directly when iOS notification permission is already granted', async () => {
    const badge = await loadBadge({
      ios: true,
      standalone: true,
      permission: 'granted',
      userGesture: false,
    })
    badge.setBadgeCount(8)
    await settle()
    expect(badge.requestPermission).not.toHaveBeenCalled()
    expect(badge.setAppBadge).toHaveBeenCalledWith(8)
  })

  it('does not prompt or badge without a user gesture when iOS permission is still undecided', async () => {
    const badge = await loadBadge({
      ios: true,
      standalone: true,
      permission: 'default',
      userGesture: false,
    })
    badge.setBadgeCount(5)
    await settle()
    expect(badge.requestPermission).not.toHaveBeenCalled()
    expect(badge.setAppBadge).not.toHaveBeenCalled()
  })
})
