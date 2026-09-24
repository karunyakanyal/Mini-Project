import test from 'node:test'
import assert from 'node:assert/strict'
import Papa from 'papaparse'
import { analysePair, getSimilarityLabel } from '../src/utils/textAnalysis.js'
import { parseQuestionCsv, validateCsvFile, createSampleCsv, createResultsCsv } from '../src/utils/csv.js'
import { getMockMatches, getMockDataset } from '../src/mocks/detection.js'
import { getMockPrediction } from '../src/mocks/prediction.js'

test('shared analysis explains the actual score, removes stopwords and preserves Unicode', async () => {
  const result = await getMockPrediction('How can I learn Python programming?', 'What is the best way to learn Python programming?')
  assert.equal(result.is_duplicate, true)
  assert.deepEqual(result.analysis.matched, ['learn', 'python', 'programming'])
  assert.equal(result.similarity_score, result.analysis.score)
  assert.equal(analysePair('!!!', '???').score, 0)
  assert.equal(analysePair('on the', 'the on').score, 0)
  assert.equal(analysePair('CAFÉ?', 'café').score, 1)
  assert.equal(analysePair('python python', 'python').score, 1)
  assert.equal(analysePair('install python', 'cloud computing').score, 0)
  assert.equal(getSimilarityLabel(0.75), 'Highly Similar')
  assert.equal(getSimilarityLabel(0.5), 'Similar')
  assert.equal(getSimilarityLabel(0.3), 'Possible Match')
  assert.equal(getSimilarityLabel(0.299), 'Low Similarity')
})

test('CSV accepts BOM, quoted commas, escaped quotes and multiline fields', () => {
  const parsed = parseQuestionCsv('\uFEFFquestion,category\r\n"How, exactly?",one\r\n"Explain ""cloud""\ncomputing",two')
  assert.deepEqual(parsed.questions, ['How, exactly?', 'Explain "cloud"\ncomputing'])
  for (const header of ['question', 'text', 'questions']) assert.equal(parseQuestionCsv(`${header}\nOne?\nTwo?`).questions.length, 2)
  assert.equal(parseQuestionCsv('id,question\n1,One\n2,Two').questions.length, 2)
  assert.equal(parseQuestionCsv(createSampleCsv()).questions.length, 8)
})

test('CSV rejects invalid files and malformed data, reports ignored rows', () => {
  assert.throws(() => validateCsvFile({ name: 'file.txt', type: 'text/plain', size: 1 }), /CSV/)
  assert.throws(() => validateCsvFile({ name: 'file.csv', type: 'image/png', size: 1 }), /supported/)
  assert.throws(() => validateCsvFile({ name: 'file.csv', type: 'text/csv', size: 2097153 }), /2 MB/)
  assert.doesNotThrow(() => validateCsvFile({ name: 'file.CSV', type: '', size: 2097152 }))
  for (const content of ['', 'title\nOne\nTwo', 'question\nOne', 'question\n"unclosed', 'question,other\nOne\nTwo,yes']) assert.throws(() => parseQuestionCsv(content))
  const parsed = parseQuestionCsv('question,id\n,1\nOne,2\nTwo,3\n' + 'a'.repeat(501) + ',4')
  assert.equal(parsed.ignored, 2)
  assert.equal(parsed.questions.length, 2)
})

test('finder ranks top five candidates and unrelated input scores zero', async () => {
  const result = await getMockMatches('How can I start learning Python?')
  assert.equal(result.matches.length, 5)
  assert.equal(result.matches[0].similarity_score, 1)
  assert.ok(result.matches.every((match, index) => !index || match.similarity_score <= result.matches[index - 1].similarity_score))
  assert.ok((await getMockMatches('volcanic geology')).matches.every(match => match.similarity_score === 0))
})

test('dataset compares each unordered pair once, caps rows and computes real summaries', async () => {
  const result = await getMockDataset(['learn python', 'learn python', 'cloud computing'])
  assert.equal(result.total_questions, 3)
  assert.equal(result.pairs.length, 1)
  assert.equal(result.highest_similarity, 1)
  assert.equal(result.pairs[0].row1, 1)
  assert.equal(result.pairs[0].row2, 2)
  const capped = await getMockDataset(Array(101).fill('python'))
  assert.equal(capped.total_questions, 101)
  assert.equal(capped.analysed_questions, 100)
  assert.equal(capped.pairs.length, 4950)
  assert.equal(new Set(capped.pairs.map(pair => `${pair.row1}-${pair.row2}`)).size, 4950)
  assert.equal((await getMockDataset(['python', 'geology'])).pairs.length, 0)
})

test('export round-trips punctuation and neutralizes spreadsheet formulas', () => {
  const csv = createResultsCsv([{ question1: '=SUM(1,2)', question2: 'A "quoted"\nquestion', similarity_score: 0.8 }])
  const result = Papa.parse(csv, { header: true, delimiter: ',' }).data[0]
  assert.equal(result.question_1, "'=SUM(1,2)")
  assert.equal(result.question_2, 'A "quoted"\nquestion')
  assert.equal(result.status, 'Highly Similar')
  assert.equal(result.similarity_score, '0.8')
})
