import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ActionBar } from '../components/ActionBar'
import { BigButton } from '../components/BigButton'
import { allStoryQuestions, storyQuestions, type StoryQuestion } from '../data/types'
import { useScreenText } from '../hooks/useSpeech'
import { useStoryAnswers, type StoryAnswer } from '../hooks/useStore'
import { t } from '../i18n'

const PER_SESSION = 3

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Three random questions, unanswered ones first; answered ones refill once all are done. */
function drawSession(answers: Record<string, StoryAnswer>): string[] {
  const open = shuffle(storyQuestions.filter((q) => !answers[q.id]))
  const answered = shuffle(storyQuestions.filter((q) => answers[q.id]))
  return [...open, ...answered].slice(0, PER_SESSION).map((q) => q.id)
}

const byId = (id: string | null) => allStoryQuestions.find((q) => q.id === id)

/*
 * URLs:
 *   /story                     intro
 *   /story?s=q4,q17,q22&i=0    a session of three questions
 *   /story?s=...&done=1        end of session
 *   /story?q=q4&edit=1         edit one answer from the family book
 */
export function MyStory() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [answers, saveAnswers, loaded] = useStoryAnswers()

  if (!loaded) return <main className="screen" />

  const answeredCount = storyQuestions.filter((q) => answers[q.id]).length
  const startSession = () => navigate(`/story?s=${drawSession(answers).join(',')}&i=0`)

  const save = async (question: StoryQuestion, text: string) => {
    if (!text) return
    await saveAnswers((all) => ({
      ...all,
      [question.id]: { questionId: question.id, text, updatedAt: new Date().toISOString() },
    }))
  }

  const editQuestion = byId(params.get('q'))
  if (editQuestion && params.get('edit') === '1') {
    const back = () => navigate('/book', { replace: true })
    return (
      <QuestionStep
        key={editQuestion.id}
        question={editQuestion}
        existing={answers[editQuestion.id]}
        onSave={async (text) => {
          await save(editQuestion, text)
          back()
        }}
        onSkip={back}
      />
    )
  }

  const session = (params.get('s') ?? '').split(',').map(byId).filter((q): q is StoryQuestion => !!q)
  if (!session.length) {
    return <Intro answeredCount={answeredCount} onStart={startSession} onBook={() => navigate('/book')} />
  }

  if (params.get('done') === '1') {
    return <Done answeredCount={answeredCount} onAgain={startSession} onBook={() => navigate('/book')} />
  }

  const index = Math.min(Math.max(Number(params.get('i')) || 0, 0), session.length - 1)
  const question = session[index]
  const sessionParam = session.map((q) => q.id).join(',')
  const goNext = () =>
    navigate(index < session.length - 1 ? `/story?s=${sessionParam}&i=${index + 1}` : `/story?s=${sessionParam}&done=1`)

  return (
    <QuestionStep
      key={question.id}
      question={question}
      progress={t('story.progress', { n: index + 1, total: session.length })}
      existing={answers[question.id]}
      onSave={async (text) => {
        await save(question, text)
        goNext()
      }}
      onSkip={goNext}
    />
  )
}

function Intro({ answeredCount, onStart, onBook }: { answeredCount: number; onStart: () => void; onBook: () => void }) {
  const count = answeredCount > 0 ? t('story.intro.count', { n: answeredCount, total: storyQuestions.length }) : ''
  useScreenText([t('story.intro.title'), t('story.intro.body'), count].filter(Boolean).join('. '))
  return (
    <main className="screen">
      <div className="home-header">
        <h1>{t('story.intro.title')}</h1>
        <p>{t('story.intro.body')}</p>
        {count && <p className="muted">{count}</p>}
      </div>
      <ActionBar>
        <BigButton icon="story" onClick={onStart}>
          {t('story.intro.start')}
        </BigButton>
        {answeredCount > 0 && (
          <BigButton variant="secondary" icon="book" onClick={onBook}>
            {t('story.toBook')}
          </BigButton>
        )}
      </ActionBar>
    </main>
  )
}

function Done({ answeredCount, onAgain, onBook }: { answeredCount: number; onAgain: () => void; onBook: () => void }) {
  const body = t('story.done.body', { n: answeredCount, total: storyQuestions.length })
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [])
  useScreenText([t('story.done.title'), body].join('. '))
  return (
    <main className="screen">
      <div className="home-header">
        <div className="ornament" aria-hidden="true" />
        <h1 ref={headingRef} tabIndex={-1}>
          {t('story.done.title')}
        </h1>
        <p>{body}</p>
      </div>
      <ActionBar>
        <BigButton icon="book" onClick={onBook}>
          {t('story.toBook')}
        </BigButton>
        <BigButton variant="secondary" icon="again" onClick={onAgain}>
          {t('story.done.again')}
        </BigButton>
      </ActionBar>
    </main>
  )
}

function QuestionStep({
  question,
  progress,
  existing,
  onSave,
  onSkip,
}: {
  question: StoryQuestion
  progress?: string
  existing?: StoryAnswer
  onSave: (text: string) => void
  onSkip: () => void
}) {
  const [text, setText] = useState(existing?.text ?? '')
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [])

  useScreenText(question.text)

  return (
    <main className="screen">
      {progress && <p className="progress">{progress}</p>}
      <h1 ref={headingRef} tabIndex={-1} className="question-text">
        {question.text}
      </h1>
      <div>
        <label className="field-label" htmlFor="answer">
          {t('story.answerLabel')}
        </label>
        <textarea
          id="answer"
          className="text-area"
          rows={6}
          value={text}
          placeholder={t('story.placeholder')}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <ActionBar>
        <BigButton icon="check" onClick={() => onSave(text.trim())}>
          {t('story.save')}
        </BigButton>
        <BigButton variant="secondary" onClick={onSkip}>
          {t('story.skip')}
        </BigButton>
      </ActionBar>
    </main>
  )
}
