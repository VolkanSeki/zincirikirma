const LINK_SELECTOR = 'link[rel="apple-touch-icon"]'
const DEFAULT_ICON = `${import.meta.env.BASE_URL}apple-touch-icon.png`
const MAX_STREAK_ICON = 999

// iOS "Ana Ekrana Ekle" data: ve SVG ikonları yok sayar, başlığın ilk harfini basar.
// Sayaç bu yüzden sitede duran gerçek bir PNG adresine bağlanır.
export function updateDynamicAppleTouchIcon(_title: string, streakCount: number) {
  const count = Math.min(MAX_STREAK_ICON, Math.max(0, Math.trunc(streakCount) || 0))
  setAppleTouchIcon(`${import.meta.env.BASE_URL}streak-icons/v2/${count}.png`)
}

export function resetAppleTouchIcon() {
  setAppleTouchIcon(DEFAULT_ICON)
}

function setAppleTouchIcon(href: string) {
  const absolute = new URL(href, document.baseURI).href
  let link = document.querySelector<HTMLLinkElement>(LINK_SELECTOR)
  if (!link) {
    link = document.createElement('link')
    link.rel = 'apple-touch-icon'
    document.head.appendChild(link)
  }
  link.type = 'image/png'
  link.sizes = '180x180'
  link.href = absolute
}
