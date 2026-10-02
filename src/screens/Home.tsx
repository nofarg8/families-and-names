import { useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { useSettings } from '../hooks/useSettings'
import { useScreenText } from '../hooks/useSpeech'
import { useStoryAnswers } from '../hooks/useStore'
import { t } from '../i18n'

function greeting(hour: number) {
  if (hour >= 5 && hour < 12) return t('greeting.morning')
  if (hour >= 12 && hour < 17) return t('greeting.noon')
  if (hour >= 17 && hour < 22) return t('greeting.evening')
  return t('greeting.night')
}

type Module = { to: string; icon: IconName; title: string; hint: string; variant: 'primary' | 'secondary' }

export function Home() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [answers] = useStoryAnswers()
  const name = settings.userName?.trim()
  const hello = name ? `${greeting(new Date().getHours())}, ${name}` : greeting(new Date().getHours())

  const modules: Module[] = [
    { to: '/names', icon: 'names', title: t('home.names'), hint: t('home.names.hint'), variant: 'primary' },
    { to: '/truefalse', icon: 'check', title: t('home.tf'), hint: t('home.tf.hint'), variant: 'primary' },
    { to: '/story', icon: 'story', title: t('home.story'), hint: t('home.story.hint'), variant: 'primary' },
  ]
  if (Object.keys(answers).length > 0) {
    modules.push({ to: '/book', icon: 'book', title: t('home.book'), hint: t('home.book.hint'), variant: 'secondary' })
  }

  useScreenText([hello, t('home.subtitle'), ...modules.map((m) => m.title)].join('. '))

  return (
    <main className="screen">
      <div className="home-header">
        <div className="ornament" aria-hidden="true" />
        <h1>{hello}</h1>
        <p className="muted">{t('home.subtitle')}</p>
      </div>

      <nav className="choices" aria-label={t('home.subtitle')}>
        {modules.map((m) => (
          <button key={m.to} type="button" className={`btn btn-${m.variant} module-btn`} onClick={() => navigate(m.to)}>
            <Icon name={m.icon} />
            <span className="module-text">
              <span>{m.title}</span>
              <span className="module-hint">{m.hint}</span>
            </span>
          </button>
        ))}
      </nav>
    </main>
  )
}
