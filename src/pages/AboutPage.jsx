const technologies = [['Frontend', 'React + Vite'], ['Backend', 'FastAPI', 'Planned'], ['NLP', 'NLTK / spaCy', 'Planned'], ['Similarity', 'TF-IDF + trained model', 'Planned'], ['Database', 'Firebase', 'Optional']]
export default function AboutPage() {
  return <section id="about" aria-labelledby="about-heading">
    <p className="eyebrow">Project Information</p><h1 id="about-heading">About QuerySense</h1>
    <p className="intro">Intelligent Duplicate Question Detection Using Text Similarity Techniques</p>
    <div className="about-section about-page-grid">
      <div className="about-copy">
        <h2>Project Overview</h2><p>QuerySense is a CSE mini-project for comparing question pairs and finding potential duplicates in a collection of questions.</p>
        <h2>Problem Statement</h2><p>Different wording can hide repeated questions, making question repositories harder to search and datasets harder to maintain.</p>
        <h2>Project Objective</h2><p>Help users review similar questions before posting and identify repeated questions in datasets, with transparent results and explanations.</p>
        <h2>Current Implementation Status</h2><p>Compare and Dataset Analyzer use demo word overlap. Duplicate Finder uses an enhanced local scoring heuristic and a diverse demonstration repository. None of these are real ML inference; no external question database is connected.</p>
      </div>
      <div className="stack-panel"><h2>Technology Stack</h2><dl className="technology-grid">{technologies.map(([name, value, status]) => <div key={name}><dt>{name}</dt><dd>{value}{status && <span className="technology-status">{status}</span>}</dd></div>)}</dl>
        <h2>Planned NLP Architecture</h2><p className="muted">React pages call the API service, which selects local mocks or the future FastAPI endpoints. The planned backend will handle a larger dataset, NLP preprocessing, TF-IDF or a trained model, and ranked duplicate retrieval.</p>
      </div>
    </div>
  </section>
}
