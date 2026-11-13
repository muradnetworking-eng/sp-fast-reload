import { useEffect, useState } from 'react'
import { ArrowRight, Download, RotateCcw } from 'lucide-react'
import { technologies } from '../data/library'
import { ankiField, downloadFile } from '../lib/files'
import { useProgress } from '../state/context'
import { isDue, ratings, schedule, weakAreas, type Rating } from '../state/progress'

export function FlashcardsPage() {
  const { progress, setProgress } = useProgress()
  const [selected, setSelected] = useState(technologies[0]?.id ?? '')
  const [subtopic, setSubtopic] = useState('')
  const [dueOnly, setDueOnly] = useState(true)
  const [active, setActive] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])
  const topic = technologies.find(item => item.id === selected)
  const all = topic?.cards ?? []
  const due = all.filter(card => isDue(progress.reviews[selected + ':' + card.id], now))
  const weak = weakAreas(progress.evidence, selected)
  const eligible = (dueOnly ? due : all).filter(item => !subtopic || item.subtopic === subtopic)
  const deck = eligible.sort((a, b) => Number(weak.includes(b.subtopic)) - Number(weak.includes(a.subtopic)))
  const card = deck.find(item => item.id === active) ?? deck[0]
  const history = card ? progress.reviews[selected + ':' + card.id] : undefined
  const last = history?.at(-1)

  function rate(rating: Rating) {
    if (!card) return
    const key = selected + ':' + card.id
    const review = schedule(rating, last)
    const id = crypto.randomUUID()
    const next = deck[(deck.findIndex(item => item.id === card.id) + 1) % deck.length]
    setProgress(previous => ({
      ...previous,
      reviews: { ...previous.reviews, [key]: [...(previous.reviews[key] ?? []), review] },
      evidence: [...previous.evidence, { id, topic: selected, target: card.id, kind: 'review', context: 'Studied', dimension: card.dimension, date: review.date, subtopic: card.subtopic, score: ratings.indexOf(rating) + 1 }],
    }))
    setMessage(rating + ' recorded. Next review ' + new Date(review.due).toLocaleString() + '.')
    setNow(new Date())
    setActive(next.id)
    setFlipped(false)
  }
  function exportAnki() {
    const rows = all.filter(item => !subtopic || item.subtopic === subtopic).map(item => [
      ankiField(selected + ':' + item.id), ankiField(item.front), ankiField(item.back), ankiField(selected + ' ' + item.subtopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    ].join('\t'))
    downloadFile(selected + '-anki.tsv', ['#separator:Tab', '#html:true', '#columns:ID\tFront\tBack\tTags', '#tags column:4', ...rows].join('\n'), 'text/tab-separated-values;charset=utf-8')
  }
  return <div className="stack">
    <div className="page-heading"><h1>Flashcards / Anki</h1><p className="lead">Recall forwarding behavior and verify your answer before rating it.</p></div>
    <div className="panel content-unit">
      <div className="selector-grid"><label>Technology<select value={selected} onChange={event => { setSelected(event.target.value); setSubtopic(''); setActive(''); setFlipped(false) }}>{technologies.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>Subtopic<select value={subtopic} onChange={event => { setSubtopic(event.target.value); setActive(''); setFlipped(false) }}><option value="">All subtopics</option>{[...new Set(all.map(item => item.subtopic))].sort().map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Review queue<select value={dueOnly ? 'due' : 'all'} onChange={event => { setDueOnly(event.target.value === 'due'); setActive(''); setFlipped(false) }}><option value="due">Due cards</option><option value="all">All cards</option></select></label></div>
      <p className="muted">{due.length} due of {all.length} cards</p>
      <div className="row wrap"><button type="button" className="button" disabled={!all.length} onClick={exportAnki}><Download size={16} />Export Anki TSV</button>{topic?.ankiPackage && <a className="button" download href={import.meta.env.BASE_URL + topic.ankiPackage}><Download size={16} />Download full Anki deck (.apkg)</a>}</div>
    </div>
    {card ? <section className="panel content-unit flashcard"><p className="kicker">{card.subtopic}</p><h2>{card.front}</h2>
      {flipped && <p className="answer">{card.back}</p>}
      <p className="muted">{last ? 'Last reviewed ' + new Date(last.date).toLocaleString() + ' · next ' + new Date(last.due).toLocaleString() : 'Unreviewed'}</p>
      <div className="row wrap"><button className="button primary" type="button" onClick={() => setFlipped(value => !value)}><RotateCcw size={16} />{flipped ? 'Hide answer' : 'Flip card'}</button>
      <button className="button" type="button" disabled={deck.length < 2} onClick={() => { setActive(deck[(deck.findIndex(item => item.id === card.id) + 1) % deck.length].id); setFlipped(false) }}>Next card<ArrowRight size={16} /></button>
      {flipped && ratings.map(rating => <button className="button" key={rating} type="button" onClick={() => rate(rating)}>{rating}</button>)}</div>
    </section> : <p className="panel content-unit">No cards in this review queue.</p>}
    {message && <p role="status">{message}</p>}
  </div>
}
