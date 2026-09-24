import { useState } from 'react'
import { findSimilarQuestions, isMockMode, demoQuestionCount } from '../services/api.js'
import { FINDER_USEFUL_THRESHOLD, FINDER_LIMITS } from '../utils/textAnalysis.js'
import DuplicateMatchCard from '../components/DuplicateMatchCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function DuplicateFinder() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  function update(value) { setQuestion(value); setResult(null); setError('') }
  async function search(event) {
    event.preventDefault()
    if (loading || !question.trim()) return
    setLoading(true); setResult(null); setError('')
    try { setResult(await findSimilarQuestions(question.trim())) }
    catch { setError('Unable to search for similar questions. Please try again.') }
    finally { setLoading(false) }
  }
  const noMatch = result && (!result.matches.length || result.matches[0].similarity_score < FINDER_USEFUL_THRESHOLD)
  const visibleMatches = result?.matches.slice(0, noMatch ? FINDER_LIMITS.weak : FINDER_LIMITS.strong) || []
  return <section className="tool-section" id="finder" aria-labelledby="finder-heading">
    <div className="section-heading compare-heading"><div><p className="eyebrow">Duplicate Search</p><h1 id="finder-heading">Find Existing Duplicates</h1></div><span className="mode-badge">{isMockMode ? 'Demo Mode' : 'Backend Mode'}</span></div>
    <p className="intro">Enter a new question to check whether similar questions already exist.</p>
    <form className="card" onSubmit={search} aria-busy={loading}>
      <div className="tool-input"><label htmlFor="finder-question">New Question</label><textarea id="finder-question" maxLength={500} rows={5} value={question} disabled={loading} onChange={event => update(event.target.value)} placeholder="How can I start learning Python?" aria-describedby="finder-count" required /><span className="character-counter" id="finder-count">{question.length} / 500</span></div>
      <div className="workspace-actions"><div className="form-actions"><button className="button primary" disabled={loading || !question.trim()}>{loading ? 'Searching...' : 'Find Similar Questions'}</button><button className="button quiet" type="button" onClick={() => update('')} disabled={loading}>Clear</button></div>
        <div className="example-actions"><span>Try example:</span><button type="button" disabled={loading} onClick={() => update('How can I start learning Python?')}>Python Learning</button><button type="button" disabled={loading} onClick={() => update('What is cloud computing?')}>Cloud Computing</button></div>
      </div>
    </form>
    <p className="demo-note">{isMockMode ? `Searching ${demoQuestionCount} demonstration questions using local text similarity.` : 'Searches the connected question repository. Match labels use display thresholds.'}</p>
    {isMockMode && <p className="demo-note">Demo repository &middot; No external database connected. Uses known word forms and a small concept map, not a semantic model.</p>}
    <ErrorMessage message={error} />
    <div aria-live="polite" aria-atomic="true">
      {loading && <p className="empty-state">Searching questions...</p>}
      {!result && !loading && !error && <p className="empty-state">Enter a question to search {isMockMode ? 'the demonstration question repository' : 'the question repository'}.</p>}
      {result && <div className="tool-results">
        {noMatch && <div className="empty-state"><h3>No strong duplicates found</h3><p>We did not find a question at or above the current {isMockMode ? 'demo ' : ''}candidate threshold ({FINDER_USEFUL_THRESHOLD * 100}%). These are the closest matches in the {isMockMode ? 'demonstration ' : ''}repository.</p></div>}
        <div className="section-heading"><h3>{noMatch ? 'Closest Matches' : 'Potential Duplicates'}</h3><span className="muted">{visibleMatches.length} matches &middot; {result.method}</span></div>
        {!noMatch && <p className="demo-note">Review these candidates before posting; similar wording does not guarantee the same meaning.</p>}
        <ol className="match-list">{visibleMatches.map((match, index) => <DuplicateMatchCard key={match.id} match={match} rank={index + 1} />)}</ol>
      </div>}
    </div>
  </section>
}
