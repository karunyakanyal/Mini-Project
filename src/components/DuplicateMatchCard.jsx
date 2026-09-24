import SimilarityBar from './SimilarityBar.jsx'
import { getFinderSimilarityLabel } from '../utils/textAnalysis.js'
export default function DuplicateMatchCard({ match, rank }) {
  return <li className="match-card">
    <span className="match-rank">#{rank}</span>
    <div className="match-question"><h3>{match.question}</h3><div className="match-meta"><span className="small-tag">{getFinderSimilarityLabel(match.similarity_score)}</span>{match.category && <span className="muted">{match.category}</span>}</div>
      {match.matched_terms && <div className="matched-terms"><span>Matched terms (normalized):</span>{match.matched_terms.length ? <div className="technical-tags">{match.matched_terms.map(term => <span key={term}>{term}</span>)}</div> : <span>None</span>}</div>}
    </div>
    <div className="match-score"><strong>{(match.similarity_score * 100).toFixed(1)}%</strong><SimilarityBar score={match.similarity_score} /></div>
  </li>
}
