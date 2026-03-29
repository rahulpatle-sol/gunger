const axios = require('axios')

const LANG_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python:     { language: 'python',     version: '3.10.0' },
  php:        { language: 'php',        version: '8.2.3' },
  rust:       { language: 'rust',       version: '1.68.2' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  sql:        { language: 'sqlite3',    version: '3.36.0' },
}

const runAgainstTestCases = async (code, language, testCases) => {
  const lang = LANG_MAP[language.toLowerCase()]
  if (!lang) {
    return {
      results: testCases.map(tc => ({
        test_case_id: tc.id,
        is_hidden: tc.is_hidden,
        passed: false,
        status: 'compile_error',
        stderr: `Unsupported language: ${language}`,
      })),
      allPassed: false,
    }
  }

  const results = []
  let allPassed = true

  for (const tc of testCases) {
    try {
      const res = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        {
          language: lang.language,
          version: lang.version,
          files: [{ content: code }],
          stdin: tc.input || '',
        },
        { timeout: 15000 }
      )

      const run = res.data.run
      const actual = (run.stdout || '').trim()
      const expected = (tc.expected_output || '').trim()
      const passed = actual === expected && !run.stderr

      if (!passed) allPassed = false

      results.push({
        test_case_id: tc.id,
        is_hidden: tc.is_hidden,
        passed,
        status: passed ? 'accepted' : run.stderr ? 'runtime_error' : 'wrong_answer',
        ...(tc.is_hidden ? {} : {
          input: tc.input,
          expected_output: expected,
          actual_output: actual,
        }),
        stderr: run.stderr || null,
        time: run.time,
      })
    } catch (err) {
      allPassed = false
      results.push({
        test_case_id: tc.id,
        is_hidden: tc.is_hidden,
        passed: false,
        status: 'runtime_error',
        stderr: 'Execution service unavailable',
      })
    }
  }

  return { results, allPassed }
}

module.exports = { runAgainstTestCases }