// This is demonstration similarity logic only and is not the final NLP/ML implementation.
export const DEMO_DUPLICATE_THRESHOLD = 0.6
export const DATASET_THRESHOLD = 0.5
export const FINDER_USEFUL_THRESHOLD = 0.5
export const FINDER_BANDS = { high: 0.7, similar: 0.5, possible: 0.3 }
export const FINDER_WEIGHTS = { jaccard: 0.45, coverage: 0.4, phrase: 0.15 }
export const FINDER_LIMITS = { strong: 5, weak: 3 }
export const MAX_DEMO_QUESTIONS = 100
const stopwords = new Set('a an the is are was were how what why when where can do does i to of in on for and or best way effectively'.split(' '))

export function normalizeText(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim()
}
export function tokenizeText(text) {
  return normalizeText(text).split(' ').filter(Boolean)
}
export function removeStopwords(tokens) {
  return tokens.filter(token => !stopwords.has(token))
}
export function analyseQuestion(original) {
  return { original, normalized: normalizeText(original), tokens: [...new Set(removeStopwords(tokenizeText(original)))] }
}
export function analysePair(question1, question2) {
  const first = analyseQuestion(question1)
  const second = analyseQuestion(question2)
  const matched = first.tokens.filter(token => second.tokens.includes(token))
  const unique1 = first.tokens.filter(token => !second.tokens.includes(token))
  const unique2 = second.tokens.filter(token => !first.tokens.includes(token))
  const total = first.tokens.length + second.tokens.length
  const score = total ? 2 * matched.length / total : 0
  return { first, second, matched, unique1, unique2, score, threshold: DEMO_DUPLICATE_THRESHOLD }
}
export function getSimilarityLabel(score) {
  if (score >= 0.75) return 'Highly Similar'
  if (score >= 0.5) return 'Similar'
  if (score >= 0.3) return 'Possible Match'
  return 'Low Similarity'
}

// Finder-only normalization leaves the existing pair and dataset scores unchanged.
const finderStopwords = new Set(`a an the is are was were be been being i me my you your
he she it we they this that these those what which who how why when where can could would
should do does did to of in on at for from with and or but as by some any very more most
much too near while best good way ways become get`.split(/\s+/))

// Explicit inflections avoid damaging unrelated words with broad suffix stripping.
const wordForms = {
  learning: 'learn', learned: 'learn', studying: 'study', studies: 'study', studied: 'study',
  jobs: 'job', questions: 'question', programming: 'program', programmed: 'program',
  travelling: 'travel', traveling: 'travel', travelled: 'travel', traveled: 'travel',
  exams: 'exam', exercises: 'exercise', skills: 'skill', habits: 'habit',
  buying: 'buy', purchased: 'purchase', spending: 'spend', saving: 'save',
  investing: 'invest', investments: 'investment', flights: 'flight', beginners: 'beginner',
  cooking: 'cook', cooks: 'cook', baking: 'bake', working: 'work', students: 'student',
}

// This small concept map improves the frontend demonstration only.
// The production system should replace this with the real NLP/model backend.
// 25 deliberately limited groups; these are heuristics, not universal synonyms.
const conceptGroups = [
  ['wealth', 'rich', 'wealthy'], ['finance', 'money', 'financial', 'financially', 'finances'],
  ['career', 'job', 'employment'], ['learn', 'study'], ['purchase', 'buy'],
  ['quick', 'fast', 'quickly'], ['improve', 'better'], ['fit', 'fitness'],
  ['health', 'healthy'], ['travel', 'trip'], ['car', 'automobile', 'vehicle'],
  ['program', 'coding', 'code'], ['exam', 'examination', 'test'],
  ['budget', 'cheap', 'affordable', 'inexpensive'], ['beginner', 'novice'],
  ['exercise', 'workout'], ['focus', 'concentration', 'concentrate', 'focused'],
  ['remember', 'memorize', 'recall'], ['prepare', 'preparation'],
  ['confident', 'confidence', 'confidently'], ['speak', 'spoken', 'speaking'],
  ['resume', 'cv'], ['college', 'university'], ['sleep', 'sleeping'],
  ['cook', 'cooking'],
]
const conceptMap = Object.fromEntries(conceptGroups.flatMap(([canonical, ...terms]) =>
  [canonical, ...terms].map(term => [term, canonical])))

export function stemToken(token) { return wordForms[token] || token }
export function expandKnownTerms(tokens) { return tokens.map(token => conceptMap[token] || token) }
export function getFinderSimilarityLabel(score) {
  if (score >= FINDER_BANDS.high) return 'Highly Similar'
  if (score >= FINDER_BANDS.similar) return 'Similar'
  if (score >= FINDER_BANDS.possible) return 'Possible Match'
  return 'Low Similarity'
}
function finderTokens(text) {
  return expandKnownTerms(tokenizeText(text).filter(token => !finderStopwords.has(token)).map(stemToken))
}
function phrases(tokens) {
  return new Set(tokens.slice(1).map((token, index) => `${tokens[index]} ${token}`))
}
export function calculateTextSimilarity(text1, text2) {
  const sequence1 = finderTokens(text1)
  const sequence2 = finderTokens(text2)
  const first = new Set(sequence1)
  const second = new Set(sequence2)
  const matchedTerms = [...first].filter(token => second.has(token))
  if (!first.size || !second.size) return { score: 0, matchedTerms: [], signals: { jaccard: 0, coverage: 0, phrase: 0 } }
  const jaccard = matchedTerms.length / new Set([...first, ...second]).size
  const coverage = matchedTerms.length / Math.min(first.size, second.size)
  const firstPhrases = phrases(sequence1)
  const secondPhrases = phrases(sequence2)
  const sharedPhrases = [...firstPhrases].filter(phrase => secondPhrases.has(phrase)).length
  const phraseUnion = new Set([...firstPhrases, ...secondPhrases]).size
  // Single equal concepts have full agreement; no phrase bonus for partial single-word matches.
  const phrase = phraseUnion ? sharedPhrases / phraseUnion : Number(jaccard === 1)
  const score = Math.min(1, Math.max(0, FINDER_WEIGHTS.jaccard * jaccard + FINDER_WEIGHTS.coverage * coverage + FINDER_WEIGHTS.phrase * phrase))
  return { score, matchedTerms, signals: { jaccard, coverage, phrase } }
}
