const axios = require('axios')

// Judge0 CE - Free, no API key needed
// https://ce.judge0.com
const JUDGE0_URL = 'https://ce.judge0.com'

const LANG_IDS = {
  javascript: 63,
  python:     71,
  php:        68,
  rust:       73,
  java:       62,
  cpp:        54,
  c:          50,
  sql:        82,
}

const executeCode = async (sourceCode, language, stdin) => {
  const langId = LANG_IDS[language.toLowerCase()]
  if (!langId) return { stdout: '', stderr: `Unsupported: ${language}`, exitCode: 1 }

  try {
    const res = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: sourceCode,
        language_id: langId,
        stdin: (stdin || '').trim(),
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    )

    const data = res.data
    const statusId = data.status?.id

    // Status IDs: 3=Accepted, 4=WA, 5=TLE, 6=CE, 11/12/13=RE
    if (statusId === 6) {
      return { stdout: '', stderr: data.compile_output || 'Compile error', exitCode: 1 }
    }
    if (statusId >= 7 && statusId <= 12) {
      return { stdout: data.stdout || '', stderr: data.stderr || 'Runtime error', exitCode: 1 }
    }

    return {
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      exitCode: (statusId === 3 || statusId === 4) ? 0 : 1,
      statusId,
    }
  } catch (err) {
    console.error('Judge0 error:', err.message)
    return { stdout: '', stderr: 'Execution service unavailable', exitCode: 1 }
  }
}

const runAgainstTestCases = async (sourceCode, language, testCases) => {
  const langId = LANG_IDS[language.toLowerCase()]
  if (!langId) {
    return {
      results: testCases.map(tc => ({
        test_case_id: tc.id, is_hidden: tc.is_hidden,
        passed: false, status: 'compile_error',
        stderr: `Unsupported language: ${language}`,
      })),
      allPassed: false,
    }
  }

  const results = []
  let allPassed = true

  for (const tc of testCases) {
    const stdin = (tc.input || '').trim()
    const expected = (tc.expected_output || '').trim()
    const { stdout, stderr, exitCode, statusId } = await executeCode(sourceCode, language, stdin)
    const actual = (stdout || '').trim()
    const passed = exitCode === 0 && actual === expected && statusId === 3

    if (!passed) allPassed = false

    results.push({
      test_case_id: tc.id,
      is_hidden: tc.is_hidden,
      passed,
      status: passed
        ? 'accepted'
        : exitCode !== 0 ? 'runtime_error' : 'wrong_answer',
      ...(tc.is_hidden ? {} : {
        input: stdin,
        expected_output: expected,
        actual_output: actual,
      }),
      stderr: stderr || null,
    })
  }

  return { results, allPassed }
}

module.exports = { runAgainstTestCases }
