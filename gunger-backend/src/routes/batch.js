const router = require('express').Router()
const { createBatch, joinBatch, getMyBatches, getBatchMembers, deleteBatch } = require('../controllers/batch.controller')
const { authenticate } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

router.use(authenticate)

router.post('/', requireRole('teacher', 'admin'), createBatch)
router.post('/join', requireRole('student'), joinBatch)
router.get('/', getMyBatches)
router.get('/:id/members', getBatchMembers)
router.delete('/:id', requireRole('teacher', 'admin'), deleteBatch)

module.exports = router
