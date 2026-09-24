import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import ScrollToTop from './ScrollToTop.jsx'
export default function AppLayout() {
  return <div className="app-layout">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <ScrollToTop />
    <Header />
    <main className="container page-content" id="main-content" tabIndex={-1}><Outlet /></main>
    <footer className="container footer"><div><strong>QuerySense</strong><span>CSE Mini Project</span></div><p>Duplicate Question Detection Using Text Similarity Techniques</p></footer>
  </div>
}
