import { analysePair, DEMO_DUPLICATE_THRESHOLD } from '../utils/textAnalysis.js'
// This is mock/demo logic only. It is NOT the actual NLP/ML model.
export async function getMockPrediction(question1, question2) {
  await new Promise(resolve => setTimeout(resolve, 800))
  const analysis = analysePair(question1, question2)
  const duplicate = analysis.score >= DEMO_DUPLICATE_THRESHOLD
  return { is_duplicate: duplicate, similarity_score: analysis.score, label: duplicate ? 'Duplicate' : 'Non-Duplicate', method: 'Demo Similarity', analysis }
}
