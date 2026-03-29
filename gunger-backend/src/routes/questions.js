const router = require('express').Router()
const { createQuestion, getQuestions, getQuestion, deleteQuestion } = require('../controllers/question.controller')
const { authenticate } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')
const { getAIHint } = require('../services/ai.service')
const { query } = require('../config/db')

router.use(authenticate)

router.post('/', requireRole('teacher', 'admin'), createQuestion)
router.get('/', getQuestions)
router.get('/:id', getQuestion)
router.delete('/:id', requireRole('teacher', 'admin'), deleteQuestion)

// AI Hint endpoint
router.post('/:id/hint', async (req, res) => {
  try {
    const qResult = await query('SELECT * FROM questions WHERE id = $1', [req.params.id])
    if (qResult.rows.length === 0) return res.status(404).json({ error: 'Question not found' })
    const hint = await getAIHint({
      question: qResult.rows[0],
      code: req.body.code || '',
      language: req.body.language || 'javascript'
    })
    res.json(hint)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
