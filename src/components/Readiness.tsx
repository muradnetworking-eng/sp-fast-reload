import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { technologies } from '../data/library'
import { dimensions, type Dimension } from '../schemas/content'
import { useProgress } from '../state/context'
import { contexts, initialProgress, isDue, parseProgress, weakAreas, type Context, type Progress } from '../state/progress'
import { downloadFile } from '../lib/files'
import { formatDate } from './Content'

export function EvidenceForm({ topic, labOnly = false }: { topic: string; labOnly?: boolean }) {
  const { record } = useProgress()
  const [experience, setExperience] = useState<Context>(contexts[1])
  const [dimension, setDimension] = useState<Dimension>('Lab Experience')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) return
    record({ topic, target: 'reported-experience', dimension, context: experience, kind: 'experience', subtopic: note.trim() })
    setNote('')
    setSaved(true)
  }
  return <form className="experience-form" onSubmit={submit}>
    <h3>Record hands-on experience</h3>
    <p className="muted">Use your own observation, for example a platform, checkpoint, and observed result.</p>
    <div className="selector-grid">
      {!labOnly && <label>Readiness dimension<select value={dimension} onChange={event => setDimension(event.target.value as Dimension)}>{dimensions.map(value => <option key={value}>{value}</option>)}</select></label>}
      <label>Experience type<select value={experience} onChange={event => setExperience(event.target.value as Context)}>{contexts.slice(1).filter(value => !labOnly || value !== contexts[3]).map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Evidence or observation<input value={note} maxLength={240} required onChange={event => { setNote(event.target.value); setSaved(false) }} /></label>
    </div>
    <button type="submit" className="button">Save experience</button>{saved && <p role="status">Experience recorded.</p>}
  </form>
}

export function ReadinessPage() {
  const { progress, setProgress } = useProgress()
  const [selected, setSelected] = useState(technologies[0]?.id ?? '')
  const topic = technologies.find(value => value.id === selected)
  const [pending, setPending] = useState<Progress | 'reset'>()
  const [message, setMessage] = useState('')
  const [importing, setImporting] = useState(false)
  const evidence = progress.evidence.filter(entry => entry.topic === selected)
  const due = topic?.cards.filter(card => isDue(progress.reviews[selected + ':' + card.id])).length ?? 0
  const study = topic ? [topic.reload, ...topic.stages, ...topic.implement, topic.lab.setup, ...topic.lab.milestones, topic.lab.solutions, ...topic.instructor] : []
  const completed = study.filter(unit => progress.completed[selected + ':' + unit.id]).length
  const last = evidence.map(entry => entry.date).sort().at(-1)
  const weak = weakAreas(evidence)
  const reviews = topic?.cards.flatMap(card => (progress.reviews[selected + ':' + card.id] ?? []).map(review => ({ ...review, title: card.subtopic }))).sort((a, b) => b.date.localeCompare(a.date)) ?? []
  async function loadBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setMessage('')
    setImporting(true)
    try {
      if (file.size > 4_000_000) throw new Error('The backup exceeds 4 MB.')
      setPending(parseProgress(await file.text()))
    } catch (error) {
      setMessage(error instanceof SyntaxError ? 'The file is not valid JSON. Current progress was preserved.' : (error as Error).message)
    } finally { setImporting(false) }
  }
  return <div className="stack">
    <div className="page-heading"><h1>My Readiness</h1><p className="lead">Study, self-assessment, review, and experience recorded on this browser.</p></div>
    {topic && <>
      <div className="row wrap between"><label>Technology<select value={selected} onChange={event => setSelected(event.target.value)}>{technologies.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label>Self-rated confidence<select value={progress.confidence[selected] ?? ''} onChange={event => { const value = Number(event.target.value); setProgress(previous => { const confidence = { ...previous.confidence }; if (value) confidence[selected] = value; else delete confidence[selected]; return { ...previous, confidence } }) }}><option value="">Unrated</option>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label></div>
      <div className="summary-grid">
        <div className="panel summary-cell"><span>Study completion</span><strong>{completed} / {study.length}</strong><small>Content units studied</small></div>
        <div className="panel summary-cell"><span>Last activity</span><strong>{last ? formatDate(last) : 'No evidence yet'}</strong></div>
        <div className="panel summary-cell"><span>Due flashcards</span><strong>{due}</strong></div>
      </div>
      <div className="readiness-grid">{dimensions.map(dimension => {
        const entries = evidence.filter(entry => entry.dimension === dimension)
        const latest = entries.sort((a, b) => b.date.localeCompare(a.date))[0]
        const distinct = (kind: typeof entries[number]['kind']) => new Set(entries.filter(entry => entry.kind === kind).map(entry => entry.target)).size
        return <section key={dimension} className="panel readiness-card"><h2>{dimension}</h2>{topic.readinessCriteria?.[dimension] && <p>{topic.readinessCriteria[dimension]}</p>}{entries.length ? <><p>{distinct('study')} study units · {distinct('check')} recorded checks · {distinct('assessment')} assessed prompts · {distinct('review')} cards reviewed</p><p className="muted">{entries.filter(entry => entry.kind === 'experience').length} experience reports · {formatDate(latest?.date)}</p></> : <p className="muted">No evidence recorded.</p>}</section>
      })}</div>
      <section className="panel content-unit"><h2>Weak subtopics</h2>{weak.length ? <ul>{weak.map(value => <li key={value}>{value}</li>)}</ul> : <p className="muted">Missed assessments, less useful first checks, and forgotten reviews appear here.</p>}</section>
      <section className="panel content-unit"><h2>Flashcard review history</h2>{reviews.length ? <ul>{reviews.slice(0, 12).map((item, i) => <li key={item.date + i}>{item.title} · {item.rating} · {formatDate(item.date)} · next {new Date(item.due).toLocaleString()}</li>)}</ul> : <p className="muted">No flashcard reviews recorded.</p>}</section>
      <section className="panel content-unit"><h2>Experience reports</h2>{evidence.filter(item => item.kind === 'experience').map(item => <p key={item.id}><strong>{item.context}</strong> · {item.dimension} · {formatDate(item.date)}<br />{item.subtopic}</p>)}<EvidenceForm key={selected} topic={selected} /></section>
    </>}
    <section className="panel content-unit"><h2>Progress backup</h2><p>Progress is stored locally on this browser and device. Download a JSON backup to restore it after clearing browser data or to move it to another device.</p>
      <div className="row wrap">
        <button className="button" type="button" onClick={() => downloadFile('sp-fast-reload-progress.json', JSON.stringify(progress, null, 2), 'application/json')}><Download size={16} />Export Progress (JSON)</button>
        <label className="button import-control"><Upload size={16} />Import Progress (JSON)<input aria-label="Import Progress (JSON)" type="file" accept=".json,application/json" disabled={importing} onChange={loadBackup} /></label>
        <button type="button" className="button danger" onClick={() => { setPending('reset'); setMessage('') }}><Trash2 size={16} />Reset progress</button>
      </div>
      {pending && <div className="answer" role="group" aria-label="Confirm change"><p>{pending === 'reset' ? 'Reset all local progress and preferences?' : 'Replace current progress with this backup?'}</p><div className="row wrap"><button type="button" className="button primary" onClick={() => { setProgress(pending === 'reset' ? initialProgress() : pending); setMessage(pending === 'reset' ? 'Progress reset.' : 'Backup restored.'); setPending(undefined) }}>{pending === 'reset' ? 'Confirm reset' : 'Replace progress'}</button><button className="button" type="button" onClick={() => setPending(undefined)}>Cancel</button></div></div>}
      {message && <p role="status">{message}</p>}
    </section>
  </div>
}
