const axios = require('axios')

// Judge0 language IDs
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  php: 68,
  rust: 73,
  sql: 82,        // SQLite
  java: 62,
  cpp: 54,
  c: 50
}

const submitToJudge0 = async (code, language, stdin, expectedOutput) => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()]
  if (!languageId) {
    return { status: 'compile_error', stderr: `Unsupported language: ${language}` }
  }

  try {
    // Create submission
const createRes = await axios.post(
  `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
  {
    source_code: code,
    language_id: languageId,
    stdin: stdin || '',
    expected_output: expectedOutput
  },
  {
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_API_KEY,   // ✅ lowercase
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',  // ✅ lowercase
      'Content-Type': 'application/json'
    },
    timeout: 15000
  }
)

    const result = createRes.data
    const statusId = result.status?.id

    // Judge0 status IDs: 3=Accepted, 4=Wrong Answer, 5=TLE, 6=CE, 11=RE
    const statusMap = {
      3: 'accepted',
      4: 'wrong_answer',
      5: 'time_limit_exceeded',
      6: 'compile_error',
      11: 'runtime_error',
      12: 'runtime_error',
      13: 'runtime_error'
    }

    return {
      status: statusMap[statusId] || 'runtime_error',
      stdout: result.stdout,
      stderr: result.stderr || result.compile_output,
      time: result.time,
      memory: result.memory
    }
  } catch (err) {
    console.error('Judge0 error:', err.message)
    // Fallback: mock execution for dev
    return { status: 'runtime_error', stderr: 'Judge0 unavailable' }
  }
}

const runAgainstTestCases = async (code, language, testCases) => {
  const results = []
  let allPassed = true

  for (const tc of testCases) {
    const result = await submitToJudge0(code, language, tc.input, tc.expected_output)
    const passed = result.status === 'accepted'
    if (!passed) allPassed = false

    results.push({
      test_case_id: tc.id,
      is_hidden: tc.is_hidden,
      passed,
      status: result.status,
      // Only show expected/actual for non-hidden test cases
      ...(tc.is_hidden ? {} : {
        input: tc.input,
        expected_output: tc.expected_output,
        actual_output: result.stdout
      }),
      stderr: result.stderr,
      time: result.time
    })
  }

  return { results, allPassed }
}

module.exports = { runAgainstTestCases, submitToJudge0 }
