import { useEffect, useState } from 'react'
import { Activity, BookOpen, Bookmark, Box, FlaskConical, GraduationCap, LayoutDashboard, Menu, Mic, Moon, Network, Route, Search, Sun, X, Zap } from 'lucide-react'
import { Link, NavLink, Route as RouterRoute, Routes, useLocation } from 'react-router-dom'
import { BookmarksPage, CollectionPage, Dashboard, LibraryPage, collections, type Collection } from './components/Pages'
import { TopicPage } from './components/Topic'
import { ReadinessPage } from './components/Readiness'
import { FlashcardsPage } from './components/Flashcards'
import { SearchDialog } from './components/Search'
import { useProgress } from './state/context'

const groups = [
  { title: 'Workspace', links: [
    { to: '/', title: 'Dashboard', Icon: LayoutDashboard },
    { to: '/library', title: 'Technology Library', Icon: BookOpen },
    { to: '/refresh', title: 'Quick Refresh', Icon: Zap },
  ] },
  { title: 'Practice', links: [
    { to: '/labs', title: 'Hands-On Labs', Icon: FlaskConical },
    { to: '/troubleshoot', title: 'Troubleshooting Library', Icon: Activity },
    { to: '/interview', title: 'Interview Simulator', Icon: Mic },
    { to: '/decisions', title: 'Architecture Decision Center', Icon: Route },
    { to: '/teach', title: 'Instructor / Training Center', Icon: GraduationCap },
  ] },
  { title: 'My study', links: [
    { to: '/flashcards', title: 'Flashcards / Anki', Icon: Box },
    { to: '/bookmarks', title: 'Bookmarks & Pinned Topics', Icon: Bookmark },
    { to: '/readiness', title: 'My Readiness', Icon: Activity },
  ] },
]

export function App() {
  const [mobile, setMobile] = useState(false)
  const [search, setSearch] = useState(false)
  const { pathname, hash } = useLocation()
  const { progress, setProgress, persistenceError } = useProgress()
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearch(value => !value)
      }
      if (event.key === 'Escape') setMobile(false)
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
    <aside className={'sidebar' + (mobile ? ' open' : '')} id="site-navigation">
      <Link className="brand" to="/" onClick={() => setMobile(false)}><span className="brand-icon"><Network size={23} /></span><span>SP Fast-Reload<small>Cisco SP engineering</small></span></Link>
      <nav aria-label="Main navigation">{groups.map(group => <div key={group.title} className="nav-group"><p>{group.title}</p>{group.links.map(({ to, title, Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobile(false)}><Icon size={17} /><span>{title}</span></NavLink>)}</div>)}</nav>
      <div className="sidebar-footer"><span className="live-dot" />Browser-local progress</div>
    </aside>
    {mobile && <button className="mobile-scrim" aria-label="Close navigation" type="button" onClick={() => setMobile(false)} />}
    <div className="app-frame">
      <header className="topbar"><button type="button" className="icon-button mobile-toggle" aria-label={mobile ? 'Close navigation' : 'Open navigation'} aria-expanded={mobile} aria-controls="site-navigation" onClick={() => setMobile(value => !value)}>{mobile ? <X size={23} /> : <Menu size={23} />}</button><span className="topbar-brand">SP Fast-Reload</span>
      <div className="topbar-actions"><button type="button" className="search-trigger" onClick={() => setSearch(true)}><Search size={17} /><span>Search engineering content</span><kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd></button><button type="button" className="icon-button theme-button" aria-label={'Switch to ' + (progress.theme === 'dark' ? 'light' : 'dark') + ' theme'} onClick={() => setProgress(previous => ({ ...previous, theme: previous.theme === 'dark' ? 'light' : 'dark' }))}>{progress.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button></div></header>
      <main id="main" tabIndex={-1}>
        {persistenceError && <p className="persistence-warning" role="alert">Browser storage is unavailable or full. Export your progress from My Readiness before closing this page.</p>}
        <Routes>
          <RouterRoute path="/" element={<Dashboard />} />
          <RouterRoute path="/library" element={<LibraryPage />} />
          <RouterRoute path="/technology/:id/:tab?/:section?/:item?" element={<TopicPage />} />
          {Object.keys(collections).map(id => <RouterRoute key={id} path={'/' + id} element={<CollectionPage id={id as Collection} />} />)}
          <RouterRoute path="/flashcards" element={<FlashcardsPage />} />
          <RouterRoute path="/bookmarks" element={<BookmarksPage />} />
          <RouterRoute path="/readiness" element={<ReadinessPage />} />
          <RouterRoute path="*" element={<section className="page-heading"><h1>Page unavailable</h1><Link to="/">Return to Dashboard</Link></section>} />
        </Routes>
      </main>
    </div>
    {search && <SearchDialog onClose={() => setSearch(false)} />}
  </>
}
