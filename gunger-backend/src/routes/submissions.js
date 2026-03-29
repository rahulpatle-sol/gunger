const router = require('express').Router()
const { submit, getMySubmissions, getSubmissionDetail } = require('../controllers/submission.controller')
const { authenticate } = require('../middleware/auth')
const { submitLimiter } = require('../middleware/security')

router.use(authenticate)

router.post('/', submitLimiter, submit)
router.get('/', getMySubmissions)
router.get('/:id', getSubmissionDetail)

module.exports = router
