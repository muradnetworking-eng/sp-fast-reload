export const dimensions = ['Conceptual Knowledge', 'Configuration Knowledge', 'Lab Experience', 'Troubleshooting Readiness', 'Architecture Readiness', 'Interview Readiness', 'Instructor Readiness'] as const
export type Dimension = typeof dimensions[number]
export type Tab = 'reload' | 'guide' | 'operations' | 'interview'
export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'diagram'; text: string; title?: string }
  | { kind: 'cli'; title: string; os: string; code: string; note: string; output?: string; interpretation?: string }
  | { kind: 'advanced'; title: string; blocks: Block[] }
export interface Unit {
  id: string
  title: string
  summary: string
  blocks: Block[]
  dimension: Dimension
  minutes?: number
}
export interface Question {
  id: string
  title: string
  subtopic: string
  prompt: string
  evidence?: Block[]
  dimension?: Dimension
  answer: string
  reasoning: string
  example: string
  misconception: string
  followUp: string
  criteria: string[]
}
export interface Fault {
  id: string
  title: string
  symptom: string
  subtopic: string
  hypotheses: string[]
  checks: { title: string; command: string; os: string; evidence: string; rationale: string; decisive?: boolean }[]
  cause: string
  fix: string
  verify: string
}
export interface Decision {
  id: string
  title: string
  requirement: string
  existing: string
  constraints: string
  analysis: string
  proposal: string
  implementation: string
  verification: string
  risks: string
  comparison: { option: string; capability: string; operations: string; scale: string; migration: string; failure: string; fit: string }[]
}
export interface Card {
  id: string
  subtopic: string
  front: string
  back: string
  dimension: Dimension
}
export interface Lab {
  setup: Unit
  milestones: Unit[]
  solutions: Unit
  downloads: { title: string; path: string }[]
}
export interface Source { title: string; url: string; scope: string }
export interface Technology {
  id: string
  title: string
  category: string
  description: string
  dashboardDiagram?: string
  prerequisites: string[]
  reviewed: string
  sources: Source[]
  reload: Unit
  stages: Unit[]
  implement: Unit[]
  lab: Lab
  faults: Fault[]
  exercises: Question[]
  interviews: Question[]
  instructor: Unit[]
  decisions: Decision[]
  cards: Card[]
  ankiPackage?: string
  readinessCriteria?: Partial<Record<Dimension, string>>
}
export interface Entry { id: string; title: string; category: string; description: string; module?: Technology }
