export default function QuestionComparisonForm({ question1, question2, onQuestionChange, onCompare, onSwap, onClear, onExample, loading }) {
  return <form className="card comparison-card" onSubmit={onCompare} aria-busy={loading}>
    <div className="question-grid">{[question1, question2].map((question, index) =>
      <div className="input-group" key={index}>
        <div className="input-heading"><span className="input-number" aria-hidden="true">0{index + 1}</span><div>
          <label htmlFor={`question-${index + 1}`}>Question {index + 1}</label>
          <p id={`hint-${index + 1}`}>{index === 0 ? 'Source question' : 'Comparison question'}</p>
        </div></div>
        <textarea id={`question-${index + 1}`} rows={6} maxLength={500} value={question} disabled={loading}
          onChange={event => onQuestionChange(index, event.target.value)}
          placeholder={index === 0 ? 'How can I learn Python effectively?' : 'What is the best way to learn Python?'}
          aria-describedby={`hint-${index + 1} count-${index + 1}`} required />
        <span className="character-counter" id={`count-${index + 1}`}>{question.length} / 500<span className="sr-only"> characters</span></span>
      </div>
    )}</div>
    <div className="workspace-actions">
      <div className="form-actions">
        <button className="button primary" type="submit" disabled={loading || !question1.trim() || !question2.trim()}>{loading && <span className="spinner" aria-hidden="true" />}{loading ? 'Analysing...' : 'Compare Questions'}</button>
        <button className="button secondary" type="button" onClick={onSwap} disabled={loading || (!question1 && !question2)} aria-label="Swap questions"><span aria-hidden="true">&#8644;</span>Swap</button>
        <button className="button quiet" type="button" onClick={onClear} disabled={loading}>Clear</button>
      </div>
      <div className="example-actions"><span>Try an example:</span>
        <button type="button" onClick={() => onExample('similar')} disabled={loading}>Similar pair</button>
        <button type="button" onClick={() => onExample('different')} disabled={loading}>Different pair</button>
      </div>
    </div>
    <span className="sr-only" role="status">{loading ? 'Analysing questions. Please wait.' : ''}</span>
  </form>
}
