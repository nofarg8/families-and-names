import { useSpeech } from '../hooks/useSpeech'
import { t } from '../i18n'
import { Icon } from './Icon'

/** Reads the current screen. Renders nothing if the device has no Hebrew voice. */
export function SpeakButton() {
  const { supported, speaking, speak, stop, screenText } = useSpeech()
  if (!supported) return <div className="homebar-spacer" />
  return (
    <button
      type="button"
      className="homebar-btn"
      aria-pressed={speaking}
      onClick={() => (speaking ? stop() : speak(screenText))}
    >
      <Icon name={speaking ? 'stop' : 'speaker'} />
      <span>{speaking ? t('speak.stop') : t('speak.start')}</span>
    </button>
  )
}
