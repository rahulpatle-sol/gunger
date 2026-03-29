const { query } = require('../config/db')
const crypto = require('crypto')

const generateJoinCode = () => crypto.randomBytes(4).toString('hex').toUpperCase()

const createBatch = async (req, res) => {
  try {
    const { name, subject } = req.body
    if (!name) return res.status(400).json({ error: 'Batch name required' })

    let join_code, tries = 0
    while (tries < 5) {
      join_code = generateJoinCode()
      const exists = await query('SELECT id FROM batches WHERE join_code = $1', [join_code])
      if (exists.rows.length === 0) break
      tries++
    }

    const result = await query(
      `INSERT INTO batches (name, subject, join_code, teacher_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, subject || null, join_code, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const joinBatch = async (req, res) => {
  try {
    const { join_code } = req.body
    if (!join_code) return res.status(400).json({ error: 'join_code required' })

    const batch = await query('SELECT * FROM batches WHERE join_code = $1', [join_code])
    if (batch.rows.length === 0) return res.status(404).json({ error: 'Invalid join code' })

    const b = batch.rows[0]

    // Check if already member
    const already = await query(
      'SELECT id FROM batch_members WHERE batch_id = $1 AND user_id = $2',
      [b.id, req.user.id]
    )
    if (already.rows.length > 0) return res.status(409).json({ error: 'Already a member' })

    await query(
      'INSERT INTO batch_members (batch_id, user_id) VALUES ($1, $2)',
      [b.id, req.user.id]
    )
    res.json({ message: 'Joined successfully', batch: b })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getMyBatches = async (req, res) => {
  try {
    let result
    if (req.user.role === 'student') {
      result = await query(
        `SELECT b.* FROM batches b
         JOIN batch_members bm ON b.id = bm.batch_id
         WHERE bm.user_id = $1
         ORDER BY b.created_at DESC`,
        [req.user.id]
      )
    } else {
      result = await query(
        'SELECT * FROM batches WHERE teacher_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      )
    }
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getBatchMembers = async (req, res) => {
  try {
    const { id } = req.params
    const result = await query(
      `SELECT u.id, u.username, u.email, u.xp, u.role, bm.joined_at
       FROM batch_members bm
       JOIN users u ON u.id = bm.user_id
       WHERE bm.batch_id = $1
       ORDER BY u.xp DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params
    const batch = await query('SELECT * FROM batches WHERE id = $1', [id])
    if (batch.rows.length === 0) return res.status(404).json({ error: 'Batch not found' })
    if (batch.rows[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' })
    }
    await query('DELETE FROM batches WHERE id = $1', [id])
    res.json({ message: 'Batch deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createBatch, joinBatch, getMyBatches, getBatchMembers, deleteBatch }
