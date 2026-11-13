import { dimensions, type Dimension } from '../schemas/content'

export const storageKey = 'sp-fast-reload.progress'
export const ratings = ['Forgot', 'Hard', 'Mastered'] as const
export const contexts = ['Studied', 'Practiced in a simulation', 'Verified in a real lab', 'Self-reported production experience'] as const
export type Rating = typeof ratings[number]
export type Context = typeof contexts[number]
export interface Evidence {
  id: string
  topic: string
  target: string
  dimension: Dimension
  kind: 'study' | 'check' | 'assessment' | 'review' | 'experience'
  context: Context
  date: string
  subtopic?: string
  score?: number
}
export interface Review { rating: Rating; date: string; due: string; interval: number }
export interface Visit { href: string; title: string; date: string }
export interface Progress {
  version: 1
  theme: 'dark' | 'light'
  preferences: Record<string, { level: number; goal: number; path?: string }>
  completed: Record<string, string>
  bookmarks: Visit[]
  pinned: string[]
  recent: Visit[]
  reviews: Record<string, Review[]>
  evidence: Evidence[]
  confidence: Record<string, number>
}
export function initialProgress(): Progress {
  return { version: 1, theme: 'dark', preferences: {}, completed: {}, bookmarks: [], pinned: [], recent: [], reviews: {}, evidence: [], confidence: {} }
}
export const isDue = (history: Review[] | undefined, now = new Date()) => !history?.length || Date.parse(history.at(-1)!.due) <= now.getTime()
export function schedule(rating: Rating, prior: Review | undefined, now = new Date()): Review {
  const interval = rating === 'Forgot' ? 1 / 144 : rating === 'Hard' ? Math.max(1, Math.round((prior?.interval ?? 0) * 1.3)) : Math.min(180, Math.max(3, Math.round((prior?.interval ?? 0) * 2.4)))
  return { rating, date: now.toISOString(), due: new Date(now.getTime() + interval * 86_400_000).toISOString(), interval }
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const date = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value))
const str = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length < 500
const id = (value: string) => /^[a-z0-9][a-z0-9:-]{0,199}$/i.test(value) && !['constructor', 'prototype'].includes(value)
const bounded = (value: unknown, low: number, high: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high
const integer = (value: unknown, low: number, high: number): value is number => bounded(value, low, high) && Number.isInteger(value)
const inList = (list: readonly string[], value: unknown) => typeof value === 'string' && list.includes(value)
const visit = (value: unknown) => object(value) && str(value.href) && /^\/(?:technology\/[a-z0-9/-]+|decisions)(?:#[a-z0-9-]+)?$/.test(value.href) && str(value.title) && date(value.date)
const evidence = (value: unknown) => object(value) && str(value.id) && id(value.id) && str(value.topic) && id(value.topic) && str(value.target) && id(value.target)
  && inList(dimensions, value.dimension) && inList(contexts, value.context) && date(value.date)
  && inList(['study', 'check', 'assessment', 'review', 'experience'], value.kind)
  && (value.kind === 'experience' || value.context === 'Studied')
  && (value.subtopic === undefined || str(value.subtopic)) && (value.score === undefined || bounded(value.score, 0, 3))
const record = (value: unknown, valid: (item: unknown) => boolean) => object(value)
  && Object.entries(value).every(([key, item]) => id(key) && valid(item))
const review = (value: unknown) => object(value) && inList(ratings, value.rating) && date(value.date) && date(value.due)
  && Date.parse(value.due) >= Date.parse(value.date) && bounded(value.interval, 0, 180)

export function parseProgress(raw: string): Progress {
  if (raw.length > 4_000_000) throw new Error('The backup exceeds 4 MB.')
  const parsed: unknown = JSON.parse(raw)
  if (!object(parsed)) throw new Error('Invalid progress backup.')
  const data = parsed.version === 0 ? { ...initialProgress(), ...parsed, version: 1 } : parsed
  if (data.version !== 1) throw new Error('This progress version is unsupported.')
  if (!inList(['dark', 'light'], data.theme)
    || !record(data.preferences, value => object(value) && integer(value.level, 0, 3) && integer(value.goal, 0, 6) && (value.path === undefined || (str(value.path) && id(value.path))))
    || !record(data.completed, date) || !record(data.confidence, value => integer(value, 1, 5))
    || !record(data.reviews, value => Array.isArray(value) && value.every(review))
    || !Array.isArray(data.pinned) || !data.pinned.every(value => str(value) && id(value))
    || !Array.isArray(data.bookmarks) || !data.bookmarks.every(visit)
    || !Array.isArray(data.recent) || !data.recent.every(visit)
    || !Array.isArray(data.evidence) || !data.evidence.every(evidence)) throw new Error('Invalid progress fields. The current data was preserved.')
  return Object.fromEntries(Object.keys(initialProgress()).map(key => [key, data[key]])) as unknown as Progress
}

export function readProgress(storage: Pick<Storage, 'getItem'>): Progress {
  try {
    const raw = storage.getItem(storageKey)
    return raw ? parseProgress(raw) : initialProgress()
  } catch {
    return initialProgress()
  }
}
export function weakAreas(items: Evidence[], topic?: string) {
  const latest = new Map<string, Evidence>()
  for (const item of items) {
    if ((topic && item.topic !== topic) || !item.subtopic || item.score === undefined) continue
    const key = [item.topic, item.kind, item.target].join(':')
    if (!latest.has(key) || item.date >= latest.get(key)!.date) latest.set(key, item)
  }
  return [...new Set([...latest.values()].filter(item => item.score! <= 1).map(item => item.subtopic!))]
}
