import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Evidence, Progress } from './progress'

export const ProgressContext = createContext<{
  progress: Progress
  setProgress: Dispatch<SetStateAction<Progress>>
  persistenceError: boolean
  record: (entry: Omit<Evidence, 'id' | 'date'>) => void
} | null>(null)

export function useProgress() {
  const state = useContext(ProgressContext)
  if (!state) throw new Error('ProgressProvider is missing.')
  return state
}
