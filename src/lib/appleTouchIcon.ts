const ICON_SIZE = 180
const LINK_SELECTOR = 'link[rel="apple-touch-icon"]'
const DEFAULT_ICON = `${import.meta.env.BASE_URL}favicon.svg`

let iconVersion = 0

export function updateDynamicAppleTouchIcon(title: string, streakCount: number) {
  const version = ++iconVersion
  const paint = () => {
    if (version !== iconVersion) return
    const canvas = document.createElement('canvas')
    canvas.width = ICON_SIZE
    canvas.height = ICON_SIZE
    const context = canvas.getContext('2d')
    if (!context) return

    drawIcon(context, title, streakCount)
    setAppleTouchIcon(canvas.toDataURL('image/png'))
  }

  paint()
  void document.fonts?.ready.then(paint)
}

export function resetAppleTouchIcon() {
  iconVersion += 1
  setAppleTouchIcon(DEFAULT_ICON)
}

function setAppleTouchIcon(href: string) {
  let link = document.querySelector<HTMLLinkElement>(LINK_SELECTOR)
  if (!link) {
    link = document.createElement('link')
    link.rel = 'apple-touch-icon'
    document.head.appendChild(link)
  }
  link.sizes = '180x180'
  link.href = href
}

function drawIcon(context: CanvasRenderingContext2D, title: string, streakCount: number) {
  context.clearRect(0, 0, ICON_SIZE, ICON_SIZE)
  context.fillStyle = '#000000'
  context.fillRect(0, 0, ICON_SIZE, ICON_SIZE)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '112px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  context.fillText('🔥', ICON_SIZE / 2, 74)

  const label = String(streakCount)
  context.font = `700 ${numberSize(label)}px Outfit, ui-sans-serif, system-ui, sans-serif`
  context.fillStyle = '#fbbf24'
  context.shadowColor = 'rgba(251, 191, 36, 0.55)'
  context.shadowBlur = 14
  context.fillText(label, ICON_SIZE / 2, 86)
  context.shadowBlur = 0

  context.font = '600 16px Outfit, ui-sans-serif, system-ui, sans-serif'
  context.fillStyle = '#f4f4f5'
  context.textBaseline = 'alphabetic'
  context.fillText(truncateText(context, title.trim(), 148), ICON_SIZE / 2, 164)
}

function numberSize(label: string) {
  if (label.length <= 2) return 72
  if (label.length === 3) return 54
  return 40
}

function truncateText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (!text) return ''
  if (context.measureText(text).width <= maxWidth) return text
  const ellipsis = '…'
  let trimmed = text
  while (trimmed.length > 0 && context.measureText(`${trimmed}${ellipsis}`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1)
  }
  return `${trimmed.trimEnd()}${ellipsis}`
}
