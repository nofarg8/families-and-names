import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type TextSize = 1 | 1.25 | 1.5

export type Settings = {
  textSize: TextSize
  userName?: string
  autoSpeak: boolean
  speechRate: 0.8 | 1
  sound: boolean
}

const KEY = 'maeifo-banu:settings'
const DEFAULTS: Settings = { textSize: 1, autoSpeak: false, speechRate: 1, sound: true }

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

type Ctx = { settings: Settings; update: (patch: Partial<Settings>) => void }
const SettingsContext = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(settings.textSize))
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      // Storage unavailable: settings still work for this visit.
    }
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), [])

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings outside SettingsProvider')
  return ctx
}
