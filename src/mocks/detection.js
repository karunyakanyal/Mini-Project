import { questions } from './questions.js'
import { analysePair, calculateTextSimilarity, DATASET_THRESHOLD, MAX_DEMO_QUESTIONS, FINDER_LIMITS } from '../utils/textAnalysis.js'

const delay = () => new Promise(resolve => setTimeout(resolve, 800))
export async function getMockMatches(question) {
  await delay()
  const matches = questions.map(item => {
    const analysis = calculateTextSimilarity(question, item.question)
    return { ...item, similarity_score: analysis.score, matched_terms: analysis.matchedTerms }
  }).sort((a, b) => b.similarity_score - a.similarity_score || a.id - b.id).slice(0, FINDER_LIMITS.strong)
  return { matches, method: 'Enhanced Demo Similarity' }
}
export async function getMockDataset(input, threshold = DATASET_THRESHOLD) {
  await delay()
  const selected = input.slice(0, MAX_DEMO_QUESTIONS)
  const pairs = []
  let highest = 0
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const score = analysePair(selected[i], selected[j]).score
      highest = Math.max(highest, score)
      if (score >= threshold) pairs.push({ row1: i + 1, row2: j + 1, question1: selected[i], question2: selected[j], similarity_score: score })
    }
    // Yield between small batches to keep the interface responsive.
    if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0))
  }
  pairs.sort((a, b) => b.similarity_score - a.similarity_score)
  return { total_questions: input.length, analysed_questions: selected.length, highest_similarity: highest, pairs, method: 'Demo Analysis', threshold }
}
