import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function loadService(mock) {
  let source = await readFile(new URL('../src/services/api.js', import.meta.url), 'utf8')
  source = source.replace(/from '([^']+)'/g, (_, relative) => `from '${new URL(relative, new URL('../src/services/api.js', import.meta.url)).href}'`)
  source = source.replaceAll('import.meta.env.VITE_API_BASE_URL', JSON.stringify('http://localhost:8000/'))
    .replaceAll('import.meta.env.VITE_USE_MOCK_API', JSON.stringify(String(mock)))
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
}

test('all mock tools work without a network request', async () => {
  const original = globalThis.fetch
  globalThis.fetch = () => { throw new Error('Mock mode must not fetch') }
  try {
    const api = await loadService(true)
    assert.equal((await api.compareQuestions('python', 'python')).is_duplicate, true)
    assert.equal((await api.findSimilarQuestions('python')).matches.length, 5)
    assert.equal((await api.analyzeDataset(['python', 'python'])).pairs.length, 1)
  } finally { globalThis.fetch = original }
})

test('future endpoints preserve contracts and reject malformed or failed responses', async () => {
  const original = globalThis.fetch
  const api = await loadService(false)
  let calls = []
  let response = {}
  globalThis.fetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) })
    assert.equal(options.method, 'POST')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.ok(options.signal instanceof AbortSignal)
    return { ok: true, json: async () => response }
  }
  try {
    response = { is_duplicate: true, similarity_score: 1, label: 'Duplicate', method: 'Backend method', analysis: { invalid: true } }
    assert.equal((await api.compareQuestions(' one ', ' two ')).analysis, undefined)
    assert.deepEqual(calls.pop(), { url: 'http://localhost:8000/api/v1/predict', body: { question1: 'one', question2: 'two' } })
    response = { method: 'Backend method', matches: [{ question: 'python', similarity_score: 0.9 }] }
    assert.equal((await api.findSimilarQuestions(' python ')).matches.length, 1)
    assert.deepEqual(calls.pop(), { url: 'http://localhost:8000/api/v1/find-similar', body: { question: 'python', limit: 5 } })
    response = { total_questions: 2, analysed_questions: 2, highest_similarity: 1, threshold: 0.5, method: 'Backend method', pairs: [{ row1: 1, row2: 2, question1: 'python', question2: 'python', similarity_score: 1 }] }
    assert.equal((await api.analyzeDataset(['python', 'python'])).pairs.length, 1)
    assert.deepEqual(calls.pop(), { url: 'http://localhost:8000/api/v1/analyze-dataset', body: { questions: ['python', 'python'], threshold: 0.5 } })
    for (const invalid of [null, {}, { matches: [{ question: 'python', similarity_score: 8 }], method: 'invalid' }]) {
      response = invalid
      await assert.rejects(api.findSimilarQuestions('python'), /Unable to search/)
      await assert.rejects(api.analyzeDataset(['a', 'b']), /Unable to analyse/)
    }
    globalThis.fetch = async () => ({ ok: false })
    await assert.rejects(api.findSimilarQuestions('python'), /Unable to search/)
    globalThis.fetch = async () => { throw new TypeError('Network unavailable') }
    await assert.rejects(api.analyzeDataset(['python', 'python']), /Unable to analyse/)
    globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError('Bad JSON') } })
    await assert.rejects(api.compareQuestions('one', 'two'), /Unable to analyse/)
  } finally { globalThis.fetch = original }
})
