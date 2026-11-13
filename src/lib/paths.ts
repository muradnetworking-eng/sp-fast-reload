import type { Technology } from '../schemas/content'
import { topicUrl } from '../data/library'

export const levels = [
  'New to this technology', 'Understand the theory but have no hands-on experience',
  'Previously experienced but need a refresh', 'Experienced and preparing for advanced engineering challenges',
] as const
export const goals = [
  'Refresh knowledge', 'Learn progressively', 'Configure and practice', 'Troubleshoot',
  'Prepare for an interview', 'Design a solution', 'Prepare to teach',
] as const
export const paths = [
  { id: 'emergency', title: '15-Min Emergency Refresh', time: '15 min', steps: ['reload'] },
  { id: 'review', title: '60-Min Technical Review', time: '60 min', steps: ['reload', 'visualize', 'configure', 'verify', 'fault', 'exercises'] },
  { id: 'zero', title: 'Learn from Zero', time: '7 stages', steps: ['understand', 'visualize', 'configure', 'verify', 'troubleshoot', 'apply', 'defend'] },
  { id: 'hands-on', title: 'Hands-On Lab Preparation', time: 'Lab + faults', steps: ['configure', 'implement', 'lab', 'verify', 'fault'] },
  { id: 'senior', title: 'Senior Engineer Interview Preparation', time: 'Mock session', steps: ['reload', 'verify', 'exercises', 'fault', 'decision', 'interview'] },
  { id: 'architect', title: 'Solutions Architect Design Preparation', time: 'Design review', steps: ['visualize', 'apply', 'decision', 'verify', 'fault'] },
  { id: 'instructor', title: 'Technical Instructor Preparation', time: 'Teach-back', steps: ['understand', 'visualize', 'configure', 'lab', 'defend', 'teach'] },
] as const

export function recommendPath(level: number, goal: number) {
  return [level < 2 ? 'review' : 'emergency', level < 2 ? 'zero' : 'review', 'hands-on', 'review', 'senior', 'architect', 'instructor'][goal] ?? 'zero'
}

export function pathSteps(topic: Technology, pathId: string, level: number, goal: number) {
  const path = paths.find(path => path.id === pathId) ?? paths[2]
  const steps: string[] = [...path.steps]
  if (pathId === recommendPath(level, goal)) {
    if (level === 0 && !steps.includes('understand') && path.id !== 'emergency') steps.unshift('understand')
    if (level === 1 && path.id !== 'emergency' && !steps.includes('implement')) {
      const configure = steps.indexOf('configure')
      steps.splice(configure < 0 ? 1 : configure + 1, 0, 'implement')
    }
    if (level === 3 && goal === 1) steps.splice(0, steps.length, 'visualize', 'verify', 'fault', 'decision', 'exercises')
    if (goal === 3) steps.unshift(...steps.splice(steps.indexOf('fault'), 1))
  }
  const entries = resolveSteps(topic, steps)
  const reviewBudget: Partial<Record<string, number>> = level === 3 && goal === 1 && pathId === recommendPath(level, goal)
    ? { visualize: 10, verify: 15, fault: 10, decision: 15, exercises: 10 }
    : { reload: 15, visualize: 10, configure: 10, verify: 10, fault: 10, exercises: 5 }
  return entries.map(entry => ({ ...entry, minutes: path.id === 'review' ? reviewBudget[entry.step] : undefined }))
}

function resolveSteps(topic: Technology, steps: string[]) {
  const url = (tab: string, section?: string) => topicUrl(topic.id, tab, section)
  return steps.flatMap(step => {
    const stage = topic.stages.find(unit => unit.id === step)
    if (stage) return [{ step, title: stage.title, href: url('guide', stage.id) }]
    const entries: Record<string, { title: string; href: string }> = {
      reload: { title: '15-Min Reload', href: url('reload') },
      implement: { title: 'Configuration recipes', href: url('operations', 'implement') },
      lab: { title: 'Hands-on lab', href: url('operations', 'lab') },
      fault: { title: 'Troubleshooting tickets', href: url('operations', 'troubleshoot') },
      exercises: { title: 'Technical exercises', href: url('interview', 'exercises') },
      decision: { title: 'Architecture decisions', href: url('guide', 'decisions') },
      interview: { title: 'Mock interview', href: url('interview', 'mock') },
      teach: { title: 'Instructor preparation', href: url('interview', 'teach') },
    }
    return entries[step] ? [{ step, ...entries[step] }] : []
  })
}
