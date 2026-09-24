import test from 'node:test'
import assert from 'node:assert/strict'
import { questions } from '../src/mocks/questions.js'
import { getMockMatches } from '../src/mocks/detection.js'
import { calculateTextSimilarity, stemToken, getFinderSimilarityLabel, FINDER_USEFUL_THRESHOLD } from '../src/utils/textAnalysis.js'

test('repository contains 90 unique questions across 15 categories', () => {
  assert.equal(questions.length, 90)
  assert.equal(new Set(questions.map(item => item.question)).size, 90)
  const categories = new Set(questions.map(item => item.category))
  assert.equal(categories.size, 15)
  for (const category of categories) assert.equal(questions.filter(item => item.category === category).length, 6)
})
test('finder normalization is conservative, bounded and deterministic', () => {
  for (const [word, expected] of [['learning', 'learn'], ['studies', 'study'], ['programming', 'program'], ['travelling', 'travel'], ['questions', 'question'], ['business', 'business'], ['king', 'king']]) assert.equal(stemToken(word), expected)
  assert.deepEqual(calculateTextSimilarity('rich', 'wealthy').matchedTerms, ['wealth'])
  assert.equal(calculateTextSimilarity('the be my', 'how can I').score, 0)
  assert.equal(calculateTextSimilarity('???', 'rich').score, 0)
  assert.equal(calculateTextSimilarity('astronomy', 'cooking').score, 0)
  for (const a of ['rich future', 'studying exams', 'learn python', '!!!']) {
    for (const b of ['wealth', 'prepare exams', 'python', '']) {
      const forward = calculateTextSimilarity(a, b)
      assert.ok(forward.score >= 0 && forward.score <= 1)
      assert.equal(forward.score, calculateTextSimilarity(b, a).score)
      assert.deepEqual(forward, calculateTextSimilarity(a, b))
    }
  }
  assert.equal(getFinderSimilarityLabel(0.7), 'Highly Similar')
  assert.equal(getFinderSimilarityLabel(0.5), 'Similar')
  assert.equal(getFinderSimilarityLabel(0.3), 'Possible Match')
  assert.equal(getFinderSimilarityLabel(0.29), 'Low Similarity')
})
test('six requested cases rank relevant categories without forcing an unrelated duplicate', async () => {
  const cases = [
    ['How can I learn Python?', 'Programming'],
    ['How can I be very rich in the near future?', 'Money & Finance'],
    ['How can I study better for my exams?', 'Education'],
    ['What can I do to become more fit?', 'Health & Fitness'],
    ['How can I travel without spending too much money?', 'Travel'],
    ['Why is the sky blue?', null],
  ]
  for (const [input, category] of cases) {
    const result = await getMockMatches(input)
    if (category) assert.equal(result.matches[0].category, category)
    else assert.ok(result.matches.every(match => match.similarity_score < FINDER_USEFUL_THRESHOLD))
    assert.ok(result.matches.every((match, index) => !index || match.similarity_score <= result.matches[index - 1].similarity_score))
    console.log(`${input} -> ${result.matches[0].question} (${(result.matches[0].similarity_score * 100).toFixed(1)}%)`)
  }
})
