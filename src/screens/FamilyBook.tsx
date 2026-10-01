import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionBar } from '../components/ActionBar'
import { BigButton } from '../components/BigButton'
import { Card } from '../components/Card'
import { Status } from '../components/Status'
import { storyQuestions } from '../data/types'
import { useSettings } from '../hooks/useSettings'
import { useScreenText } from '../hooks/useSpeech'
import { useStoryAnswers } from '../hooks/useStore'
import { t } from '../i18n'
import { shareText } from '../share'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

export function FamilyBook() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [answers, saveAnswers, loaded] = useStoryAnswers()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const entries = storyQuestions
    .map((q, index) => ({ q, index, a: answers[q.id] }))
    .filter((e) => e.a)

  const title = settings.userName?.trim() ? `${t('book.title')}: ${settings.userName.trim()}` : t('book.title')

  useScreenText(
    entries.length
      ? [title, ...entries.map((e) => `${e.q.text} ${e.a.text}`)].join('. ')
      : [title, t('book.empty')].join('. '),
  )

  const share = async () => {
    const body = entries.map((e) => `${e.q.text}\n${e.a.text}`).join('\n\n')
    setStatus(await shareText(title, `${title}\n\n${body}`))
  }

  const remove = async (id: string) => {
    await saveAnswers((all) => {
      const next = { ...all }
      delete next[id]
      return next
    })
    setConfirming(null)
    setStatus(t('book.deleted'))
  }

  if (!loaded) return <main className="screen" />

  return (
    <main className="screen">
      <h1>{title}</h1>

      {entries.length === 0 ? (
        <>
          <p>{t('book.empty')}</p>
          <ActionBar>
            <BigButton icon="story" onClick={() => navigate('/story')}>
              {t('book.startStory')}
            </BigButton>
          </ActionBar>
        </>
      ) : (
        <>
          {entries.map(({ q, index, a }) => (
            <Card key={q.id} className="book-entry">
              <h2 className="question-text">{q.text}</h2>
              <p className="answer">{a.text}</p>
              <p className="small muted">{t('book.updated', { date: formatDate(a.updatedAt) })}</p>
              {confirming === q.id ? (
                <div className="stack">
                  <p>
                    <strong>{t('book.confirmDelete')}</strong>
                  </p>
                  <div className="inline-actions">
                    <BigButton onClick={() => remove(q.id)}>{t('book.confirmYes')}</BigButton>
                    <BigButton variant="secondary" onClick={() => setConfirming(null)}>
                      {t('book.confirmNo')}
                    </BigButton>
                  </div>
                </div>
              ) : (
                <div className="inline-actions">
                  <BigButton variant="secondary" icon="edit" onClick={() => navigate(`/story?q=${index}&edit=1`)}>
                    {t('book.edit')}
                  </BigButton>
                  <BigButton
                    variant="secondary"
                    icon="trash"
                    onClick={() => {
                      setStatus('')
                      setConfirming(q.id)
                    }}
                  >
                    {t('book.delete')}
                  </BigButton>
                </div>
              )}
            </Card>
          ))}
          <Status message={status} />
          <ActionBar>
            <BigButton icon="share" onClick={share}>
              {t('book.share')}
            </BigButton>
          </ActionBar>
        </>
      )}
    </main>
  )
}
