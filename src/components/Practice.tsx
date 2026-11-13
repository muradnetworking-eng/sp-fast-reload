import { useState } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import type { Decision, Fault, Question, Technology } from '../schemas/content'
import { useProgress } from '../state/context'
import { BookmarkButton, Blocks, DataTable } from './Content'

export function FaultView({ fault, topic, href }: { fault: Fault; topic: Technology; href: string }) {
  const { record } = useProgress()
  const { hash } = useLocation()
  const [checked, setChecked] = useState<number[]>([])
  const bookmarkedCheck = fault.checks.findIndex((_, index) => hash === '#' + fault.id + '-check-' + index + '-block-1')
  const visibleChecks = bookmarkedCheck < 0 ? checked : [...new Set([bookmarkedCheck, ...checked])]
  const [revealed, setRevealed] = useState(false)
  const [recorded, setRecorded] = useState(false)
  return <section id={fault.id} className="panel content-unit">
    <div className="section-heading"><div><p className="kicker">{fault.subtopic}</p><h2>{fault.title}</h2></div><BookmarkButton href={href} title={fault.title} /></div>
    <p className="lead">{fault.symptom}</p>
    <h3>Working hypotheses</h3><ul>{fault.hypotheses.map(value => <li key={value}>{value}</li>)}</ul>
    <h3>Choose your next investigation</h3>
    <div className="case-checks">{fault.checks.map((check, index) => <div key={check.title}>
      <button className="button" type="button" aria-pressed={visibleChecks.includes(index)} onClick={() => setChecked(current => [...new Set([...current, index])])}>{visibleChecks.includes(index) ? <Check size={16} /> : <ArrowRight size={16} />}{check.title}</button>
      {visibleChecks.includes(index) && <Blocks prefix={fault.id + '-check-' + index} origin={href} blocks={[{ kind: 'cli', title: check.title, os: check.os, code: check.command, note: 'Inspect the result and compare it to your hypotheses.', output: check.evidence, interpretation: check.rationale }]} />}
    </div>)}</div>
    {visibleChecks.length > 0 && !revealed && <button className="button primary" type="button" onClick={() => setRevealed(true)}>Reveal diagnosis</button>}
    {revealed && <div className="answer"><h3>Root cause</h3><p>{fault.cause}</p><h3>Fix</h3><p>{fault.fix}</p><h3>Verify</h3><p>{fault.verify}</p>
      <button className="button" type="button" disabled={recorded} onClick={() => {
        record({ topic: topic.id, target: fault.id, dimension: 'Troubleshooting Readiness', kind: 'check', context: 'Studied', subtopic: fault.subtopic, score: fault.checks[checked[0] ?? bookmarkedCheck]?.decisive ? 3 : 1 })
        setRecorded(true)
      }}>{recorded ? 'Investigation recorded' : 'Record investigation'}</button>
    </div>}
  </section>
}

export function QuestionView({ question, topic, mock = false, sessionScore, onScore }: { question: Question; topic: Technology; mock?: boolean; sessionScore?: number; onScore?: (score: number) => void }) {
  const { record } = useProgress()
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState<number | undefined>(sessionScore)
  return <section id={question.id} className="panel content-unit">
    <p className="kicker">{question.subtopic}</p><h2>{question.title}</h2><p className="lead">{question.prompt}</p>
    {question.evidence && <Blocks blocks={question.evidence} prefix={question.id} />}
    <button className="button" type="button" aria-expanded={open} onClick={() => setOpen(current => !current)}>{open ? 'Hide answer' : 'Reveal answer'}<ChevronDown size={16} /></button>
    {open && <div className="answer"><h3>Answer</h3><p>{question.answer}</p><h3>Reasoning</h3><p>{question.reasoning}</p><h3>Evidence</h3><p>{question.example}</p><h3>Common assumption to test</h3><p>{question.misconception}</p><h3>Follow-up</h3><p>{question.followUp}</p><h3>Senior engineer criteria</h3><ul>{question.criteria.map(item => <li key={item}>{item}</li>)}</ul>
      <div className="row wrap" aria-label="Self-assess answer">{['Missed', 'Partial', 'Strong'].map((rating, index) => <button type="button" className={'button' + (score === index + 1 ? ' positive' : '')} disabled={score !== undefined} key={rating} onClick={() => {
        const score = index + 1
        record({ topic: topic.id, target: question.id, dimension: mock ? 'Interview Readiness' : question.dimension ?? 'Conceptual Knowledge', kind: 'assessment', context: 'Studied', subtopic: question.subtopic, score })
        setScore(score)
        onScore?.(score)
      }}>{rating}</button>)}</div>{score !== undefined && <p role="status">Self-assessment recorded.</p>}
    </div>}
  </section>
}

export function MockInterview({ topic, initial }: { topic: Technology; initial?: string }) {
  const start = Math.max(0, topic.interviews.findIndex(item => item.id === initial))
  const [index, setIndex] = useState(start)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)
  const question = topic.interviews[index]
  if (!question) return null
  return <div className="stack">
    {done ? <section className="panel content-unit"><h2>Session results</h2><p>{Object.keys(scores).length} of {topic.interviews.length} questions self-assessed in this session.</p>
      <DataTable headers={['Question', 'Self-assessment']} rows={topic.interviews.map(item => [item.title, ['Unrated', 'Missed', 'Partial', 'Strong'][scores[item.id] ?? 0]])} />
      <button type="button" className="button" onClick={() => { setIndex(0); setScores({}); setDone(false) }}>Restart mock interview</button>
    </section> : <>
      <div className="row between wrap"><p className="muted">Question {index + 1} of {topic.interviews.length}</p><button type="button" className="button" onClick={() => setDone(true)}>End session</button></div>
      <QuestionView key={question.id} question={question} topic={topic} mock sessionScore={scores[question.id]} onScore={score => setScores(previous => ({ ...previous, [question.id]: score }))} />
      <div className="row between wrap"><button type="button" className="button" disabled={!index} onClick={() => setIndex(value => value - 1)}>Previous question</button><button type="button" className="button primary" onClick={() => index + 1 < topic.interviews.length ? setIndex(value => value + 1) : setDone(true)}>{index + 1 < topic.interviews.length ? 'Next question' : 'Finish session'}<ArrowRight size={16} /></button></div>
    </>}
  </div>
}

export function DecisionView({ item, href }: { item: Decision; href: string }) {
  const { record, progress } = useProgress()
  const topic = href.split('/')[2]
  const tracked = progress.evidence.some(entry => entry.topic === topic && entry.target === item.id && entry.kind === 'check')
  const sections = [
    ['Customer requirement', item.requirement], ['Existing architecture', item.existing], ['Constraints', item.constraints],
    ['Technical analysis', item.analysis], ['Proposed solution', item.proposal], ['Implementation', item.implementation],
    ['Verification', item.verification], ['Risks and tradeoffs', item.risks],
  ]
  return <section id={item.id} className="panel content-unit">
    <div className="section-heading"><h2>{item.title}</h2><BookmarkButton title={item.title} href={href} /></div>
    {sections.map(([title, value]) => <div key={title}><h3>{title}</h3><p>{value}</p></div>)}
    <DataTable headers={['Option', 'Capabilities', 'Operations', 'Scale', 'Migration', 'Failure behavior', 'Where it fits']} rows={item.comparison.map(row => [row.option, row.capability, row.operations, row.scale, row.migration, row.failure, row.fit])} />
    <button className="button" type="button" disabled={tracked} onClick={() => record({ topic, target: item.id, dimension: 'Architecture Readiness', kind: 'check', context: 'Studied' })}>{tracked ? 'Design review recorded' : 'Record design review'}</button>
  </section>
}
