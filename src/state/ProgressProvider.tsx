import { useEffect, useState, type ReactNode } from 'react'
import { ProgressContext } from './context'
import { initialProgress, readProgress, storageKey, type Evidence } from './progress'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(() => {
    try { return readProgress(window.localStorage) } catch { return initialProgress() }
  })
  const [persistenceError, setPersistenceError] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress))
      setPersistenceError(false)
    } catch {
      setPersistenceError(true)
    }
    document.documentElement.dataset.theme = progress.theme
  }, [progress])

  function record(entry: Omit<Evidence, 'id' | 'date'>) {
    const evidence = { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() }
    setProgress(previous => ({ ...previous, evidence: [...previous.evidence, evidence] }))
  }
  return <ProgressContext.Provider value={{ progress, setProgress, record, persistenceError }}>{children}</ProgressContext.Provider>
}
