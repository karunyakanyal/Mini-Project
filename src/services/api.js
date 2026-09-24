import { getMockPrediction } from '../mocks/prediction.js'
import { getMockMatches, getMockDataset } from '../mocks/detection.js'
import { DATASET_THRESHOLD } from '../utils/textAnalysis.js'
import { questions as demoQuestions } from '../mocks/questions.js'
export const demoQuestionCount = demoQuestions.length
const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
export const isMockMode = import.meta.env.VITE_USE_MOCK_API !== 'false'
function validatePrediction(data) {
  if (!data || typeof data.is_duplicate !== 'boolean' ||
    typeof data.similarity_score !== 'number' || !Number.isFinite(data.similarity_score) ||
    data.similarity_score < 0 || data.similarity_score > 1 ||
    typeof data.method !== 'string' || !data.method.trim() ||
    data.label !== (data.is_duplicate ? 'Duplicate' : 'Non-Duplicate')) {
    throw new Error('Invalid prediction response')
  }
  return data
}
export async function compareQuestions(question1, question2) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const first = question1.trim()
    const second = question2.trim()
    if (!first || !second || first.length > 500 || second.length > 500) throw new Error('Invalid input')
    if (isMockMode) return validatePrediction(await getMockPrediction(first, second))
    const response = await fetch(`${baseUrl}/api/v1/predict`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question1: first, question2: second }), signal: controller.signal,
    })
    if (!response.ok) throw new Error('Prediction request failed')
    const data = validatePrediction(await response.json())
    // Demo explanations are returned only by the mock, never attached to real inference.
    return { is_duplicate: data.is_duplicate, similarity_score: data.similarity_score, label: data.label, method: data.method }
  } catch {
    throw new Error('Unable to analyse the questions. Please try again.')
  } finally {
    clearTimeout(timeout)
  }
}

function validScore(score) { return typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1 }
function validText(text) { return typeof text === 'string' && text.trim().length > 0 && text.length <= 500 }
function validCount(count) { return Number.isInteger(count) && count >= 0 }

async function postJson(endpoint, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    })
    if (!response.ok) throw new Error('Request failed')
    return await response.json()
  } finally { clearTimeout(timeout) }
}

export async function findSimilarQuestions(question) {
  try {
    if (!validText(question)) throw new Error('Invalid question')
    const data = isMockMode ? await getMockMatches(question.trim()) : await postJson('/api/v1/find-similar', { question: question.trim(), limit: 5 })
    if (!data || typeof data.method !== 'string' || !data.method.trim() || !Array.isArray(data.matches) || data.matches.some(match => !match || !validText(match.question) || !validScore(match.similarity_score))) throw new Error('Invalid response')
    return { method: data.method, matches: data.matches.slice().sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 5).map((match, index) => ({
      id: index + 1, question: match.question, similarity_score: match.similarity_score,
      category: typeof match.category === 'string' ? match.category : null,
      matched_terms: Array.isArray(match.matched_terms) && match.matched_terms.every(term => typeof term === 'string') ? [...new Set(match.matched_terms)] : null,
    })) }
  } catch { throw new Error('Unable to search for similar questions. Please try again.') }
}

export async function analyzeDataset(questions) {
  try {
    if (!Array.isArray(questions) || questions.length < 2 || questions.some(question => !validText(question))) throw new Error('Invalid questions')
    const data = isMockMode ? await getMockDataset(questions) : await postJson('/api/v1/analyze-dataset', { questions, threshold: DATASET_THRESHOLD })
    if (!data || !validCount(data.total_questions) || data.total_questions !== questions.length || !validCount(data.analysed_questions) || data.analysed_questions < 2 || data.analysed_questions > data.total_questions || !validScore(data.highest_similarity) || !validScore(data.threshold) || typeof data.method !== 'string' || !data.method.trim() || !Array.isArray(data.pairs)) throw new Error('Invalid response')
    const seen = new Set()
    for (const pair of data.pairs) {
      if (!pair || !validCount(pair.row1) || !validCount(pair.row2) || pair.row1 < 1 || pair.row2 <= pair.row1 || pair.row2 > data.analysed_questions || !validText(pair.question1) || !validText(pair.question2) || !validScore(pair.similarity_score) || pair.similarity_score < data.threshold || pair.similarity_score > data.highest_similarity) throw new Error('Invalid pair')
      const key = `${pair.row1}-${pair.row2}`
      if (seen.has(key)) throw new Error('Repeated pair')
      seen.add(key)
    }
    return { ...data, pairs: data.pairs.slice().sort((a, b) => b.similarity_score - a.similarity_score) }
  } catch { throw new Error('Unable to analyse this dataset. Please try again.') }
}
