const { query } = require('../config/db')

const createContest = async (req, res) => {
  try {
    const { name, description, batch_id, start_time, end_time, is_public, questions } = req.body

    if (!name || !start_time || !end_time) {
      return res.status(400).json({ error: 'name, start_time, end_time required' })
    }
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({ error: 'end_time must be after start_time' })
    }

    const cResult = await query(
      `INSERT INTO contests (name, description, batch_id, teacher_id, start_time, end_time, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description || null, batch_id || null, req.user.id, start_time, end_time, is_public || false]
    )
    const contest = cResult.rows[0]

    // Add questions if provided
    if (questions && questions.length > 0) {
      for (const q of questions) {
        await query(
          'INSERT INTO contest_questions (contest_id, question_id, marks) VALUES ($1, $2, $3)',
          [contest.id, q.question_id, q.marks || 10]
        )
      }
    }

    const cqResult = await query(
      `SELECT cq.*, q.title FROM contest_questions cq
       JOIN questions q ON q.id = cq.question_id
       WHERE cq.contest_id = $1`,
      [contest.id]
    )
    res.status(201).json({ ...contest, questions: cqResult.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getContests = async (req, res) => {
  try {
    let result
    if (req.user.role === 'student') {
      result = await query(
        `SELECT c.*, u.username as teacher_name FROM contests c
         JOIN users u ON u.id = c.teacher_id
         WHERE c.is_public = true
            OR c.batch_id IN (
              SELECT batch_id FROM batch_members WHERE user_id = $1
            )
         ORDER BY c.start_time DESC`,
        [req.user.id]
      )
    } else {
      result = await query(
        `SELECT c.*, u.username as teacher_name FROM contests c
         JOIN users u ON u.id = c.teacher_id
         WHERE c.teacher_id = $1
         ORDER BY c.created_at DESC`,
        [req.user.id]
      )
    }
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getContest = async (req, res) => {
  try {
    const cResult = await query(
      `SELECT c.*, u.username as teacher_name FROM contests c
       JOIN users u ON u.id = c.teacher_id WHERE c.id = $1`,
      [req.params.id]
    )
    if (cResult.rows.length === 0) return res.status(404).json({ error: 'Contest not found' })

    const qResult = await query(
      `SELECT cq.marks, q.id, q.title, q.difficulty, q.allowed_languages, q.xp_reward
       FROM contest_questions cq
       JOIN questions q ON q.id = cq.question_id
       WHERE cq.contest_id = $1`,
      [req.params.id]
    )
    res.json({ ...cResult.rows[0], questions: qResult.rows })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getContestLeaderboard = async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      `SELECT u.id, u.username,
              COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as solved,
              COALESCE(SUM(CASE WHEN s.status = 'accepted' THEN cq.marks ELSE 0 END), 0) as total_marks,
              MIN(CASE WHEN s.status = 'accepted' THEN s.created_at END) as last_solve_time
       FROM users u
       LEFT JOIN submissions s ON s.user_id = u.id AND s.contest_id = $1
       LEFT JOIN contest_questions cq ON cq.question_id = s.question_id AND cq.contest_id = $1
       WHERE u.id IN (
         SELECT bm.user_id FROM contests c
         LEFT JOIN batch_members bm ON bm.batch_id = c.batch_id
         WHERE c.id = $1
       ) OR s.contest_id = $1
       GROUP BY u.id, u.username
       ORDER BY total_marks DESC, last_solve_time ASC
       LIMIT 100`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createContest, getContests, getContest, getContestLeaderboard }
