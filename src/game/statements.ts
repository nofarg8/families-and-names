import factsJson from '../data/tf-facts.json'
import { communities, communityById, surnames, type Source, type Surname } from '../data/types'

/** A sourced statement written by hand (true or false, with the correct version). */
type FactStatement = {
  id: string
  community: string
  text: string
  answer: boolean
  explanation: string
  sources: Source[]
}

export type Statement = {
  /** Things that must not repeat within one round (a surname, a fact). */
  subject: string
  text: string
  answer: boolean
  explanation: string
  sources?: Source[]
}

const facts: FactStatement[] = factsJson

const FACTS_PER_ROUND = 3

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

/** Communities a player could not reasonably tell apart for this name. */
function unfairFor(s: Surname): Set<string> {
  const home = communityById(s.community)
  const set = new Set([home.id, ...home.confusableWith])
  for (const c of communities) if (c.confusableWith.includes(home.id)) set.add(c.id)
  return set
}

/** Origins that name a place: swapping one for another gives a plausible but clearly false statement. */
const isPlaceOrigin = (origin: string) => /^(על שם (העיר|העיירה|הכפר|אזור|מחוז|רובע|טהרן)|יוצא |מהכפר |מהעיר )/.test(origin)

const sentence = (text: string) => (/[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`)

function originLine(s: Surname) {
  return s.origin ? ` מקור השם: ${sentence(s.origin)}` : ''
}

/** One statement about a surname: its community or its meaning, true or false. */
function surnameStatement(s: Surname, wantTrue: boolean): Statement | null {
  const home = communityById(s.community)
  const origin = s.origin

  if (origin && Math.random() < 0.4 && (wantTrue || isPlaceOrigin(origin))) {
    if (wantTrue) {
      return {
        subject: s.id,
        text: `מקור השם ${s.name}: ${sentence(origin)}`,
        answer: true,
        explanation: `השם ${s.name} נפוץ במיוחד אצל ${home.name}.`,
        sources: s.sources,
      }
    }
    // Borrow the meaning of a name from another community, so it is clearly not this one.
    const other = surnames.filter(
      (o) => o.verified && o.origin && isPlaceOrigin(o.origin) && o.community !== s.community && o.origin !== s.origin,
    )
    if (!other.length) return null
    return {
      subject: s.id,
      text: `מקור השם ${s.name}: ${sentence(pick(other).origin!)}`,
      answer: false,
      explanation: `מקור השם ${s.name}: ${sentence(origin)} השם נפוץ במיוחד אצל ${home.name}.`,
      sources: s.sources,
    }
  }

  if (wantTrue) {
    return {
      subject: s.id,
      text: `השם ${s.name} נפוץ במיוחד אצל ${home.name}.`,
      answer: true,
      explanation: `השם ${s.name} אכן נפוץ במיוחד אצל ${home.name}.${originLine(s)}`,
      sources: s.sources,
    }
  }
  const unfair = unfairFor(s)
  const wrong = communities.filter((c) => !unfair.has(c.id))
  if (!wrong.length) return null
  return {
    subject: s.id,
    text: `השם ${s.name} נפוץ במיוחד אצל ${pick(wrong).name}.`,
    answer: false,
    explanation: `השם ${s.name} נפוץ דווקא אצל ${home.name}.${originLine(s)}`,
    sources: s.sources,
  }
}

/** Draws a round: a few sourced facts plus surname statements, about half true. */
export function drawRound(size: number): Statement[] {
  const round: Statement[] = []
  const trueTarget = Math.round(size / 2) + Math.floor(Math.random() * 3) - 1
  let trues = 0
  const wantTrue = () => {
    const left = size - round.length
    const truesLeft = trueTarget - trues
    if (truesLeft <= 0) return false
    if (truesLeft >= left) return true
    return Math.random() < truesLeft / left
  }

  for (const f of shuffle(facts)) {
    if (round.length >= Math.min(FACTS_PER_ROUND, size)) break
    const want = wantTrue()
    if (f.answer !== want) continue
    round.push({ subject: f.id, text: f.text, answer: f.answer, explanation: f.explanation, sources: f.sources })
    if (f.answer) trues++
  }

  for (const s of shuffle(surnames.filter((x) => x.verified))) {
    if (round.length >= size) break
    const want = wantTrue()
    const st = surnameStatement(s, want)
    if (!st) continue
    round.push(st)
    if (st.answer) trues++
  }

  return shuffle(round)
}
