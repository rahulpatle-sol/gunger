const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('../config/db')

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password are required' })
    }

    // Only allow student/teacher via register. Admin must be set manually in DB.
    const allowedRoles = ['student', 'teacher']
    const userRole = allowedRoles.includes(role) ? role : 'student'

    // Check uniqueness
    const existing = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const result = await query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, xp, created_at`,
      [username, email, password_hash, userRole]
    )

    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' })
    }

    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    const { password_hash, ...safeUser } = user
    res.json({ user: safeUser, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const me = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, role, xp, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { register, login, me }
