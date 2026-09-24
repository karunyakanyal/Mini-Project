import Papa from 'papaparse'
import { sampleQuestions } from '../mocks/questions.js'
import { getSimilarityLabel } from './textAnalysis.js'

export const MAX_FILE_BYTES = 2 * 1024 * 1024
export function validateCsvFile(file) {
  if (!file || !/\.csv$/i.test(file.name)) throw new Error('Choose a CSV file with a .csv extension.')
  const allowedTypes = ['', 'text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain', 'application/octet-stream']
  if (!allowedTypes.includes(file.type)) throw new Error('The selected file is not a supported CSV file.')
  if (file.size > MAX_FILE_BYTES) throw new Error('CSV files must be 2 MB or smaller.')
}
export function parseQuestionCsv(text) {
  const parsed = Papa.parse(text.replace(/^\uFEFF/, ''), { delimiter: ',', skipEmptyLines: 'greedy' })
  if (parsed.errors.length) throw new Error('This CSV could not be read. Check quoted fields and row formatting.')
  const [header, ...rows] = parsed.data
  const names = header?.map(value => value.trim().toLowerCase()) || []
  let column = names.indexOf('question')
  if (column < 0 && ['text', 'questions'].includes(names[0])) column = 0
  if (column < 0) throw new Error('Add a question column, or use text or questions as the first column header.')
  if (names.filter(name => name === 'question').length > 1) throw new Error('Use only one question column.')
  if (rows.some(row => row.length !== header.length)) throw new Error('CSV rows must have the same number of columns as the header.')
  const valid = rows.map(row => row[column].trim()).filter(value => value && value.length <= 500)
  if (valid.length < 2) throw new Error('Include at least 2 valid questions, each containing 1 to 500 characters.')
  return { questions: valid, ignored: rows.length - valid.length, totalRows: rows.length }
}
export function createResultsCsv(pairs) {
  // Papa Parse escapes quotes/newlines and protects spreadsheet formula cells.
  return Papa.unparse({
    fields: ['question_1', 'question_2', 'similarity_score', 'status'],
    data: pairs.map(pair => [pair.question1, pair.question2, pair.similarity_score, getSimilarityLabel(pair.similarity_score)]),
  }, { escapeFormulae: true })
}
export function createSampleCsv() {
  return Papa.unparse({ fields: ['question'], data: sampleQuestions.map(question => [question]) }, { escapeFormulae: true })
}
export function downloadCsv(content, filename) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
