import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { appBasePath, seriesLaunchPath } from './lib/homeScreen.ts'

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) void registration.unregister()
  })
}
const badges = navigator as Navigator & { clearAppBadge?: () => Promise<void> }
void badges.clearAppBadge?.().catch(() => undefined)

const seriesPath = seriesLaunchPath(window.location.href, appBasePath())
if (seriesPath) {
  window.location.replace(seriesPath)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
