import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from './useSettings'

type Ctx = {
  /** True only when the device has a Hebrew voice. Otherwise speech UI is hidden. */
  supported: boolean
  speaking: boolean
  speak: (text: string) => void
  stop: () => void
  /** Text the current screen wants read aloud. */
  screenText: string
  setScreenText: (text: string) => void
}

const SpeechContext = createContext<Ctx | null>(null)

const hasSynth = () => typeof window !== 'undefined' && 'speechSynthesis' in window

function findHebrewVoice(): SpeechSynthesisVoice | null {
  if (!hasSynth()) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('he')) ?? null
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(findHebrewVoice)
  const [speaking, setSpeaking] = useState(false)
  const [screenText, setScreenText] = useState('')
  const location = useLocation()
  const rateRef = useRef(settings.speechRate)
  rateRef.current = settings.speechRate

  useEffect(() => {
    if (!hasSynth()) return
    const update = () => setVoice(findHebrewVoice())
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  const stop = useCallback(() => {
    if (!hasSynth()) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!voice || !text.trim()) return
      const synth = window.speechSynthesis
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'he-IL'
      u.voice = voice
      u.rate = rateRef.current
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      setSpeaking(true)
      synth.speak(u)
    },
    [voice],
  )

  // Leaving a screen stops whatever it was reading.
  useEffect(() => stop, [location.pathname, location.search, stop])

  // Auto-read new screen content when the setting is on.
  useEffect(() => {
    if (settings.autoSpeak && screenText) speak(screenText)
  }, [screenText, settings.autoSpeak, speak])

  return (
    <SpeechContext.Provider value={{ supported: !!voice, speaking, speak, stop, screenText, setScreenText }}>
      {children}
    </SpeechContext.Provider>
  )
}

export function useSpeech() {
  const ctx = useContext(SpeechContext)
  if (!ctx) throw new Error('useSpeech outside SpeechProvider')
  return ctx
}

/** Register what the "הקרא לי" button should read on this screen. */
export function useScreenText(text: string) {
  const { setScreenText } = useSpeech()
  useEffect(() => {
    setScreenText(text)
  }, [text, setScreenText])
}
