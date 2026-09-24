import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
const themes = ['light', 'dark']
function savedTheme() {
  try { const stored = localStorage.getItem('querysense-theme'); return themes.includes(stored) ? stored : 'light' }
  catch { return 'light' }
}
export default function Header() {
  const [theme, setTheme] = useState(savedTheme)
  const [openPath, setOpenPath] = useState(null)
  const { pathname } = useLocation()
  const menuOpen = openPath === pathname
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('querysense-theme', theme) } catch { /* Storage may be unavailable. */ }
  }, [theme])
  return <header className="site-header"><div className="container header-inner" onKeyDown={event => {
    if (event.key === 'Escape' && menuOpen) { setOpenPath(null); document.getElementById('menu-toggle')?.focus() }
  }}>
    <Link className="brand" to="/compare" aria-label="QuerySense home" onClick={() => setOpenPath(null)}>
      <span className="brand-mark" aria-hidden="true">Q</span><span className="brand-copy"><strong>QuerySense</strong><span className="brand-subtitle">Duplicate Question Detection</span></span>
    </Link>
    <button className="button secondary menu-toggle" id="menu-toggle" aria-expanded={menuOpen} aria-controls="header-controls" onClick={() => setOpenPath(menuOpen ? null : pathname)}>{menuOpen ? 'Close' : 'Menu'}</button>
    <div className={`header-controls ${menuOpen ? 'is-open' : ''}`} id="header-controls">
      <nav aria-label="Main navigation">{[['compare', 'Compare'], ['finder', 'Duplicate Finder'], ['dataset', 'Dataset Analyzer'], ['how-it-works', 'How It Works'], ['about', 'About']].map(([path, label]) =>
        <NavLink to={`/${path}`} key={path} onClick={() => setOpenPath(null)}>{label}</NavLink>
      )}</nav>
      <button className="button secondary theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label={`Switch to ${theme === 'light' ? 'Deep Navy Technical dark' : 'Academic Blue light'} theme`} title={theme === 'light' ? 'Academic Blue / Light theme' : 'Deep Navy Technical / Dark theme'}>
        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          {theme === 'light' ? <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
        </svg>{theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
    </div>
  </div></header>
}
