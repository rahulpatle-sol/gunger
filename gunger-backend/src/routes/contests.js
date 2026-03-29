const router = require('express').Router()
const { createContest, getContests, getContest, getContestLeaderboard } = require('../controllers/contest.controller')
const { authenticate } = require('../middleware/auth')
const { requireRole } = require('../middleware/role')

router.use(authenticate)

router.post('/', requireRole('teacher', 'admin'), createContest)
router.get('/', getContests)
router.get('/:id', getContest)
router.get('/:id/leaderboard', getContestLeaderboard)

module.exports = router
