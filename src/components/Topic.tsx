import { useEffect } from 'react'
import { ArrowRight, ChevronDown, Pin } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { library, topicUrl } from '../data/library'
import { goals, levels, paths, pathSteps, recommendPath } from '../lib/paths'
import type { Technology } from '../schemas/content'
import { useProgress } from '../state/context'
import { BookmarkButton, UnitView } from './Content'
import { DecisionView, FaultView, MockInterview, QuestionView } from './Practice'
import { EvidenceForm } from './Readiness'

const stageLabels = ['Understand', 'Visualize', 'Configure', 'Verify', 'Troubleshoot', 'Apply', 'Defend and Teach']
const tabs = [['reload', '15-Min Reload'], ['guide', 'Step-by-Step Guide'], ['operations', 'Implement, Troubleshoot & Lab'], ['interview', 'Interview & Teach']]

export function PinButton({ topic }: { topic: Technology }) {
  const { progress, setProgress } = useProgress()
  const pinned = progress.pinned.includes(topic.id)
  return <button className="button" type="button" aria-pressed={pinned} onClick={() => setProgress(previous => ({
    ...previous, pinned: pinned ? previous.pinned.filter(id => id !== topic.id) : [...previous.pinned, topic.id],
  }))}><Pin size={16} fill={pinned ? 'currentColor' : 'none'} />{pinned ? 'Pinned' : 'Pin topic'}</button>
}

function AdaptivePaths({ topic }: { topic: Technology }) {
  const { progress, setProgress } = useProgress()
  const { level, goal, path } = progress.preferences[topic.id] ?? { level: 0, goal: 1, path: undefined }
  const recommendation = recommendPath(level, goal)
  const active = path && paths.some(item => item.id === path) ? path : recommendation
  function update(next: { level: number; goal: number; path?: string }) {
    setProgress(previous => ({ ...previous, preferences: { ...previous.preferences, [topic.id]: next } }))
  }
  return <section className="panel path-panel" aria-label="Preparation paths">
    <div className="selector-grid">
      <label>My starting knowledge<select value={level} onChange={event => update({ level: Number(event.target.value), goal })}>{levels.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>
      <label>My immediate goal<select value={goal} onChange={event => update({ level, goal: Number(event.target.value) })}>{goals.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>
      <label>Preparation path<select value={active} onChange={event => update({ level, goal, path: event.target.value })}>{paths.map(path => <option key={path.id} value={path.id}>{path.title}{path.id === recommendation ? ' (recommended)' : ''}</option>)}</select></label>
    </div>
    <ol className="path-steps">{pathSteps(topic, active, level, goal).map(step => <li key={step.href}><Link to={step.href}>{step.title}{step.minutes ? ' · ' + step.minutes + ' min' : ''}<ArrowRight size={13} /></Link></li>)}</ol>
  </section>
}

export function TopicPage() {
  const { id, tab = 'reload', section, item } = useParams()
  const { hash, pathname } = useLocation()
  const { setProgress } = useProgress()
  const entry = library.find(entry => entry.id === id)
  const topic = entry?.module
  const visitTitle = topic ? [topic.title, tabs.find(([key]) => key === tab)?.[1], section?.replaceAll('-', ' '), item?.replaceAll('-', ' ')].filter(Boolean).join(' / ') : ''
  useEffect(() => {
    if (!topic || !tabs.some(([key]) => key === tab)) return
    const href = pathname + hash
    const visit = { href, title: visitTitle, date: new Date().toISOString() }
    setProgress(previous => ({ ...previous, recent: [visit, ...previous.recent.filter(item => item.href !== href)].slice(0, 12) }))
  }, [hash, pathname, setProgress, tab, topic, visitTitle])
  useEffect(() => {
    if (!hash) return
    const handle = requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      let detail = target?.closest('details')
      while (detail) {
        detail.open = true
        detail = detail.parentElement?.closest('details') ?? null
      }
      target?.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(handle)
  }, [hash, pathname])
  if (!entry) return <section><h1>Technology unavailable</h1><Link to="/library">Back to Technology Library</Link></section>
  if (!topic) return <><Link className="back-link" to="/library">← Technology Library</Link><h1>{entry.title}</h1><p className="lead">{entry.description}</p><p className="tag">Not Yet Developed</p></>
  if (!tabs.some(([key]) => key === tab)) return <Navigate to={topicUrl(topic.id)} replace />
  const href = (tab: string, section?: string, item?: string) => topicUrl(topic.id, tab, section) + (item ? '/' + item : '')
  const ops = section ?? 'implement'
  const interview = section ?? 'mock'
  const renderUnits = (units: Technology['stages'], base: string) => units.map(unit => <UnitView key={unit.id} unit={unit} topic={topic} href={base + '/' + unit.id} />)
  const itemExists = (values: { id: string }[]) => !item || values.some(value => value.id === item)
  const available = tab === 'reload' ? !section && !item
    : tab === 'guide' ? section === 'decisions' ? itemExists(topic.decisions) : !item && (!section || topic.stages.some(unit => unit.id === section))
    : tab === 'operations' ? ops === 'implement' ? itemExists(topic.implement) : ops === 'troubleshoot' ? itemExists(topic.faults) : ops === 'lab' && itemExists([topic.lab.setup, ...topic.lab.milestones, topic.lab.solutions])
    : interview === 'mock' ? itemExists(topic.interviews) : interview === 'exercises' ? itemExists(topic.exercises) : interview === 'teach' && itemExists(topic.instructor)
  if (!available) return <section className="stack"><h1>Section unavailable</h1><Link className="back-link" to={href(tab)}>← Back to {tabs.find(([key]) => key === tab)?.[1]}</Link></section>
  return <div className="stack topic-page">
    <Link className="back-link" to="/library">← Technology Library</Link>
    <div className="page-heading section-heading"><div><p className="kicker">{topic.category}</p><h1>{topic.title}</h1><p className="lead">{topic.description}</p></div>
      <div className="row wrap"><BookmarkButton title={topic.title} href={href('reload')} /><PinButton topic={topic} /></div>
    </div>
    <AdaptivePaths topic={topic} />
    <nav className="tabs" aria-label="Technology views">{tabs.map(([key, label]) => <Link key={key} to={href(key)} aria-current={tab === key ? 'page' : undefined}>{label}</Link>)}</nav>
    {tab === 'reload' && <UnitView unit={topic.reload} topic={topic} href={href('reload')}><nav className="row wrap deep-links" aria-label="Continue from reload">{topic.stages.filter(unit => ['visualize', 'verify', 'troubleshoot'].includes(unit.id)).map(unit => <Link className="button" key={unit.id} to={href('guide', unit.id)}>{unit.title}<ArrowRight size={15} /></Link>)}<Link className="button" to={href('operations', 'lab')}>Open the lab<ArrowRight size={15} /></Link></nav></UnitView>}
    {tab === 'guide' && <>
      <nav className="subtabs" aria-label="Learning stages">{topic.stages.map((unit, index) => <Link key={unit.id} aria-current={(section ?? topic.stages[0]?.id) === unit.id ? 'page' : undefined} to={href('guide', unit.id)}>{index + 1}. {stageLabels[index] ?? unit.title}</Link>)}<Link to={href('guide', 'decisions')} aria-current={section === 'decisions' ? 'page' : undefined}>Architecture cases</Link></nav>
      {section === 'decisions' ? topic.decisions.filter(value => !item || value.id === item).map(value => <DecisionView key={value.id} item={value} href={href('guide', 'decisions', value.id)} />) : (() => {
        const index = Math.max(0, topic.stages.findIndex(unit => unit.id === section))
        const unit = topic.stages[index]
        const next = topic.stages[index + 1]
        return unit && <UnitView unit={unit} topic={topic} href={href('guide', unit.id)}>
          {index === 0 && <><h3>Prerequisites</h3><ul>{topic.prerequisites.map(value => <li key={value}>{value}</li>)}</ul></>}
          {next && <Link className="button deep-links" to={href('guide', next.id)}>Next stage · {next.title}<ArrowRight size={15} /></Link>}
          {unit.id === 'configure' && <Link className="button deep-links" to={href('operations', 'implement')}>Open configuration recipes<ArrowRight size={15} /></Link>}
          {unit.id === 'troubleshoot' && <Link className="button deep-links" to={href('operations', 'troubleshoot')}>Open troubleshooting tickets<ArrowRight size={15} /></Link>}
          {unit.id === 'apply' && <Link className="button deep-links" to={href('guide', 'decisions')}>Open architecture cases<ArrowRight size={15} /></Link>}
          {unit.id === 'defend' && <Link className="button deep-links" to={href('interview')}>Interview and instructor practice<ArrowRight size={15} /></Link>}
        </UnitView>
      })()}
    </>}
    {tab === 'operations' && <>
      <nav className="subtabs" aria-label="Operations modes">{[['implement', 'Implement'], ['troubleshoot', 'Troubleshoot'], ['lab', 'Hands-On Lab']].map(([key, label]) => <Link key={key} aria-current={ops === key ? 'page' : undefined} to={href('operations', key)}>{label}</Link>)}</nav>
      {ops === 'implement' && renderUnits(topic.implement.filter(unit => !item || unit.id === item), href('operations', ops))}
      {ops === 'troubleshoot' && topic.faults.filter(fault => !item || fault.id === item).map(fault => <FaultView key={fault.id} topic={topic} fault={fault} href={href('operations', ops, fault.id)} />)}
      {ops === 'lab' && <>
        {renderUnits([topic.lab.setup, ...topic.lab.milestones].filter(unit => !item || item === unit.id), href('operations', ops))}
        {(!item || item === topic.lab.solutions.id) && <details className="disclosure" open={item === topic.lab.solutions.id}><summary>Instructor lab solutions<ChevronDown size={16} /></summary>{renderUnits([topic.lab.solutions], href('operations', ops))}</details>}
        {!item && <section className="panel content-unit"><h2>Lab downloads</h2><div className="row wrap">{topic.lab.downloads.map(file => <a className="button" key={file.path} download href={import.meta.env.BASE_URL + file.path}>{file.title}</a>)}</div><EvidenceForm topic={topic.id} labOnly /></section>}
      </>}
    </>}
    {tab === 'interview' && <>
      <nav className="subtabs" aria-label="Interview and instruction modes">{[['mock', 'Mock interview'], ['exercises', 'Technical exercises'], ['teach', 'Instructor mode']].map(([key, label]) => <Link key={key} aria-current={interview === key ? 'page' : undefined} to={href('interview', key)}>{label}</Link>)}</nav>
      {interview === 'mock' && <MockInterview key={topic.id + (item ?? '')} topic={topic} initial={item} />}
      {interview === 'exercises' && topic.exercises.filter(question => !item || item === question.id).map(question => <QuestionView key={question.id} question={question} topic={topic} />)}
      {interview === 'teach' && renderUnits(topic.instructor.filter(unit => !item || item === unit.id), href('interview', interview))}
    </>}
    <details className="disclosure references"><summary>Technical references · reviewed {topic.reviewed}<ChevronDown size={16} /></summary><ul>{topic.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> — {source.scope}</li>)}</ul></details>
  </div>
}
