import surnamesJson from './surnames.json'
import communitiesJson from './communities.json'
import questionsJson from './story-questions.json'

export type Source = { title: string; url: string }

export type Surname = {
  id: string
  name: string
  latin?: string
  community: string
  /** null when the community link is sourced but the meaning isn't. */
  origin: string | null
  note?: string | null
  sources?: Source[]
  verified: boolean
}

export type Community = {
  id: string
  name: string
  region: string
  color: string
  facts: string[]
  confusableWith: string[]
  commonSurnames: string[]
  question: string
  verified: boolean
}

/** retired: no longer asked (doesn't fit the user), but old answers still show in the family book. */
export type StoryQuestion = { id: string; text: string; retired?: boolean }

export const surnames: Surname[] = surnamesJson
export const communities: Community[] = communitiesJson
export const allStoryQuestions: StoryQuestion[] = questionsJson
export const storyQuestions = allStoryQuestions.filter((q) => !q.retired)

export const communityById = (id: string) => communities.find((c) => c.id === id)!
