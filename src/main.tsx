import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/assistant/500.css'
import '@fontsource/assistant/700.css'
import '@fontsource/frank-ruhl-libre/700.css'
import './styles/tokens.css'
import './styles/global.css'
import { App } from './App'
import { SettingsProvider } from './hooks/useSettings'

registerSW({ immediate: true })

// Ask the browser not to evict the family stories when space runs low.
navigator.storage?.persist?.().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
