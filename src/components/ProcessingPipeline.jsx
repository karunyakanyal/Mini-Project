const steps = [
  ['Input Questions', 'Receive the two questions entered for comparison.', 'M4 4h16v12H9l-5 4V4 M8 8h8 M8 12h5'],
  ['Text Preprocessing', 'Clean and normalize text before feature extraction.', 'M4 6h16 M7 12h10 M10 18h4'],
  ['Feature Extraction', 'Prepare useful textual information for numerical representation.', 'M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M8 9h8 M8 13h8'],
  ['TF-IDF Representation', 'Convert processed text into numerical feature vectors.', 'M4 4v16h16 M8 16v-4 M13 16V8 M18 16V5'],
  ['Cosine Similarity', 'Measure how closely the two numerical question vectors align.', 'M4 20L20 4 M4 20l16-5 M10 14a9 9 0 0 1 2 4'],
  ['ML Classification', 'Use the similarity result to determine the final class.', 'M9 3h6l6 6v6l-6 6H9l-6-6V9l6-6 M8 12l3 3 5-6'],
]
function StepDetail({ index }) {
  if (index === 0) return <div className="question-example"><span><b>Q1</b> How can I learn Python?</span><span><b>Q2</b> What is the best way to learn Python?</span></div>
  if (index === 1) return <div className="technical-tags"><span>Lowercase</span><span>Remove punctuation</span><span>Clean text</span></div>
  if (index === 2) return <div className="technical-tags"><span>Text Features</span></div>
  if (index === 3) return <div className="technical-tags"><span>Text &rarr; Vector</span></div>
  if (index === 4) return <div className="similarity-scale" aria-label="Similarity scale: 0 means different, 1 means similar"><span>Similarity scale</span><div className="scale-axis"><span>0</span><i aria-hidden="true" /><span>1</span></div><div className="scale-labels"><span>Different</span><span>Similar</span></div></div>
  return <div className="possible-outputs"><span>Possible outputs</span><div><span className="status-badge duplicate">&#10003; Duplicate</span><span className="status-badge non-duplicate">&times; Non-Duplicate</span></div></div>
}
export default function ProcessingPipeline() {
  return <section className="pipeline-page" id="how-it-works" aria-labelledby="pipeline-heading">
    <div className="section-heading"><div><p className="eyebrow">How QuerySense Works</p><h1 id="pipeline-heading">How the Comparison Works</h1></div><span className="small-tag">Planned NLP Backend</span></div>
    <p className="section-description">Follow the planned NLP processing pipeline used to transform question text into a duplicate classification.</p>
    <aside className="info-banner"><p className="eyebrow">Current frontend demo</p><p>Compare and Dataset Analyzer use word overlap. Duplicate Finder uses local text similarity with a small concept map. The backend stages below are planned; TF-IDF and ML are not running in this demo.</p></aside>
    <ol className="pipeline-grid">{steps.map(([title, description, icon], index) => <li className="pipeline-step" key={title}>
      <article className="pipeline-card">
        <div className="step-top"><span className="step-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg></span><span className="step-number">STEP 0{index + 1}</span></div>
        <h3>{title}</h3><p>{description}</p><div className="step-detail"><StepDetail index={index} /></div>
      </article>
    </li>)}</ol>
    <p className="pipeline-note">Planned processing stages. The current demo uses word overlap; these stages do not represent live processing.</p>
  </section>
}
