const rateLimit = require('express-rate-limit')
const xss = require('xss')

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
})

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
})

// Submission rate limiter
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions, slow down' }
})

// Sanitize string inputs to prevent XSS
const sanitize = (value) => {
  if (typeof value === 'string') return xss(value.trim())
  // ✅ Array pehle check karo, warna object ban jaata hai
  if (Array.isArray(value)) return value.map(item => sanitize(item))
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitize(v)])
    )
  }
  return value
}

const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body)
  }
  next()
}

module.exports = { authLimiter, apiLimiter, submitLimiter, sanitizeBody }
