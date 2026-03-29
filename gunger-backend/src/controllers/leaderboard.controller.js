const { query } = require('../config/db')

const getGlobalLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit

    const result = await query(
      `SELECT u.id, u.username, u.xp, u.role,
              COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.question_id END) as problems_solved,
              RANK() OVER (ORDER BY u.xp DESC) as rank
       FROM users u
       LEFT JOIN submissions s ON s.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id, u.username, u.xp, u.role
       ORDER BY u.xp DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getBatchLeaderboard = async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      `SELECT u.id, u.username, u.xp,
              COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.question_id END) as problems_solved,
              RANK() OVER (ORDER BY u.xp DESC) as rank
       FROM batch_members bm
       JOIN users u ON u.id = bm.user_id
       LEFT JOIN submissions s ON s.user_id = u.id
       WHERE bm.batch_id = $1
       GROUP BY u.id, u.username, u.xp
       ORDER BY u.xp DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { getGlobalLeaderboard, getBatchLeaderboard }
