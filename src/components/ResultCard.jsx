import StatusBadge from './StatusBadge.jsx'
import SimilarityBar from './SimilarityBar.jsx'
import ExplainableResult from './ExplainableResult.jsx'

export default function ResultCard({ result }) {
  return <section className="card result-card" aria-labelledby="result-heading">
    <div className="result-heading"><h2 id="result-heading">Analysis Result</h2><span className="small-tag">Comparison complete</span></div>
    <div className="result-grid">
      <div className="result-score"><h3>Similarity Score</h3><strong className="score" data-tone={result.is_duplicate ? 'success' : 'danger'}>{(result.similarity_score * 100).toFixed(1)}<span>%</span></strong>
        <div className="progress-row"><span>0%</span><SimilarityBar score={result.similarity_score} tone={result.is_duplicate ? 'success' : 'danger'} /><span>100%</span></div>
      </div>
      <div><h3>Classification</h3><StatusBadge isDuplicate={result.is_duplicate} /></div>
      <div><h3>Method</h3><p className="method">{result.method}</p></div>
    </div>
    <p className="result-description">{result.is_duplicate ? 'The questions show a high level of similarity based on the current comparison method.' : 'The questions do not meet the current similarity threshold for duplicate classification.'}</p>
    {result.analysis && <ExplainableResult analysis={result.analysis} />}
  </section>
}
