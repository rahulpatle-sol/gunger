const axios = require('axios')

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const getAIFeedback = async ({ question, code, language, testResults, allPassed }) => {
  if (!process.env.GROQ_API_KEY) return null

  try {
    const failedTests = testResults.filter(t => !t.passed)
    const prompt = allPassed
      ? `You are a coding mentor. Review this ${language} solution and give 2-3 lines of constructive feedback on code quality, efficiency, or improvements. Be encouraging but technical.

Question: ${question.title}
Code:
${code}

Keep response under 100 words.`
      : `You are a coding mentor helping a junior developer. Their code failed ${failedTests.length} test case(s).

Question: ${question.title}
Description: ${question.description}
Language: ${language}
Code:
${code}

${failedTests[0] && !failedTests[0].is_hidden ? `First failed test:
Input: ${failedTests[0].input}
Expected: ${failedTests[0].expected_output}
Got: ${failedTests[0].actual_output || 'No output'}` : ''}

Give a helpful hint (not the solution) explaining what might be wrong. Be specific. Under 80 words.`

    const response = await axios.post(
      GROQ_URL,
      {
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    return response.data.choices[0]?.message?.content || null
  } catch (err) {
    console.error('Groq AI error:', err.message)
    return null
  }
}

const getAIHint = async ({ question, code, language }) => {
  if (!process.env.GROQ_API_KEY) {
    return { hint: 'AI hints not configured.' }
  }

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: `Give a subtle hint for this coding problem. Do NOT give the solution. Max 60 words.

Problem: ${question.title}
${question.description}

Student's current code (${language}):
${code || '(no code yet)'}`
        }],
        max_tokens: 150,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    return { hint: response.data.choices[0]?.message?.content || 'Think about edge cases!' }
  } catch (err) {
    return { hint: 'Think about edge cases and boundary conditions.' }
  }
}

module.exports = { getAIFeedback, getAIHint }
