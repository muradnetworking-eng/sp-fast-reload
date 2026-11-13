import { technologies, topicUrl } from '../data/library'
import type { Block, Technology, Unit } from '../schemas/content'

type SearchItem = { title: string; detail: string; kind: string; href: string; text: string }
function walk(blocks: Block[], prefix: string, href: string, title: string): SearchItem[] {
  return blocks.flatMap((block, i): SearchItem[] => {
    const id = prefix + '-block-' + (i + 1)
    if (block.kind === 'advanced') return walk(block.blocks, id, href, title)
    if (block.kind === 'cli') return [{ title: block.title, detail: block.code, kind: 'Cisco CLI', href: href + '#' + id, text: [block.os, block.code, block.note, block.interpretation].join(' ') }]
    if (block.kind === 'diagram') return [{ title: block.title ?? title, detail: 'Topology diagram', kind: 'Diagram', href: href + '#' + id, text: block.text }]
    return []
  })
}
function textOf(blocks: Block[]): string {
  return blocks.map(block => {
    switch (block.kind) {
      case 'text': case 'diagram': return block.text
      case 'table': return block.rows.flat().join(' ')
      case 'list': return block.items.join(' ')
      case 'cli': return block.note + ' ' + (block.interpretation ?? '')
      case 'advanced': return block.title + ' ' + textOf(block.blocks)
    }
  }).join(' ')
}
function indexUnits(units: Unit[], route: (unit: Unit) => string, kind: string) {
  return units.flatMap(unit => {
    const href = route(unit)
    return [
      { title: unit.title, detail: unit.summary, href, kind, text: textOf(unit.blocks) },
      ...walk(unit.blocks, unit.id, href, unit.title),
    ]
  })
}
function indexTopic(topic: Technology): SearchItem[] {
  const base = topicUrl(topic.id, 'reload')
  const href = (tab: string, section?: string, id?: string) => topicUrl(topic.id, tab, section) + (id ? '/' + id : '')
  return [
    { title: topic.title, detail: topic.description, kind: 'Technology', href: base, text: topic.id },
    ...indexUnits([topic.reload], () => base, 'Reload'),
    ...indexUnits(topic.stages, unit => href('guide', unit.id), 'Lesson'),
    ...indexUnits(topic.implement, unit => href('operations', 'implement', unit.id), 'Recipe'),
    ...indexUnits([topic.lab.setup, ...topic.lab.milestones, topic.lab.solutions], unit => href('operations', 'lab', unit.id), 'Lab'),
    ...indexUnits(topic.instructor, unit => href('interview', 'teach', unit.id), 'Instructor'),
    ...topic.faults.flatMap(fault => {
      const base = href('operations', 'troubleshoot', fault.id)
      return [
        { title: fault.title, detail: fault.symptom, kind: 'Troubleshooting', href: base, text: fault.subtopic },
        ...fault.checks.map((check, index) => ({
          title: check.title, detail: check.command, kind: 'Fault investigation',
          href: base + '#' + fault.id + '-check-' + index + '-block-1', text: fault.symptom + ' ' + check.os,
        })),
      ]
    }),
    ...topic.decisions.map(item => ({ title: item.title, detail: item.requirement, kind: 'Architecture', href: href('guide', 'decisions', item.id), text: [item.analysis, item.proposal, item.existing, item.risks].join(' ') })),
    ...topic.interviews.map(item => ({ title: item.title, detail: item.prompt, kind: 'Interview', href: href('interview', 'mock', item.id), text: item.subtopic })),
    ...topic.exercises.map(item => ({ title: item.title, detail: item.prompt, kind: 'Exercise', href: href('interview', 'exercises', item.id), text: item.subtopic })),
  ].map(item => ({ ...item, text: topic.id + ' ' + item.text }))
}
const index = technologies.flatMap(indexTopic)
export function search(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return index.map(item => {
    const title = item.title.toLowerCase(), detail = item.detail.toLowerCase(), body = item.text.toLowerCase()
    const weight = terms.map(term => title.includes(term) ? 5 : detail.includes(term) ? 3 : body.includes(term) ? 1 : 0)
    return { item, score: weight.includes(0) ? 0 : weight.reduce<number>((total, value) => total + value, 0) }
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score).slice(0, 20).map(({ item }) => item)
}
