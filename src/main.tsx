import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { appBasePath, seriesLaunchPath } from './lib/homeScreen.ts'

const seriesPath = seriesLaunchPath(window.location.href, appBasePath())
if (seriesPath) {
  window.location.replace(seriesPath)
} else {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register(new URL('sw.js', document.baseURI).href).catch(() => undefined)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
