const router = require('express').Router()
const { getGlobalLeaderboard, getBatchLeaderboard } = require('../controllers/leaderboard.controller')
const { getActivityGrid } = require('../controllers/activity.controller')
const { exportBatchReport } = require('../controllers/export.controller')
const { authenticate } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

router.use(authenticate)

// Leaderboard
router.get('/leaderboard', getGlobalLeaderboard)
router.get('/leaderboard/batch/:id', getBatchLeaderboard)

// Activity (GitHub green dots)
router.get('/activity', getActivityGrid)
router.get('/activity/:user_id', getActivityGrid)

// Export (teacher only)
router.get('/export/batch/:batch_id', requireRole('teacher', 'admin'), exportBatchReport)

module.exports = router
