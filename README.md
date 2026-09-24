# QuerySense Frontend

**Intelligent Duplicate Question Detection Using Text Similarity Techniques**

A fifth-semester CSE mini-project that compares two questions and displays a duplicate classification and similarity score. The React frontend is implemented; the Python NLP/ML backend is planned.

## Running locally

Dependencies are already installed in this workspace. For a fresh checkout, run `npm install`.

- Development: `npm run dev`
- Production build: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`
- Automated checks: `npm test` (Node's built-in test runner)

## Environment and demo mode

Both `.env` and `.env.example` contain:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=true
```

`VITE_USE_MOCK_API=true` uses mock/demo logic without a backend. It simulates 800 ms latency, lowercases text, removes punctuation and common question words, and calculates Dice overlap of unique words. Scores range from 0 to 1; scores of at least 0.6 are Duplicate. Inputs without remaining words score 0. This is not real TF-IDF inference or an NLP/ML model and does not establish semantic equivalence. Results use the method **Demo Similarity**.

Duplicate example: `How can I learn Python?` and `What is the best way to learn Python?`.

Non-duplicate example: `How do I install Python?` and `What is cloud computing?`.

## Future FastAPI integration

React Router separates all major features into individual pages, sharing AppLayout, Header, and Footer. Each tool keeps its own input/loading/result state while mounted. Changing pages starts at the top; returning to a tool starts a fresh session. Themes persist through navigation and reloads.

Set `VITE_USE_MOCK_API=false` to send requests to the future FastAPI backend. Set `VITE_API_BASE_URL` to its address. Restart Vite after changing environment variables; rebuild for production. Vite environment values are public, so do not store secrets in them.

All communication goes through `src/services/api.js` using `compareQuestions(question1, question2)`. Components do not call fetch. The service trims and validates input, applies a 10-second timeout, checks HTTP status and response structure, and returns a safe user-facing error on failures. Configure backend CORS for the frontend origin (normally `http://localhost:5173`).

Endpoint: **POST /api/v1/predict** with `Content-Type: application/json`.

Request:

```json
{
  "question1": "...",
  "question2": "..."
}
```

Response:

```json
{
  "is_duplicate": true,
  "similarity_score": 0.874,
  "label": "Duplicate",
  "method": "TF-IDF + Cosine Similarity"
}
```

The service requires a boolean `is_duplicate`, a finite numeric `similarity_score` between 0 and 1, a matching `Duplicate` or `Non-Duplicate` label, and a nonempty method string. The UI displays percentages to one decimal place.

### Duplicate Finder

`findSimilarQuestions(question)` ranks all 90 demonstration questions across 15 categories using Enhanced Demo Similarity and returns the top five candidates. Under `VITE_USE_MOCK_API=false`, it calls **POST /api/v1/find-similar**:

```json
{ "question": "How can I learn Python?", "limit": 5 }
```

Expected response:

```json
{
  "method": "TF-IDF + Cosine Similarity",
  "matches": [
    { "question": "What is the best way to learn Python?", "similarity_score": 0.85 }
  ]
}
```

The service validates and normalizes results. Finder display bands are centralized: Highly Similar >=70%, Similar >=50%, Possible Match >=30%, Low Similarity <30%. A top score >=50% shows five candidates under Potential Duplicates; otherwise the UI shows No strong duplicates found and only three Closest Matches. Category and normalized matched terms are optional response metadata (`category` and `matched_terms`). If the real backend omits them, no local explanation is invented. Compare retains its 60% duplicate threshold; Dataset retains its previous calculation and display bands.

### Explainable pair results

The mock result includes an `analysis` object from the same `analysePair()` helper used to calculate its score. It contains original/normalized text, unique meaningful tokens, matched terms, terms unique to each input, score, and threshold. This drives highlighted text, factual explanations, and the expandable Text Analysis panel. Highlighting preserves original punctuation and uses escaped React text, not HTML injection.

The original FastAPI pair request/response contract remains unchanged. Mock explanations are not attached to real backend responses. Backend explanations can be added later through the service when a real explanation contract exists.

### Dataset Analyzer

Papa Parse handles comma-delimited CSV, quoted commas, escaped quotes, multiline fields, and UTF-8 BOMs. Use a `question` column anywhere, or `text`/`questions` as the first header. Select or drop one `.csv` file up to 2 MB. Malformed rows are rejected. Blank and over-500-character question values are ignored, and at least two valid questions are required. Entirely empty rows are skipped. The UI reports ignored nonempty records.

In demo mode, the first 100 valid questions are analysed. Every unordered pair is compared exactly once (at most 4,950 pairs), with brief yields to keep the page responsive. Pairs scoring >=50% are returned as candidates, sorted by similarity. This candidate threshold is centralized as `DATASET_THRESHOLD`; it does not claim every candidate is a confirmed duplicate.

Total Questions means valid uploaded questions; Analysed Questions shows the count after the cap. Highest Similarity is the highest score among all evaluated pairs, even when no pair meets the candidate threshold. The three summary values are calculated from the uploaded data.

Filters select All Matches, Highly Similar, or Similar; sorting supports both directions. Twenty pairs appear per page. Export Results downloads **all currently filtered pairs** in the selected order, including other pages. CSV fields are `question_1`, `question_2`, `similarity_score` (0–1), and `status`. Spreadsheet formula-like cells are escaped. Export is disabled when the current filter has no pairs. Download Sample CSV provides eight questions.

`analyzeDataset(questions)` sends **POST /api/v1/analyze-dataset** only when mock mode is disabled. CSV is parsed locally and valid question strings are sent as JSON, rather than multipart file upload:

```json
{
  "questions": ["How can I learn Python?", "What is the best way to learn Python?"],
  "threshold": 0.5
}
```

Expected response:

```json
{
  "total_questions": 2,
  "analysed_questions": 2,
  "highest_similarity": 0.85,
  "threshold": 0.5,
  "method": "TF-IDF + Cosine Similarity",
  "pairs": [
    {
      "row1": 1,
      "row2": 2,
      "question1": "How can I learn Python?",
      "question2": "What is the best way to learn Python?",
      "similarity_score": 0.85
    }
  ]
}
```

Row numbers are 1-based positions in the valid question list, not CSV line numbers. Require `row1 < row2`, with no repeated row pair. The service validates counts, score ranges, row bounds, thresholds, and method names. All three endpoints have 10-second timeouts and safe error messages. In mock mode no backend requests are made and CSV content stays in browser memory.

### Limits of the demonstration

All tools use deterministic Dice word overlap with common-word filtering. There is no stemming, synonym matching, learned model, semantic intent detection, or real TF-IDF inference. Stopword filtering deliberately keeps the previous comparison behavior, including removal of common question phrases such as “best way.” The new shared list also filters “on.” Actual NLP/ML inference belongs in the future Python backend.

## Technologies and structure

### Interface and themes

The sticky header offers Academic Blue (default), Engineering Teal, and Graphite light themes. CSS variables in `src/styles/global.css` define the palettes; the selection is saved under `querysense-theme` in localStorage. The existing `slate` storage value now selects Academic Blue, preserving earlier preferences. If storage is unavailable, theme changes still work for the current page. Green/red classification colors retain their meaning across themes.

The planned NLP workflow uses six connected stages, arranged in three columns on desktop, two on tablet, and a vertical timeline on mobile. Step numbers preserve reading order; examples, technical tags, and possible outputs explain the stages without presenting a live result. Similar pair and Different pair populate inputs without submitting them. The workspace action bar groups comparison controls separately from examples. Results include a full-width similarity bar, and About uses compact technical-stack rows. Reduced-motion preferences disable transitions and animations.

Current: React, Vite, JavaScript and plain CSS. Planned: Python, FastAPI, NLTK/spaCy, TF-IDF, cosine similarity and machine learning. Firebase is optional future storage; no database is connected.

```text
src/
  components/
    Header.jsx
    QuestionComparisonForm.jsx
    ResultCard.jsx
    SimilarityBar.jsx
    StatusBadge.jsx
    ProcessingPipeline.jsx
    ErrorMessage.jsx
    DuplicateMatchCard.jsx
    ExplainableResult.jsx
    DatasetResults.jsx
  components/AppLayout.jsx
  components/ScrollToTop.jsx
  pages/ComparePage.jsx
  pages/HowItWorksPage.jsx
  pages/AboutPage.jsx
  pages/DuplicateFinder.jsx
  pages/DatasetAnalyzer.jsx
  services/api.js
  mocks/prediction.js
  mocks/questions.js
  mocks/detection.js
  utils/textAnalysis.js
  utils/csv.js
  styles/global.css
  App.jsx
  main.jsx
.env
.env.example
tests/
  analysis.test.mjs
  api.test.mjs
```

ComparePage owns question, result, loading and error state. Each input is limited to 500 characters; blank questions cannot be submitted. Editing or swapping questions clears stale results. Clear resets inputs, results and errors. Controls are disabled during processing. Responsive layouts at 768px and 520px include semantic labels, visible focus, live result announcements and alert feedback. The processing pipeline section describes the planned backend only.

## Separate pages and deployment

- `/` redirects to `/compare`.
- `/compare`: pair comparison, results, and result-specific explanation only.
- `/finder`: Duplicate Finder only.
- `/dataset`: CSV analysis only.
- `/how-it-works`: planned processing pipeline only.
- `/about`: overview, objective, stack, status, and architecture only.
- Unknown URLs redirect to `/compare`.

No standalone `/analysis` route is needed: explanations belong to a comparison result. `Home.jsx` and the old stacked composition have been removed. Header uses NavLink, the mobile menu closes on selection, and ScrollToTop resets scroll on pathname changes. The only remaining hash link is the accessibility skip link.

Vite development and preview servers support these client routes. A production static host must rewrite non-asset URLs to `index.html` so direct links and refreshes work with BrowserRouter. No backend route changes are required.

## Finder repository and checked examples

90 questions, six each in Programming, Education, Career, Money & Finance, Technology, Health & Fitness, Travel, Food & Cooking, Productivity, General Knowledge, Communication & English, Science, College & Students, Jobs & Interviews, and Everyday Life. Repository counts are computed from the data. Categories never filter the search. No new similarity dependency was added; react-router-dom was added for page separation.

Top results for the requested checks (demo scores, not measured model accuracy):

| Input topic | Top candidate | Score |
| --- | --- | --- |
| Learn Python | What is the best way to learn Python? | 100.0% |
| Rich in the near future | How can I become wealthy? | 62.5% |
| Study better for exams | How can I improve my study routine for exams? | 73.8% |
| Become fit | How can I become more physically fit? | 62.5% |
| Travel without spending much money | How can I spend less money on travel? | 57.0% |
| Why is the sky blue? | No related question exists; three tied weak results | 0.0% |

`tests/finder.test.mjs` checks all six cases, categories, score bounds, normalization and deterministic ranking alongside the existing regression tests.
