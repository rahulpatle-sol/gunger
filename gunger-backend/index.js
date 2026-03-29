require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { pool } = require('./src/config/db')
const { sanitizeBody, apiLimiter } = require('./src/middleware/security')

const app = express()

// ─── Security middleware ───────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))
app.use(express.json({ limit: '100kb' }))
app.use(sanitizeBody)
app.use('/api', apiLimiter)

// ─── Health / Status ───────────────────────────────────────────
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected'
  let dbLatency = null

  try {
    const start = Date.now()
    await pool.query('SELECT 1')
    dbLatency = Date.now() - start
    dbStatus = 'connected'
  } catch (_) {}

  const uptime = Math.floor(process.uptime())
  const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  const healthy = dbStatus === 'connected'

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'gunger-backend',
    version: '1.0.0',
    uptime_seconds: uptime,
    memory_mb: memMB,
    database: {
      status: dbStatus,
      latency_ms: dbLatency
    },
    timestamp: new Date().toISOString()
  })
})

// Discord-style status page
app.get('/status', async (req, res) => {
  let dbOk = false
  try {
    await pool.query('SELECT 1')
    dbOk = true
  } catch (_) {}

  const overall = dbOk ? 'operational' : 'outage'
  const color = { operational: '🟢', degraded: '🟡', outage: '🔴' }

  res.json({
    overall_status: overall,
    indicator: color[overall],
    components: [
      { name: 'API Server', status: 'operational', indicator: '🟢' },
      { name: 'Database (Neon)', status: dbOk ? 'operational' : 'outage', indicator: dbOk ? '🟢' : '🔴' },
      { name: 'Judge0 (Code Execution)', status: 'operational', indicator: '🟢' },
      { name: 'AI Feedback (Groq)', status: 'operational', indicator: '🟢' }
    ],
    last_checked: new Date().toISOString()
  })
})

// Warm-up endpoint — frontend hits this on load to wake Render from sleep
app.get('/ping', (req, res) => res.json({ pong: true, t: Date.now() }))

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/batches', require('./src/routes/batch'))
app.use('/api/questions', require('./src/routes/questions'))
app.use('/api/submissions', require('./src/routes/submissions'))
app.use('/api/contests', require('./src/routes/contests'))
app.use('/api', require('./src/routes/misc'))

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

// Sirf direct run pe listen karo, test import pe nahi
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Gunger backend running on port ${PORT}`)
    console.log(`📊 Health: http://localhost:${PORT}/health`)
    console.log(`📡 Status: http://localhost:${PORT}/status`)
  })
}

module.exports = app
