import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ActionBar } from '../components/ActionBar'
import { BigButton } from '../components/BigButton'
import { storyQuestions } from '../data/types'
import { useScreenText } from '../hooks/useSpeech'
import { useStoryAnswers, type StoryAnswer } from '../hooks/useStore'
import { t } from '../i18n'

export function MyStory() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [answers, saveAnswers, loaded] = useStoryAnswers()
  const q = params.get('q')
  const editing = params.get('edit') === '1'
  const index = q === null ? -1 : Math.min(Math.max(Number(q) || 0, 0), storyQuestions.length - 1)

  if (!loaded) return <main className="screen" />

  if (index < 0) {
    const answeredCount = Object.keys(answers).length
    const firstOpen = storyQuestions.findIndex((sq) => !answers[sq.id])
    return (
      <Intro
        hasAnswers={answeredCount > 0}
        onStart={() => navigate(`/story?q=${answeredCount > 0 && firstOpen >= 0 ? firstOpen : 0}`)}
        onBook={() => navigate('/book')}
      />
    )
  }

  const question = storyQuestions[index]
  const goNext = () => {
    if (editing) navigate('/book', { replace: true })
    else if (index < storyQuestions.length - 1) navigate(`/story?q=${index + 1}`)
    else navigate('/book')
  }

  return (
    <QuestionStep
      key={question.id}
      index={index}
      existing={answers[question.id]}
      onSave={async (text) => {
        if (text) {
          await saveAnswers((all) => ({
            ...all,
            [question.id]: { questionId: question.id, text, updatedAt: new Date().toISOString() },
          }))
        }
        goNext()
      }}
      onSkip={goNext}
    />
  )
}

function Intro({ hasAnswers, onStart, onBook }: { hasAnswers: boolean; onStart: () => void; onBook: () => void }) {
  useScreenText([t('story.intro.title'), t('story.intro.body')].join('. '))
  return (
    <main className="screen">
      <div className="home-header">
        <h1>{t('story.intro.title')}</h1>
        <p>{t('story.intro.body')}</p>
      </div>
      <ActionBar>
        <BigButton icon="story" onClick={onStart}>
          {hasAnswers ? t('story.intro.continue') : t('story.intro.start')}
        </BigButton>
        {hasAnswers && (
          <BigButton variant="secondary" icon="book" onClick={onBook}>
            {t('story.toBook')}
          </BigButton>
        )}
      </ActionBar>
    </main>
  )
}

function QuestionStep({
  index,
  existing,
  onSave,
  onSkip,
}: {
  index: number
  existing?: StoryAnswer
  onSave: (text: string) => void
  onSkip: () => void
}) {
  const question = storyQuestions[index]
  const [text, setText] = useState(existing?.text ?? '')
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [])

  useScreenText(question.text)

  return (
    <main className="screen">
      <p className="progress">{t('story.progress', { n: index + 1, total: storyQuestions.length })}</p>
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
