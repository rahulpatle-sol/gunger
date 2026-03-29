const { query } = require('../config/db')
const { runAgainstTestCases } = require('../services/judge.service')
const { getAIFeedback } = require('../services/ai.service')

const submit = async (req, res) => {
  try {
    const { question_id, code, language, contest_id } = req.body

    if (!question_id || !code || !language) {
      return res.status(400).json({ error: 'question_id, code, language required' })
    }

    // Validate question exists
    const qResult = await query('SELECT * FROM questions WHERE id = $1', [question_id])
    if (qResult.rows.length === 0) return res.status(404).json({ error: 'Question not found' })
    const question = qResult.rows[0]

    // Validate language
    if (!question.allowed_languages.includes(language.toLowerCase())) {
      return res.status(400).json({ error: `Language ${language} not allowed for this question` })
    }

    // Fetch all test cases
    const tcResult = await query('SELECT * FROM test_cases WHERE question_id = $1', [question_id])
    const testCases = tcResult.rows

    if (testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases defined for this question' })
    }

    // Run code against test cases
    const { results, allPassed } = await runAgainstTestCases(code, language, testCases)

    const status = allPassed ? 'accepted' : (results[0]?.status || 'wrong_answer')
    let xp_earned = 0

    if (allPassed) {
      // Check if already solved (no XP for re-solves)
      const prevSolve = await query(
        `SELECT id FROM submissions
         WHERE user_id = $1 AND question_id = $2 AND status = 'accepted'`,
        [req.user.id, question_id]
      )
      if (prevSolve.rows.length === 0) {
        xp_earned = question.xp_reward
        await query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xp_earned, req.user.id])
      }

      // Update activity log
      await query(
        `INSERT INTO activity_log (user_id, activity_date, count)
         VALUES ($1, CURRENT_DATE, 1)
         ON CONFLICT (user_id, activity_date)
         DO UPDATE SET count = activity_log.count + 1`,
        [req.user.id]
      )
    }

    // Get AI feedback asynchronously (don't block response)
    let ai_feedback = null
    ai_feedback = await getAIFeedback({ question, code, language, testResults: results, allPassed })

    // Save submission
    const subResult = await query(
      `INSERT INTO submissions (user_id, question_id, contest_id, code, language, status, test_results, xp_earned, ai_feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, status, xp_earned, created_at`,
      [req.user.id, question_id, contest_id || null, code, language, status, JSON.stringify(results), xp_earned, ai_feedback]
    )

    res.json({
      submission: subResult.rows[0],
      test_results: results,
      all_passed: allPassed,
      xp_earned,
      ai_feedback
    })
  } catch (err) {
    console.error('Submission error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getMySubmissions = async (req, res) => {
  try {
    const { question_id } = req.query
    const params = [req.user.id]
    let where = 'WHERE s.user_id = $1'

    if (question_id) {
      where += ` AND s.question_id = $2`
      params.push(question_id)
    }

    const result = await query(
      `SELECT s.id, s.question_id, q.title as question_title, s.language, s.status,
              s.xp_earned, s.ai_feedback, s.created_at
       FROM submissions s
       JOIN questions q ON q.id = s.question_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT 50`,
      params
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getSubmissionDetail = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM submissions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { submit, getMySubmissions, getSubmissionDetail }
