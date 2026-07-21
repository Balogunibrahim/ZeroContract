import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Keep the installed (home-screen) app up to date without a reinstall.
// Check for a new service worker whenever the app is opened or brought to the
// foreground, and reload once the new version takes control.
if ('serviceWorker' in navigator) {
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
  const checkForUpdate = () =>
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg && reg.update())
      .catch(() => {})
  window.addEventListener('focus', checkForUpdate)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
  checkForUpdate()
}
