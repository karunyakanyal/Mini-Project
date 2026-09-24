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
        <div className="section-heading compare-heading"><div><p className="eyebrow">Text Similarity Analysis</p><h1 id="compare-heading">Compare Questions</h1></div><span className="mode-badge"><span className="status-dot" aria-hidden="true" />{isMockMode ? 'Demo Mode' : 'Backend Mode'}</span></div>
        <p className="intro">Compare two questions and analyse how closely their meaning and wording match.</p>
        <QuestionComparisonForm question1={question1} question2={question2} onQuestionChange={handleQuestionChange} onCompare={handleCompare} onSwap={handleSwap} onClear={handleClear} onExample={handleExample} loading={loading} />
        {isMockMode && <p className="demo-note">Using demonstration logic until the NLP backend is connected.</p>}
        <ErrorMessage message={error} />
        <div aria-live="polite" aria-atomic="true">{result && <ResultCard result={result} />}</div>
      </section>
  )
}
