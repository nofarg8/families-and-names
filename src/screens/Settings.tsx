import { Card } from '../components/Card'
import { ChoiceButton } from '../components/ChoiceButton'
import { useSettings, type TextSize } from '../hooks/useSettings'
import { useScreenText, useSpeech } from '../hooks/useSpeech'
import { t } from '../i18n'

const sizes: { value: TextSize; label: string }[] = [
  { value: 1, label: t('settings.textSize.normal') },
  { value: 1.25, label: t('settings.textSize.large') },
  { value: 1.5, label: t('settings.textSize.xlarge') },
]

export function Settings() {
  const { settings, update } = useSettings()
  const { supported } = useSpeech()

  useScreenText([t('settings.title'), t('settings.textSize'), t('settings.name')].join('. '))

  return (
    <main className="screen">
      <h1>{t('settings.title')}</h1>

      <section className="stack" aria-labelledby="size-h">
        <h2 id="size-h">{t('settings.textSize')}</h2>
        <div className="choices" role="group" aria-labelledby="size-h">
          {sizes.map((s) => (
            <ChoiceButton key={s.value} selected={settings.textSize === s.value} onClick={() => update({ textSize: s.value })}>
              {s.label}
            </ChoiceButton>
          ))}
        </div>
        <Card>
          <p>{t('settings.preview')}</p>
        </Card>
      </section>

      <section className="stack">
        <h2>
          <label htmlFor="user-name">{t('settings.name')}</label>
        </h2>
        <p className="muted small" id="name-hint">
          {t('settings.name.hint')}
        </p>
        <input
          id="user-name"
          className="text-input"
          type="text"
          autoComplete="given-name"
          aria-describedby="name-hint"
          value={settings.userName ?? ''}
          onChange={(e) => update({ userName: e.target.value })}
        />
      </section>

      {supported && (
        <>
          <section className="stack" aria-labelledby="auto-h">
            <h2 id="auto-h">{t('settings.autoSpeak')}</h2>
            <div className="choices" role="group" aria-labelledby="auto-h">
              <ChoiceButton selected={settings.autoSpeak} onClick={() => update({ autoSpeak: true })}>
                {t('settings.yes')}
              </ChoiceButton>
              <ChoiceButton selected={!settings.autoSpeak} onClick={() => update({ autoSpeak: false })}>
                {t('settings.no')}
              </ChoiceButton>
            </div>
          </section>

          <section className="stack" aria-labelledby="rate-h">
            <h2 id="rate-h">{t('settings.rate')}</h2>
            <div className="choices" role="group" aria-labelledby="rate-h">
              <ChoiceButton selected={settings.speechRate === 0.8} onClick={() => update({ speechRate: 0.8 })}>
                {t('settings.rate.slow')}
              </ChoiceButton>
              <ChoiceButton selected={settings.speechRate === 1} onClick={() => update({ speechRate: 1 })}>
                {t('settings.rate.normal')}
              </ChoiceButton>
            </div>
          </section>
        </>
      )}

      <p className="muted small" style={{ paddingBottom: 24 }}>
        {t('settings.privacy')}
      </p>
    </main>
  )
}
