import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
const themes = ['slate', 'teal', 'graphite']
function savedTheme() {
  try { const stored = localStorage.getItem('querysense-theme'); return themes.includes(stored) ? stored : 'slate' }
  catch { return 'slate' }
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
      <label className="theme-control" htmlFor="theme-select"><span className="theme-swatch" aria-hidden="true" /><span className="sr-only">Color theme</span>
        <select id="theme-select" value={theme} onChange={event => setTheme(event.target.value)}>
          <option value="slate">Academic Blue</option><option value="teal">Engineering Teal</option><option value="graphite">Graphite</option>
        </select>
      </label>
    </div>
  </div></header>
}
