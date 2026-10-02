import { useEffect, useRef, useState } from 'react'
import { ActionBar } from '../components/ActionBar'
import { AddNote } from '../components/AddNote'
import { BigButton } from '../components/BigButton'
import { Card } from '../components/Card'
import { ChoiceButton } from '../components/ChoiceButton'
import { Icon } from '../components/Icon'
import { Status } from '../components/Status'
import { communities, communityById, surnames, type Surname } from '../data/types'
import { useScreenText } from '../hooks/useSpeech'
import { t } from '../i18n'
import { shareText } from '../share'
import { sourceLabel } from '../sources'

const ROUNDS = 5
const OPTIONS = 3

type Round = { surname: Surname; options: string[] }


function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRounds(): Round[] {
  return shuffle(surnames)
    .slice(0, ROUNDS)
    .map((surname) => {
      // Never offer a community that shares the name's pattern (e.g. -ov for
      // Mountain Jews vs. Bukharan Jews): that would be an unfair question.
      const home = communityById(surname.community)
      const excluded = new Set([home.id, ...home.confusableWith])
      const others = shuffle(communities.filter((c) => !excluded.has(c.id)))
        .slice(0, OPTIONS - 1)
        .map((c) => c.id)
      return { surname, options: shuffle([home.id, ...others]) }
    })
}

export function NameGame() {
  const [rounds, setRounds] = useState(buildRounds)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState('')
  const feedbackRef = useRef<HTMLHeadingElement>(null)
  const topRef = useRef<HTMLHeadingElement>(null)

  const round = rounds[index]
  const home = communityById(round.surname.community)
  const isLast = index === rounds.length - 1

  useEffect(() => {
    if (chosen) feedbackRef.current?.focus()
  }, [chosen])

  useEffect(() => {
    window.scrollTo(0, 0)
    topRef.current?.focus()
  }, [index, done])

  const next = () => {
    if (isLast) setDone(true)
    else {
      setIndex((i) => i + 1)
      setChosen(null)
    }
  }

  const restart = () => {
    setRounds(buildRounds())
    setIndex(0)
    setChosen(null)
    setDone(false)
    setStatus('')
  }

  const share = async () => {
    const lines = rounds.map((r) => `${r.surname.name}: ${communityById(r.surname.community).name}`)
    setStatus(await shareText(t('appName'), [t('names.share.text', { count: rounds.length }), '', ...lines].join('\n')))
  }

  const common = t('names.common', { name: round.surname.name, community: home.name })
  const fact = home.facts[0]
  const matched = chosen === home.id

  useScreenText(
    done
      ? [t('names.done.title', { count: rounds.length }), t('names.done.body')].join('. ')
      : chosen
        ? [
            matched ? t('names.feedback.match') : t('names.feedback.other'),
            matched ? '' : t('names.feedback.otherBody', { chosen: communityById(chosen).name, community: home.name }),
            common,
            round.surname.origin ? `${t('names.origin')}: ${round.surname.origin}` : '',
            round.surname.note ?? '',
            fact,
          ]
            .filter(Boolean)
            .join(' ')
        : [round.surname.name, t('names.question'), ...round.options.map((id) => communityById(id).name)].join('. '),
  )

  if (done) {
    return (
      <main className="screen">
        <h1 ref={topRef} tabIndex={-1}>
          {t('names.done.title', { count: rounds.length })}
        </h1>
        <p>{t('names.done.body')}</p>
        <Card>
          <ul className="summary-list">
            {rounds.map((r) => (
              <li key={r.surname.id}>
                <strong>{r.surname.name}</strong>
                <span className="muted">{communityById(r.surname.community).name}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Status message={status} />
        <ActionBar>
          <BigButton icon="share" onClick={share}>
            {t('names.done.share')}
          </BigButton>
          <BigButton variant="secondary" icon="again" onClick={restart}>
            {t('names.done.again')}
          </BigButton>
        </ActionBar>
      </main>
    )
  }

  return (
    <main className="screen">
      <p className="progress">{t('names.progress', { n: index + 1, total: rounds.length })}</p>
      <h1 ref={topRef} tabIndex={-1} className="surname">
        {round.surname.name}
      </h1>

      {!chosen ? (
        <>
          <h2 id="q">{t('names.question')}</h2>
          <div className="choices one-col" role="group" aria-labelledby="q">
            {round.options.map((id) => (
              <ChoiceButton key={id} onClick={() => setChosen(id)}>
                {communityById(id).name}
              </ChoiceButton>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card>
            <h2 ref={feedbackRef} tabIndex={-1} className="feedback-head">
              <Icon name="check" />
              <span>{matched ? t('names.feedback.match') : t('names.feedback.other')}</span>
            </h2>
            {!matched && (
              <p>{t('names.feedback.otherBody', { chosen: communityById(chosen).name, community: home.name })}</p>
            )}
            <p>{common}</p>
            {round.surname.origin && (
              <>
                <p className="card-label">{t('names.origin')}</p>
                <p>{round.surname.origin}</p>
              </>
            )}
            {round.surname.note && <p className="muted">{round.surname.note}</p>}
            <p className="card-label">{t('names.aboutCommunity', { community: home.name })}</p>
            <p>{fact}</p>
          </Card>
          <AddNote targetId={`surname:${round.surname.id}`} label={t('names.knowFamily')} />
          <p className="small muted">
            {round.surname.verified ? t('names.cautionVerified') : t('names.caution')}
            {round.surname.sources?.length ? (
              <>
                {' '}
                {t('names.sources', { sources: [...new Set(round.surname.sources.map((s) => sourceLabel(s.url)))].join(', ') })}
              </>
            ) : null}
          </p>
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
