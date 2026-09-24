import { useRef, useState } from 'react'
import { analyzeDataset, isMockMode } from '../services/api.js'
import { validateCsvFile, parseQuestionCsv, createSampleCsv, downloadCsv } from '../utils/csv.js'
import { MAX_DEMO_QUESTIONS } from '../utils/textAnalysis.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import DatasetResults from '../components/DatasetResults.jsx'

export default function DatasetAnalyzer() {
  const [dataset, setDataset] = useState(null)
  const [filename, setFilename] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reading, setReading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef(null)
  const busy = loading || reading
  const selection = useRef(0)
  async function loadFile(file) {
    if (busy || !file) return
    const request = ++selection.current
    setResult(null); setDataset(null); setError(''); setFilename(''); setReading(true)
    try {
      validateCsvFile(file)
      const parsed = parseQuestionCsv(await file.text())
      if (request !== selection.current) return
      setDataset(parsed); setFilename(file.name)
    } catch (failure) { setError(failure.message || 'Unable to read this CSV file.') }
    finally { setReading(false); if (fileInput.current) fileInput.current.value = '' }
  }
  function clear() { selection.current++; setDataset(null); setFilename(''); setResult(null); setError(''); if (fileInput.current) fileInput.current.value = '' }
  async function analyse() {
    if (!dataset || busy) return
    setLoading(true); setError(''); setResult(null)
    try { setResult(await analyzeDataset(dataset.questions)) }
    catch { setError('Unable to analyse this dataset. Please try again.') }
    finally { setLoading(false) }
  }
  return <section className="tool-section" id="dataset" aria-labelledby="dataset-heading">
    <div className="section-heading compare-heading"><div><p className="eyebrow">Batch Analysis</p><h1 id="dataset-heading">Dataset Analyzer</h1></div><span className="mode-badge">{isMockMode ? 'Demo Analysis' : 'Backend Analysis'}</span></div>
    <p className="intro">Upload a question dataset to identify potential duplicate question pairs.</p>
    <div className="card dataset-upload" aria-busy={busy}>
      <div className={`upload-zone ${dragging ? 'dragging' : ''}`} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); if (!busy) { if (event.dataTransfer.files.length !== 1) setError('Drop one CSV file at a time.'); else loadFile(event.dataTransfer.files[0]) } }}>
        <h3>Upload Question Dataset</h3><p>Drag &amp; drop CSV here or choose a file.</p>
        <input className="sr-only" ref={fileInput} type="file" id="dataset-file" aria-label="Upload question CSV" accept=".csv,text/csv" disabled={busy} onChange={event => loadFile(event.target.files[0])} />
        <button type="button" className="button secondary" disabled={busy} onClick={() => fileInput.current?.click()}>Choose CSV</button>
        <p className="demo-note">CSV &middot; Maximum 2 MB &middot; 1–500 characters per question</p>
      </div>
      <div className="dataset-file-info"><p>Use a <code>question</code> column. First-column headers <code>text</code> and <code>questions</code> are also accepted.</p>
        {dataset && <p><strong>{filename}</strong> &middot; {dataset.questions.length} valid questions{dataset.ignored > 0 && ` · ${dataset.ignored} blank or overlong rows ignored`}</p>}
        {dataset && isMockMode && dataset.questions.length > MAX_DEMO_QUESTIONS && <p className="limit-note">Demo mode analyses the first 100 valid questions. The future backend will support larger datasets.</p>}
      </div>
      <div className="workspace-actions"><div className="form-actions"><button className="button primary" disabled={!dataset || busy} onClick={analyse}>{loading ? 'Analysing Dataset...' : 'Analyse Dataset'}</button><button className="button quiet" disabled={busy} onClick={clear}>Clear Dataset</button></div><button className="button secondary" onClick={() => downloadCsv(createSampleCsv(), 'querysense-sample.csv')}>Download Sample CSV</button></div>
    </div>
    <p className="demo-note">{isMockMode ? 'Demo Analysis uses word overlap locally. Your CSV is not uploaded to a server. At most 100 valid questions are compared.' : 'Questions are sent to the configured backend for analysis.'}</p>
    <ErrorMessage message={error} />
    <div role="status">{reading ? <p className="empty-state">Preparing questions...</p> : loading ? <p className="empty-state">Analysing Dataset... Comparing question pairs.</p> : result ? <p className="sr-only">Dataset analysis complete: {result.pairs.length} potential duplicate pairs.</p> : null}</div>
    {result && <DatasetResults result={result} />}
  </section>
}
