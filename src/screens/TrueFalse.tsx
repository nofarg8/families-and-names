import { useEffect, useRef, useState } from 'react'
import { ActionBar } from '../components/ActionBar'
import { BigButton } from '../components/BigButton'
import { Card } from '../components/Card'
import { Celebration } from '../components/Celebration'
import { ChoiceButton } from '../components/ChoiceButton'
import { Icon } from '../components/Icon'
import { Status } from '../components/Status'
import { drawRound } from '../game/statements'
import { useSettings } from '../hooks/useSettings'
import { useScreenText } from '../hooks/useSpeech'
import { t } from '../i18n'
import { shareText } from '../share'
import { playChime } from '../sound'
import { sourceLabel } from '../sources'

const ROUND_SIZE = 8

export function TrueFalse() {
  const { settings } = useSettings()
  const [round, setRound] = useState(() => drawRound(ROUND_SIZE))
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<boolean | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState('')
  const feedbackRef = useRef<HTMLHeadingElement>(null)
  const topRef = useRef<HTMLHeadingElement>(null)

  const item = round[index]
  const isLast = index === round.length - 1
  const correct = chosen !== null && chosen === item?.answer
  const score = results.filter(Boolean).length

  useEffect(() => {
    if (chosen !== null) feedbackRef.current?.focus()
  }, [chosen])

  useEffect(() => {
    window.scrollTo(0, 0)
    topRef.current?.focus()
  }, [index, done])

  const choose = (value: boolean) => {
    if (chosen !== null) return
    const isRight = value === item.answer
    setChosen(value)
    setResults((r) => [...r, isRight])
    if (isRight && settings.sound) playChime()
  }

  const next = () => {
    if (isLast) setDone(true)
    else {
      setIndex((i) => i + 1)
      setChosen(null)
    }
  }

  const restart = () => {
    setRound(drawRound(ROUND_SIZE))
    setIndex(0)
    setChosen(null)
    setResults([])
    setDone(false)
    setStatus('')
  }

  const share = async () => {
    setStatus(await shareText(t('appName'), t('tf.share.text', { n: score, total: round.length })))
  }

  const answerWord = (v: boolean) => (v ? t('tf.true') : t('tf.false'))

  const doneTitle = score > 0 ? t('tf.done.title', { n: score, total: round.length }) : t('tf.done.titleZero')
  const doneBody = score >= round.length - 2 ? t('tf.done.great') : t('tf.done.good')

  useScreenText(
    !item
      ? ''
      : done
        ? [doneTitle, doneBody].join('. ')
        : chosen !== null
          ? [correct ? t('tf.right') : t('tf.almost'), t('tf.theAnswer', { answer: answerWord(item.answer) }), item.explanation].join(' ')
          : [t('tf.question'), item.text].join(' '),
  )

  if (!item) {
    return (
      <main className="screen">
        <h1>{t('tf.title')}</h1>
        <p>{t('tf.empty')}</p>
      </main>
    )
  }

  if (done) {
    return (
      <main className="screen">
        <div className="home-header celebrate-anchor">
          {score > 0 && <Celebration />}
          <div className="ornament" aria-hidden="true" />
          <h1 ref={topRef} tabIndex={-1}>
            {doneTitle}
          </h1>
          <p>{doneBody}</p>
        </div>
        <div className="tf-dots" aria-hidden="true">
          {results.map((r, i) => (
            <span key={i} className={r ? 'tf-dot right' : 'tf-dot'} />
          ))}
        </div>
        <Status message={status} />
        <ActionBar>
          <BigButton icon="again" onClick={restart}>
            {t('tf.again')}
          </BigButton>
          <BigButton variant="secondary" icon="share" onClick={share}>
            {t('names.done.share')}
          </BigButton>
        </ActionBar>
      </main>
    )
  }

  return (
    <main className="screen">
      <p className="progress">{t('tf.progress', { n: index + 1, total: round.length })}</p>
      <h1 ref={topRef} tabIndex={-1} className="visually-hidden">
        {t('tf.title')}
      </h1>
      <Card className="tf-statement">
        <p className="card-label">{t('tf.question')}</p>
        <p className="tf-text">{item.text}</p>
      </Card>

      {chosen === null ? (
        <div className="choices two-col" role="group" aria-label={t('tf.question')}>
          <ChoiceButton onClick={() => choose(true)}>{t('tf.true')}</ChoiceButton>
          <ChoiceButton onClick={() => choose(false)}>{t('tf.false')}</ChoiceButton>
        </div>
      ) : (
        <>
          <Card className={`celebrate-anchor ${correct ? 'tf-right' : ''}`}>
            {correct && <Celebration key={index} />}
            <h2 ref={feedbackRef} tabIndex={-1} className="feedback-head">
              <Icon name={correct ? 'check' : 'idea'} />
              <span>{correct ? t('tf.right') : t('tf.almost')}</span>
            </h2>
            <p>
              <strong>{t('tf.theAnswer', { answer: answerWord(item.answer) })}</strong>
            </p>
            <p>{item.explanation}</p>
            {item.sources?.length ? (
              <p className="small muted">
                {t('names.sources', { sources: [...new Set(item.sources.map((s) => sourceLabel(s.url)))].join(', ') })}
              </p>
            ) : null}
          </Card>
          <ActionBar>
            <BigButton icon="next" onClick={next}>
              {isLast ? t('names.finish') : t('names.next')}
            </BigButton>
          </ActionBar>
        </>
      )}
    </main>
  )
}
