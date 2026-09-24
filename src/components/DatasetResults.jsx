import { useState } from 'react'
import { getSimilarityLabel } from '../utils/textAnalysis.js'
import { createResultsCsv, downloadCsv } from '../utils/csv.js'

export default function DatasetResults({ result }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('highest')
  const [page, setPage] = useState(1)
  const filtered = result.pairs.filter(pair => filter === 'all' || getSimilarityLabel(pair.similarity_score) === filter)
    .slice().sort((a, b) => sort === 'highest' ? b.similarity_score - a.similarity_score : a.similarity_score - b.similarity_score)
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * 20, currentPage * 20)
  return <div className="tool-results">
    <div className="section-heading"><h3>Analysis Summary</h3><span className="small-tag">{result.method}</span></div>
    <dl className="dataset-summary"><div><dt>Total Questions</dt><dd>{result.total_questions}</dd></div><div><dt>Potential Duplicate Pairs</dt><dd>{result.pairs.length}</dd></div><div><dt>Highest Similarity</dt><dd>{(result.highest_similarity * 100).toFixed(1)}%</dd></div></dl>
    <p className="demo-note">Analysed {result.analysed_questions} questions. Pairs shown meet the {(result.threshold * 100).toFixed(0)}% candidate threshold; they are not confirmed duplicates.</p>
    <div className="dataset-toolbar">
      <label>Filter<select value={filter} onChange={event => { setFilter(event.target.value); setPage(1) }}><option value="all">All Matches</option><option>Highly Similar</option><option>Similar</option></select></label>
      <label>Sort<select value={sort} onChange={event => { setSort(event.target.value); setPage(1) }}><option value="highest">Highest Similarity</option><option value="lowest">Lowest Similarity</option></select></label>
      <button className="button secondary" disabled={!filtered.length} onClick={() => downloadCsv(createResultsCsv(filtered), 'querysense-results.csv')}>Export CSV</button>
    </div>
    <p className="demo-note">Export includes all {filtered.length} currently filtered pairs, in the selected order.</p>
    {visible.length ? <div className="table-scroll" role="region" aria-label="Potential duplicate pairs" tabIndex={0}><table className="pairs-table"><caption>Potential duplicate pairs</caption><thead><tr><th>Question A</th><th>Question B</th><th>Similarity</th><th>Status</th></tr></thead><tbody>{visible.map(pair => <tr key={pair.row1 + '-' + pair.row2}><td data-label="Question A">{pair.question1}</td><td data-label="Question B">{pair.question2}</td><td data-label="Similarity">{(pair.similarity_score * 100).toFixed(1)}%</td><td data-label="Status"><span className="small-tag" data-tone={getSimilarityLabel(pair.similarity_score) === 'Highly Similar' ? 'success' : 'warning'}>{getSimilarityLabel(pair.similarity_score)}</span></td></tr>)}</tbody></table></div> : <p className="empty-state">{result.pairs.length ? 'No pairs match this filter.' : 'No potential duplicate pairs meet the current threshold.'}</p>}
    {pageCount > 1 && <div className="pagination"><button className="button secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount}</span><button className="button secondary" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
  </div>
}

