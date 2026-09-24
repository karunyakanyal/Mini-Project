function Terms({ terms }) {
  return terms.length ? <div className="technical-tags">{terms.map(term => <span key={term}>{term}</span>)}</div> : <p className="muted">None</p>
}
function HighlightedQuestion({ text, matched }) {
  // React escapes all original text; punctuation and whitespace are retained.
  return <p className="highlighted-question">{text.split(/([\p{L}\p{N}]+)/u).map((part, index) =>
    matched.includes(part.toLowerCase()) ? <mark key={index}>{part}</mark> : part
  )}</p>
}
export default function ExplainableResult({ analysis }) {
  const { first, second, matched, unique1, unique2, score, threshold } = analysis
  return <div className="explainable-result">
    <h3>Why this result?</h3>
    <p className="demo-note">Demo word-overlap explanation. This is not semantic NLP/ML inference.</p>
    <ul className="explanation-list">
      <li>{matched.length} meaningful {matched.length === 1 ? 'term appears' : 'terms appear'} in both questions.</li>
      <li>{unique1.length + unique2.length} meaningful terms appear in only one question.</li>
      <li>The score is {score >= threshold ? 'at or above' : 'below'} the {(threshold * 100).toFixed(0)}% demo duplicate threshold.</li>
    </ul>
    <div className="term-grid">{[['Matched Terms', matched], ['Unique to Question 1', unique1], ['Unique to Question 2', unique2]].map(([title, terms]) => <div key={title}><h4>{title}</h4><Terms terms={terms} /></div>)}</div>
    <h3>Text Comparison</h3>
    <div className="text-comparison">{[first, second].map((question, index) => <div key={index}><h4>Question {index + 1}</h4><HighlightedQuestion text={question.original} matched={matched} /></div>)}</div>
    <details className="text-analysis"><summary>View Text Analysis</summary>
      <div className="text-comparison">{[first, second].map((question, index) => <div key={index}>
        <h4>Question {index + 1}</h4><dl className="analysis-fields"><dt>Original</dt><dd>{question.original}</dd><dt>Normalized</dt><dd>{question.normalized || 'No words remain.'}</dd><dt>Meaningful Tokens (unique)</dt><dd><Terms terms={question.tokens} /></dd></dl>
      </div>)}</div>
      <h4>Analysis Summary</h4>
      <ul className="explanation-list"><li>Matched meaningful terms: {matched.length}</li><li>Question 1 meaningful terms: {first.tokens.length}</li><li>Question 2 meaningful terms: {second.tokens.length}</li></ul>
      <p className="muted">Method: Demo Text Similarity. Dice overlap = 2 &times; shared terms / total unique terms across both questions. Empty vocabularies score 0.</p>
    </details>
  </div>
}

