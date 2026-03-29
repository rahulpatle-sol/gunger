const { query } = require('../config/db')

const createQuestion = async (req, res) => {
  try {
    const { title, description, difficulty, allowed_languages, xp_reward, time_limit, test_cases, is_public } = req.body

    if (!title || !description || !test_cases || test_cases.length === 0) {
      return res.status(400).json({ error: 'title, description, and at least one test_case required' })
    }

    // ✅ Fix: object/array dono handle karo
    const langs = Array.isArray(allowed_languages)
      ? allowed_languages
      : Object.values(allowed_languages || {})

    const finalLangs = langs.length > 0
      ? langs
      : ['javascript', 'python', 'php', 'rust', 'sql']

    const qResult = await query(
      `INSERT INTO questions (title, description, difficulty, allowed_languages, xp_reward, time_limit, teacher_id, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description,
        difficulty || 'medium',
        finalLangs,
        xp_reward || 10,
        time_limit || 5000,
        req.user.id,
        is_public || false
      ]
    )
    const question = qResult.rows[0]

    for (const tc of test_cases) {
      await query(
        'INSERT INTO test_cases (question_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)',
        [question.id, tc.input, tc.expected_output, tc.is_hidden !== false]
      )
    }

    const tcResult = await query('SELECT * FROM test_cases WHERE question_id = $1', [question.id])
    res.status(201).json({ ...question, test_cases: tcResult.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getQuestions = async (req, res) => {
  try {
    const { difficulty, language, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const params = []
    let where = []

    if (req.user.role === 'student') {
      where.push(`(q.is_public = true OR q.teacher_id IN (
        SELECT b.teacher_id FROM batches b
        JOIN batch_members bm ON b.id = bm.batch_id
        WHERE bm.user_id = $${params.length + 1}
      ))`)
      params.push(req.user.id)
    } else if (req.user.role === 'teacher') {
      where.push(`q.teacher_id = $${params.length + 1}`)
      params.push(req.user.id)
    }

    if (difficulty) {
      where.push(`q.difficulty = $${params.length + 1}`)
      params.push(difficulty)
    }
    if (language) {
      where.push(`$${params.length + 1} = ANY(q.allowed_languages)`)
      params.push(language)
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)

    const result = await query(
      `SELECT q.id, q.title, q.difficulty, q.allowed_languages, q.xp_reward, q.is_public, q.created_at,
              u.username as teacher_name
       FROM questions q
       JOIN users u ON u.id = q.teacher_id
       ${whereClause}
       ORDER BY q.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const qResult = await query(
      `SELECT q.*, u.username as teacher_name FROM questions q
       JOIN users u ON u.id = q.teacher_id
       WHERE q.id = $1`,
      [id]
    )
    if (qResult.rows.length === 0) return res.status(404).json({ error: 'Question not found' })

    const question = qResult.rows[0]

    const tcResult = await query(
      req.user.role === 'student'
        ? 'SELECT id, input, expected_output FROM test_cases WHERE question_id = $1 AND is_hidden = false'
        : 'SELECT * FROM test_cases WHERE question_id = $1',
      [id]
    )

    res.json({ ...question, test_cases: tcResult.rows })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params
    const q = await query('SELECT * FROM questions WHERE id = $1', [id])
    if (q.rows.length === 0) return res.status(404).json({ error: 'Question not found' })
    if (q.rows[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' })
    }
    await query('DELETE FROM questions WHERE id = $1', [id])
    res.json({ message: 'Question deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createQuestion, getQuestions, getQuestion, deleteQuestion }