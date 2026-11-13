import { useState } from 'react'
import { Activity, ArrowRight, ArrowUpRight, Bookmark, BookOpen, Clock3, FlaskConical, Layers3, Pin, RotateCcw, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import { library, technologies, topicUrl } from '../data/library'
import type { Technology } from '../schemas/content'
import { useProgress } from '../state/context'
import { isDue, weakAreas } from '../state/progress'
import { formatDate } from './Content'
import { PinButton } from './Topic'

export const collections = {
  refresh: { title: 'Quick Refresh', description: 'Recover the control plane, forwarding behavior, and critical checks.', section: ['reload'], link: 'Open 15-Min Reload' },
  labs: { title: 'Hands-On Labs', description: 'Build and verify the topology, then work through faults.', section: ['operations', 'lab'], link: 'Open hands-on lab' },
  troubleshoot: { title: 'Troubleshooting Library', description: 'Start from a symptom and choose the next useful evidence.', section: ['operations', 'troubleshoot'], link: 'Open troubleshooting tickets' },
  interview: { title: 'Interview Simulator', description: 'Work through senior-level scenarios and score your own reasoning.', section: ['interview', 'mock'], link: 'Start mock interview' },
  decisions: { title: 'Architecture Decision Center', description: 'Work from customer constraints to a defensible implementation and verification plan.', section: ['guide', 'decisions'], link: 'Open architecture decisions' },
  teach: { title: 'Instructor / Training Center', description: 'Prepare a teach-back, a demonstration, and a student lab.', section: ['interview', 'teach'], link: 'Open instructor mode' },
}
export type Collection = keyof typeof collections

function TopicCard({ topic }: { topic: Technology }) {
  const { progress } = useProgress()
  const href = (tab: string, section?: string) => topicUrl(topic.id, tab, section)
  const stages = topic.stages.filter(item => progress.completed[topic.id + ':' + item.id]).length
  const evidence = progress.evidence.filter(item => item.topic === topic.id)
  const reviewDate = evidence.filter(item => item.kind === 'review').map(item => item.date).sort().at(-1)
  return <article className="panel topic-card">
    <div className="section-heading"><div className="row"><span className="feature-icon"><Layers3 size={21} /></span><span className="tag">{topic.category}</span></div><PinButton topic={topic} /></div>
    <h3><Link to={href('reload')}>{topic.title}<ArrowUpRight size={17} /></Link></h3>
    <p>{topic.description}</p>
    <div className="row wrap topic-facts"><span><Activity size={15} />{stages} / {topic.stages.length} stages studied</span><span><Clock3 size={15} />{reviewDate ? 'Reviewed ' + formatDate(reviewDate) : 'No reviews yet'}</span></div>
    <div className="card-actions">
      {([['reload', '15-Min Reload'], ['guide', 'Learning guide'], ['operations', 'Lab', 'lab'], ['operations', 'Troubleshoot', 'troubleshoot'], ['interview', 'Mock interview', 'mock'], ['guide', 'Design', 'decisions'], ['interview', 'Instructor', 'teach']] as const).map(([tab, title, section]) => <Link key={title} to={href(tab, section)}>{title}<ArrowRight size={13} /></Link>)}
    </div>
  </article>
}

export function Dashboard() {
  const { progress } = useProgress()
  const recent = progress.recent[0]
  const featured = technologies.find(topic => progress.pinned.includes(topic.id)) ?? technologies[0]
  const stageTotal = technologies.reduce((total, topic) => total + topic.stages.length, 0)
  const stages = technologies.reduce((total, topic) => total + topic.stages.filter(unit => progress.completed[topic.id + ':' + unit.id]).length, 0)
  const due = technologies.reduce((total, topic) => total + topic.cards.filter(card => isDue(progress.reviews[topic.id + ':' + card.id])).length, 0)
  const weak = weakAreas(progress.evidence)
  const pins = technologies.filter(topic => progress.pinned.includes(topic.id))
  const latest = progress.evidence.filter(item => item.kind === 'review').map(item => item.date).sort().at(-1)
  return <div className="stack dashboard">
    <div className="page-heading"><p className="kicker">Engineering command center</p><h1>Dashboard</h1><p className="lead">Cisco service provider reference, practice, and readiness.</p></div>
    {featured && <section className="hero">
      <div className="hero-content"><p className="kicker"><span className="live-dot" />{progress.pinned.includes(featured.id) ? 'Pinned technology' : 'Featured technology'}</p><h2>{featured.title}</h2><p>{featured.description}</p>
      <div className="row wrap"><Link className="button primary" to={recent?.href ?? topicUrl(featured.id, 'guide', 'understand')}>{recent ? 'Resume last session' : 'Start learning'}<ArrowRight size={17} /></Link><Link className="button secondary" to={topicUrl(featured.id)}>15-Min Reload</Link></div>
      {recent && <p className="resume-caption">Last opened {recent.title}</p>}</div>
      <div className="hero-topology" aria-hidden="true"><div className="topology-node">PE1</div><div className="topology-middle"><span>P1</span><span>P2</span></div><div className="topology-node">PE2</div></div>
    </section>}
    <div className="summary-grid dashboard-summary">
      <Link to="/readiness" className="panel summary-cell"><span><BookOpen size={17} />Study progress</span><strong>{stages} / {stageTotal}</strong><small>Learning stages studied</small></Link>
      <Link to="/flashcards" className="panel summary-cell"><span><RotateCcw size={17} />Due flashcards</span><strong>{due}</strong><small>{latest ? 'Last review ' + formatDate(latest) : 'No review history yet'}</small></Link>
      <Link to="/readiness" className="panel summary-cell"><span><Activity size={17} />Weak subtopics</span><strong>{weak.length}</strong><small>{weak.length ? weak.slice(0, 2).join(' · ') : 'From recorded practice'}</small></Link>
    </div>
    <div className="section-heading"><h2>Technology workspace</h2><Link className="text-link" to="/library">All technologies <ArrowRight size={15} /></Link></div>
    {technologies.map(topic => <TopicCard key={topic.id} topic={topic} />)}
    <div className="dashboard-bottom">
      <section className="panel content-unit"><h2><Pin size={18} />Pinned technologies</h2>{pins.length ? <ul className="link-list">{pins.map(topic => <li key={topic.id}><Link to={topicUrl(topic.id)}>{topic.title}<ArrowRight size={15} /></Link></li>)}</ul> : <p className="muted">Pin a technology to keep it here.</p>}</section>
      <section className="panel content-unit"><h2><Clock3 size={18} />Recently viewed</h2>{progress.recent.length ? <ul className="link-list">{progress.recent.slice(0, 5).map(item => <li key={item.href}><Link to={item.href}>{item.title}<ArrowRight size={15} /></Link></li>)}</ul> : <p className="muted">Your recently opened sections appear here.</p>}</section>
    </div>
  </div>
}

export function LibraryPage() {
  const [filter, setFilter] = useState('All')
  return <div className="stack"><div className="page-heading"><h1>Technology Library</h1><p className="lead">Open a module to study, configure, or prepare for a customer engagement.</p></div>
    <div className="row wrap" aria-label="Filter technology domains">{['All', 'Underlay', 'Transport', 'Services', 'Operations'].map(item => <button className={item === filter ? 'button positive' : 'button'} aria-pressed={item === filter} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    {library.filter(entry => filter === 'All' || entry.category === filter).flatMap(entry => entry.module ? [<TopicCard key={entry.id} topic={entry.module} />] : [])}
    <div className="library-grid">{library.filter(entry => !entry.module && (filter === 'All' || entry.category === filter)).map(entry => <Link className="panel library-card" key={entry.id} to={topicUrl(entry.id)}><span className="tag">Not Yet Developed</span><h2>{entry.title}</h2><p>{entry.description}</p></Link>)}</div>
  </div>
}

export function CollectionPage({ id }: { id: Collection }) {
  const collection = collections[id]
  return <div className="stack"><div className="page-heading"><h1>{collection.title}</h1><p className="lead">{collection.description}</p></div>
    {technologies.map(topic => {
      const base = topicUrl(topic.id, ...collection.section as [string, string?])
      const links = id === 'troubleshoot' ? topic.faults : id === 'decisions' ? topic.decisions : id === 'teach' ? topic.instructor : id === 'labs' ? [topic.lab.setup, ...topic.lab.milestones] : []
      return <section key={topic.id} className="panel content-unit"><div className="section-heading"><h2>{topic.title}</h2>{id === 'labs' ? <FlaskConical size={22} /> : <Route size={22} />}</div><Link className="button primary" to={base}>{collection.link}<ArrowRight size={16} /></Link>
        {links.length > 0 && <ul className="link-list">{links.map(item => <li key={item.id}><Link to={base + '/' + item.id}>{item.title}<ArrowRight size={15} /></Link></li>)}</ul>}
      </section>
    })}
  </div>
}

export function BookmarksPage() {
  const { progress, setProgress } = useProgress()
  const pins = technologies.filter(topic => progress.pinned.includes(topic.id))
  return <div className="stack"><div className="page-heading"><h1>Bookmarks & Pinned Topics</h1></div>
    <section className="panel content-unit"><h2><Pin size={18} />Pinned topics</h2>{pins.length ? pins.map(topic => <div className="row between" key={topic.id}><Link to={topicUrl(topic.id)}>{topic.title}</Link><PinButton topic={topic} /></div>) : <p className="muted">No pinned topics.</p>}</section>
    <section className="panel content-unit"><h2><Bookmark size={18} />Bookmarks</h2>{progress.bookmarks.length ? <ul className="link-list">{progress.bookmarks.map(item => <li className="row between" key={item.href}><Link to={item.href}>{item.title}</Link><button type="button" className="button" aria-label={'Remove bookmark for ' + item.title} onClick={() => setProgress(previous => ({ ...previous, bookmarks: previous.bookmarks.filter(value => value.href !== item.href) }))}>Remove</button></li>)}</ul> : <p className="muted">Bookmark a topic, lesson, CLI block, or troubleshooting case to return to it.</p>}</section>
  </div>
}
