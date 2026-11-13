import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { search } from '../lib/search'

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const results = search(query)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} className="search-dialog" aria-label="Global search" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="search-bar"><Search size={21} /><input aria-label="Search lessons and commands" placeholder="Search lessons, commands, labs, and faults…" value={query} onChange={event => setQuery(event.target.value)} autoFocus /><button type="button" className="icon-button" aria-label="Close search" onClick={onClose}><X size={18} /></button></div>
    <div className="search-results" aria-live="polite">
      {!query.trim() && <p className="muted">Try “16004”, “show mpls forwarding”, or “TI-LFA”.</p>}
      {query.trim() && !results.length && <p className="muted">No matching content.</p>}
      {results.map((result, i) => <Link key={result.href + i} to={result.href} onClick={onClose}><span><small>{result.kind}</small><strong>{result.title}</strong><span>{result.detail}</span></span><ArrowUpRight size={17} /></Link>)}
    </div>
  </dialog>
}
