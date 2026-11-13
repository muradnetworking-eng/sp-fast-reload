import { useState, type ReactNode } from 'react'
import { Bookmark, Check, ChevronDown, Copy } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import type { Block, Technology, Unit } from '../schemas/content'
import { useProgress } from '../state/context'

export const formatDate = (date?: string) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date)) : 'No reviews yet'

export function BookmarkButton({ title, href }: { title: string; href: string }) {
  const { progress, setProgress } = useProgress()
  const saved = progress.bookmarks.some(item => item.href === href)
  return <button type="button" className="icon-button" aria-label={(saved ? 'Remove bookmark for ' : 'Bookmark ') + title} title={saved ? 'Remove bookmark' : 'Bookmark'} aria-pressed={saved} onClick={() => {
    const item = { href, title, date: new Date().toISOString() }
    setProgress(previous => ({
      ...previous,
      bookmarks: saved ? previous.bookmarks.filter(value => value.href !== href) : [...previous.bookmarks, item],
    }))
  }}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button>
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState('')
  async function copy() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value)
      } else {
        const field = document.createElement('textarea')
        const active = document.activeElement
        field.value = value
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.append(field)
        field.select()
        const ok = document.execCommand('copy')
        field.remove()
        if (active instanceof HTMLElement) active.focus()
        if (!ok) throw new Error('Clipboard unavailable')
      }
      setStatus('Copied')
    } catch { setStatus('Copy unavailable. Select the text to copy.') }
  }
  return <span className="copy-control"><button type="button" className="icon-button" aria-label={'Copy ' + label} title={'Copy ' + label} onClick={copy}><Copy size={15} /></button><span role="status">{status}</span></span>
}

export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="table-scroll" tabIndex={0}><table><thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>
}

export function Blocks({ blocks, prefix, origin }: { blocks: Block[]; prefix: string; origin?: string }) {
  const { pathname } = useLocation()
  return <div className="blocks">{blocks.map((block, i) => {
    const id = prefix + '-block-' + (i + 1)
    if (block.kind === 'text') return <p key={id}>{block.text}</p>
    if (block.kind === 'list') return <ul key={id}>{block.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    if (block.kind === 'table') return <DataTable key={id} headers={block.headers} rows={block.rows} />
    if (block.kind === 'advanced') return <details key={id} id={id} className="disclosure"><summary>{block.title}<ChevronDown size={16} /></summary><Blocks blocks={block.blocks} prefix={id} origin={origin} /></details>
    const title = block.title ?? 'Topology diagram'
    const value = block.kind === 'cli' ? block.code : block.text
    return <figure key={id} id={id} className="code-frame">
      <figcaption><span>{title}{block.kind === 'cli' && <small>{block.os}</small>}</span><span className="row">
        <CopyButton value={value} label={title} />{origin && <BookmarkButton title={title} href={(origin || pathname) + '#' + id} />}
      </span></figcaption>
      {block.kind === 'cli' && <p>{block.note}</p>}
      <pre tabIndex={0}><code>{value}</code></pre>
      {block.kind === 'cli' && block.output && <><small className="code-label">Illustrative output</small><pre tabIndex={0}><code>{block.output}</code></pre></>}
      {block.kind === 'cli' && block.interpretation && <p>{block.interpretation}</p>}
    </figure>
  })}</div>
}

export function UnitView({ unit, topic, href, children }: { unit: Unit; topic: Technology; href: string; children?: ReactNode }) {
  const { progress, setProgress } = useProgress()
  const target = topic.id + ':' + unit.id
  const completed = Boolean(progress.completed[target])
  function toggle() {
    const date = new Date().toISOString()
    const id = crypto.randomUUID()
    setProgress(previous => {
      const completed = { ...previous.completed }
      if (completed[target]) {
        delete completed[target]
        return { ...previous, completed, evidence: previous.evidence.filter(entry => entry.kind !== 'study' || entry.topic !== topic.id || entry.target !== unit.id) }
      }
      return {
        ...previous, completed: { ...completed, [target]: date },
        evidence: [...previous.evidence, { id, topic: topic.id, target: unit.id, kind: 'study', dimension: unit.dimension, context: 'Studied', date }],
      }
    })
  }
  return <section id={unit.id} className="panel content-unit">
    <div className="section-heading"><div><h2>{unit.title}</h2><p>{unit.summary}</p></div><BookmarkButton title={unit.title} href={href} /></div>
    <Blocks blocks={unit.blocks} prefix={unit.id} origin={href} />
    {children}
    <div className="unit-footer"><button type="button" className={completed ? 'button positive' : 'button'} onClick={toggle} aria-pressed={completed}><Check size={16} />{completed ? 'Studied' : 'Mark as studied'}</button>{completed && <span className="muted">{formatDate(progress.completed[target])}</span>}</div>
  </section>
}
