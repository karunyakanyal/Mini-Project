import { useState } from 'react'
import QuestionComparisonForm from '../components/QuestionComparisonForm.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import ResultCard from '../components/ResultCard.jsx'
import { compareQuestions, isMockMode } from '../services/api.js'


export default function ComparePage() {
  const [question1, setQuestion1] = useState('')
  const [question2, setQuestion2] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCompare(event) {
    event.preventDefault()
    if (loading || !question1.trim() || !question2.trim()) return
    setError('')
    setResult(null)
    setLoading(true)
    try { setResult(await compareQuestions(question1.trim(), question2.trim())) }
    catch { setError('Unable to analyse the questions. Please try again.') }
    finally { setLoading(false) }
  }
  function handleClear() {
    setQuestion1('')
    setQuestion2('')
    setResult(null)
    setError('')
  }
  function handleQuestionChange(index, value) {
    if (index === 0) setQuestion1(value)
    else setQuestion2(value)
    setResult(null)
    setError('')
  }
  function handleSwap() {
    setQuestion1(question2)
    setQuestion2(question1)
    setResult(null)
    setError('')
  }
  function handleExample(kind) {
    if (loading) return
    setQuestion1(kind === 'similar' ? 'How can I learn Python?' : 'How do I install Python?')
    setQuestion2(kind === 'similar' ? 'What is the best way to learn Python?' : 'What is cloud computing?')
    setResult(null)
    setError('')
  }
  return (
      <section id="compare" aria-labelledby="compare-heading">
        <header className="page-header">
          <div><p className="eyebrow">Text Similarity Analysis</p><h1 id="compare-heading">Compare <span className="title-accent">Questions</span></h1>
            <p className="page-description">Compare two questions and analyse how closely their meaning and wording match.</p>
          </div>
          <aside className="mode-panel" aria-label="Implementation status">
            <p className="mode-label"><span className="status-dot" aria-hidden="true" />{isMockMode ? 'Demo Mode' : 'Backend Mode'}</p>
            <p>{isMockMode ? 'Using demonstration similarity logic until the NLP backend is connected.' : 'Questions are analysed by the configured NLP backend.'}</p>
          </aside>
        </header>
        <QuestionComparisonForm question1={question1} question2={question2} onQuestionChange={handleQuestionChange} onCompare={handleCompare} onSwap={handleSwap} onClear={handleClear} onExample={handleExample} loading={loading} />
        <aside className="context-tip"><span className="eyebrow">Tip</span><p>Try questions with similar meaning but different wording to see how text similarity behaves.</p></aside>
        <ErrorMessage message={error} />
        <div aria-live="polite" aria-atomic="true">{result && <ResultCard result={result} />}</div>
      </section>
  )
}
