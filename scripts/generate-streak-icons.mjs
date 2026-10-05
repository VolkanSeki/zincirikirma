import { access, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fontFile = join(root, 'scripts/fonts/Outfit-Bold.ttf')
const iconDir = join(root, 'public/streak-icons/v2')
const defaultIcon = join(root, 'public/apple-touch-icon.png')
const MAX_STREAK = 999

const font = {
  fontFiles: [fontFile],
  loadSystemFonts: false,
  defaultFontFamily: 'Outfit',
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const FLAME = `<g transform="translate(14, 6) scale(4.22)">
  <path fill="#F4900C" d="M35 19c0-2.062-.367-4.039-1.04-5.868-.46 5.389-3.333 8.157-6.335 6.868-2.812-1.208-.917-5.917-.777-8.164.236-3.809-.012-8.169-6.931-11.794 2.875 5.5.333 8.917-2.333 9.125-2.958.231-5.667-2.542-4.667-7.042-3.238 2.386-3.332 6.402-2.333 9 1.042 2.708-.042 4.958-2.583 5.208-2.84.28-4.418-3.041-2.963-8.333C2.52 10.965 1 14.805 1 19c0 9.389 7.611 17 17 17s17-7.611 17-17z"/>
  <path fill="#FFCC4D" d="M28.394 23.999c.148 3.084-2.561 4.293-4.019 3.709-2.106-.843-1.541-2.291-2.083-5.291s-2.625-5.083-5.708-6c2.25 6.333-1.247 8.667-3.08 9.084-1.872.426-3.753-.001-3.968-4.007C7.352 23.668 6 26.676 6 30c0 .368.023.73.055 1.09C9.125 34.124 13.342 36 18 36s8.875-1.876 11.945-4.91c.032-.36.055-.722.055-1.09 0-2.187-.584-4.236-1.606-6.001z"/>
</g>`

function numberSize(label) {
  if (label.length >= 3) return 64
  if (label.length === 2) return 84
  return 100
}

function streakSvg(count) {
  const label = String(count)
  const size = numberSize(label)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#000000"/>
  ${FLAME}
  <text x="90" y="108" text-anchor="middle" dominant-baseline="central" font-family="Outfit" font-size="${size}" font-weight="700" fill="#fbbf24" stroke="#1c0a00" stroke-width="8" paint-order="stroke fill" stroke-linejoin="round">${label}</text>
</svg>`
}

function defaultSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#000000"/>
  <path d="M50 50 L130 130 M130 50 L50 130" stroke="#fbbf24" stroke-width="16" stroke-linecap="round"/>
</svg>`
}

function renderPng(svg) {
  const resvg = new Resvg(svg, { font, fitTo: { mode: 'width', value: 180 } })
  return resvg.render().asPng()
}

const complete = join(iconDir, `${MAX_STREAK}.png`)
if ((await exists(complete)) && (await exists(defaultIcon)) && process.env.FORCE_ICONS !== '1') {
  process.exit(0)
}

await mkdir(iconDir, { recursive: true })
await writeFile(defaultIcon, renderPng(defaultSvg()))

for (let count = 0; count <= MAX_STREAK; count += 1) {
  await writeFile(join(iconDir, `${count}.png`), renderPng(streakSvg(count)))
}
