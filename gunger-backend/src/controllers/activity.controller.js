const { query } = require('../config/db')

const getActivityGrid = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user.id

    // Last 365 days
    const result = await query(
      `SELECT activity_date, count
       FROM activity_log
       WHERE user_id = $1
         AND activity_date >= CURRENT_DATE - INTERVAL '365 days'
       ORDER BY activity_date ASC`,
      [userId]
    )

    // Build full 365-day grid
    const map = {}
    for (const row of result.rows) {
      map[row.activity_date.toISOString().split('T')[0]] = row.count
    }

    const grid = []
    for (let i = 364; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      grid.push({ date: key, count: map[key] || 0 })
    }

    const total_contributions = result.rows.reduce((sum, r) => sum + r.count, 0)
    const current_streak = calculateStreak(grid)

    res.json({ grid, total_contributions, current_streak })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const calculateStreak = (grid) => {
  let streak = 0
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid[i].count > 0) streak++
    else break
  }
  return streak
}

module.exports = { getActivityGrid }
