import { useEffect, useState } from 'react'
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

type PdfState = { state: 'idle' } | { state: 'working' } | { state: 'ready'; file: File; pages: number }

export function FamilyBook() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [answers, saveAnswers, loaded] = useStoryAnswers()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [pdf, setPdf] = useState<PdfState>({ state: 'idle' })

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

  // Any change to the answers makes a prepared PDF stale.
  useEffect(() => setPdf({ state: 'idle' }), [answers])

  const makePdf = async () => {
    setStatus('')
    setPdf({ state: 'working' })
    try {
      const { buildFamilyBookPdf } = await import('../pdf/familyBookPdf')
      const name = settings.userName?.trim()
      const { blob, pages } = await buildFamilyBookPdf({
        title: t('book.title'),
        subtitle: name ? t('pdf.subtitleNamed', { name }) : t('pdf.subtitle'),
        dateLine: new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }),
        footer: t('appName'),
        pageLabel: (n) => t('pdf.page', { n }),
        entries: entries.map((e) => ({
          question: e.q.text,
          answer: e.a.text,
          dateLine: t('pdf.written', { date: formatDate(e.a.updatedAt) }),
        })),
      })
      setPdf({ state: 'ready', file: new File([blob], t('pdf.fileName'), { type: 'application/pdf' }), pages })
    } catch {
      setPdf({ state: 'idle' })
      setStatus(t('pdf.failed'))
    }
  }

  const savePdf = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    setStatus(t('pdf.saved'))
  }

  // Sharing is its own tap: browsers only allow the share sheet right after a user action.
  const sendPdf = async (file: File) => {
    try {
      await navigator.share({ files: [file], title: t('book.title') })
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') savePdf(file)
    }
  }

  const canShareFile = pdf.state === 'ready' && !!navigator.canShare?.({ files: [pdf.file] })

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
          <Status message={pdf.state === 'ready' ? t('pdf.ready', { pages: pdf.pages }) : status} />
          <ActionBar>
            {pdf.state === 'ready' ? (
              <>
                {canShareFile && (
                  <BigButton icon="share" onClick={() => sendPdf(pdf.file)}>
                    {t('pdf.send')}
                  </BigButton>
                )}
                <BigButton
                  variant={canShareFile ? 'secondary' : 'primary'}
                  icon="download"
                  onClick={() => savePdf(pdf.file)}
                >
                  {t('pdf.save')}
                </BigButton>
              </>
            ) : (
              <>
                <BigButton icon="book" onClick={makePdf} disabled={pdf.state === 'working'} aria-busy={pdf.state === 'working'}>
                  {pdf.state === 'working' ? t('pdf.working') : t('pdf.make')}
                </BigButton>
                <BigButton variant="secondary" icon="share" onClick={share}>
                  {t('book.shareText')}
                </BigButton>
              </>
            )}
          </ActionBar>
        </>
      )}
    </main>
  )
}
