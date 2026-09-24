import SimilarityBar from './SimilarityBar.jsx'
import { getFinderSimilarityLabel } from '../utils/textAnalysis.js'
export default function DuplicateMatchCard({ match, rank }) {
  const label = getFinderSimilarityLabel(match.similarity_score)
  const tone = label === 'Highly Similar' ? 'success' : label === 'Low Similarity' ? 'danger' : 'warning'
  return <li className="match-card">
    <span className="match-rank">#{rank}</span>
    <div className="match-question"><h3>{match.question}</h3><div className="match-meta"><span className="small-tag" data-tone={tone}>{label}</span>{match.category && <span className="muted">{match.category}</span>}</div>
      {match.matched_terms && <div className="matched-terms"><span>Matched terms (normalized):</span>{match.matched_terms.length ? <div className="technical-tags">{match.matched_terms.map(term => <span key={term}>{term}</span>)}</div> : <span>None</span>}</div>}
    </div>
    <div className="match-score" data-tone={tone}><strong>{(match.similarity_score * 100).toFixed(1)}%</strong><SimilarityBar score={match.similarity_score} tone={tone} /></div>
  </li>
}
