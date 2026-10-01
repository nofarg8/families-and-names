import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { Icon } from './Icon'
import { SpeakButton } from './SpeakButton'

/** Fixed top bar: Home and Back always in the same place, plus read-aloud. */
export function HomeBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const atHome = pathname === '/'

  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <header className="homebar">
      <nav className="homebar-inner" aria-label="ניווט">
        {atHome ? (
          <>
            <button type="button" className="homebar-btn" onClick={() => navigate('/settings')}>
              <Icon name="settings" />
              <span>{t('nav.settings')}</span>
            </button>
            <div className="homebar-spacer" />
          </>
        ) : (
          <>
            <button type="button" className="homebar-btn" onClick={() => navigate('/')}>
              <Icon name="home" />
              <span>{t('nav.home')}</span>
            </button>
            <button type="button" className="homebar-btn" onClick={goBack}>
              <Icon name="back" />
              <span>{t('nav.back')}</span>
            </button>
          </>
        )}
        <SpeakButton />
      </nav>
    </header>
  )
}
