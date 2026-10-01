import { useCallback, useEffect, useRef, useState } from 'react'
import { get, set } from 'idb-keyval'

export type UserNote = { id: string; targetId: string; text: string; createdAt: string }
export type StoryAnswer = { questionId: string; text: string; updatedAt: string }

/** A single IndexedDB value kept in React state. */
export function useIdbValue<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(value)

  useEffect(() => {
    let alive = true
    get<T>(key)
      .then((v) => {
        if (!alive) return
        if (v !== undefined) {
          ref.current = v
          setValue(v)
        }
      })
      .finally(() => alive && setLoaded(true))
    return () => {
      alive = false
    }
  }, [key])

  const save = useCallback(
    async (updater: (prev: T) => T) => {
      const next = updater(ref.current)
      ref.current = next
      setValue(next)
      await set(key, next)
    },
    [key],
  )

  return [value, save, loaded] as const
}

export const useNotes = () => useIdbValue<UserNote[]>('notes', [])
export const useStoryAnswers = () => useIdbValue<Record<string, StoryAnswer>>('story', {})

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
