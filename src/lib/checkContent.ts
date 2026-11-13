import type { Block, Technology } from '../schemas/content'
import { dimensions } from '../schemas/content'

export function checkContent(topic: Technology): string[] {
  const errors: string[] = []
  const allUnits = [topic.reload, ...topic.stages, ...topic.implement, topic.lab.setup, ...topic.lab.milestones, topic.lab.solutions, ...topic.instructor]
  const allItems = [...allUnits, ...topic.faults, ...topic.decisions, ...topic.exercises, ...topic.interviews, ...topic.cards]
  const ids = new Set<string>()
  for (const item of allItems) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) errors.push('Invalid ID ' + item.id)
    if (ids.has(item.id)) errors.push('Duplicate ID ' + item.id)
    ids.add(item.id)
  }
  const stages = ['understand', 'visualize', 'configure', 'verify', 'troubleshoot', 'apply', 'defend']
  if (topic.stages.map(unit => unit.id).join(',') !== stages.join(',')) errors.push('Seven learning stages must appear in sequence.')
  if (topic.reload.id !== 'reload') errors.push('Reload ID must be reload.')
  const sets = { recipes: topic.implement, milestones: topic.lab.milestones, tickets: topic.faults, comparisons: topic.decisions, exercises: topic.exercises, interviews: topic.interviews, instructor: topic.instructor, cards: topic.cards, sources: topic.sources }
  for (const [label, items] of Object.entries(sets)) if (!items.length) errors.push('Missing ' + label)
  if (!/^\d{4}-\d\d-\d\d$/.test(topic.reviewed) || Number.isNaN(Date.parse(topic.reviewed))) errors.push('Invalid review date.')
  for (const source of topic.sources) if (!source.url.startsWith('https://') || !source.scope.trim()) errors.push('Invalid reference ' + source.title)
  function checkBlocks(blocks: Block[], title: string) {
    if (!blocks.length) errors.push('No content for ' + title)
    for (const block of blocks) {
      if (block.kind === 'cli' && (!block.os.trim() || !block.code.trim() || !block.note.trim() || (block.output && !block.interpretation?.trim()))) errors.push('Incomplete CLI ' + block.title)
      if (block.kind === 'table' && block.rows.some(row => row.length !== block.headers.length)) errors.push('Table width mismatch in ' + title)
      if (block.kind === 'advanced') checkBlocks(block.blocks, block.title)
    }
  }
  for (const unit of allUnits) {
    if (!unit.title.trim() || !unit.summary.trim() || !dimensions.includes(unit.dimension)) errors.push('Incomplete unit ' + unit.id)
    checkBlocks(unit.blocks, unit.title)
  }
  for (const fault of topic.faults) {
    if (fault.hypotheses.length < 2 || fault.checks.length < 2 || !fault.checks.some(check => check.decisive)) errors.push('Incomplete investigation ' + fault.id)
  }
  for (const item of [...topic.interviews, ...topic.exercises]) {
    if (!item.criteria.length || [item.prompt, item.answer, item.reasoning, item.example, item.misconception, item.followUp].some(value => !value.trim())) errors.push('Incomplete assessment ' + item.id)
    if (item.evidence) checkBlocks(item.evidence, item.title)
  }
  for (const item of topic.decisions) {
    if (item.comparison.length < 2 || [item.requirement, item.existing, item.constraints, item.analysis, item.proposal, item.implementation, item.verification, item.risks].some(value => !value.trim())) errors.push('Incomplete decision ' + item.id)
  }
  for (const card of topic.cards) if (!card.front.trim() || !card.back.trim() || !dimensions.includes(card.dimension)) errors.push('Incomplete flashcard ' + card.id)
  for (const file of topic.lab.downloads) if (!/^downloads\/[a-zA-Z0-9/_.-]+$/.test(file.path) || file.path.split('/').includes('..')) errors.push('Invalid download ' + file.path)
  return errors
}
