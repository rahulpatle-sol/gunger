const request = require('supertest')
const app = require('../index')
const { pool } = require('../src/config/db')

let studentToken, teacherToken, batchId, questionId

const cleanupTestUsers = async () => {
  // Delete in correct FK order: children first, then parents
  await pool.query(`DELETE FROM activity_log WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'gtest_%')`)
  await pool.query(`DELETE FROM submissions WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'gtest_%')`)
  await pool.query(`DELETE FROM test_cases WHERE question_id IN (SELECT id FROM questions WHERE teacher_id IN (SELECT id FROM users WHERE username LIKE 'gtest_%'))`)
  await pool.query(`DELETE FROM questions WHERE teacher_id IN (SELECT id FROM users WHERE username LIKE 'gtest_%')`)
  await pool.query(`DELETE FROM batch_members WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'gtest_%')`)
  await pool.query(`DELETE FROM batches WHERE teacher_id IN (SELECT id FROM users WHERE username LIKE 'gtest_%')`)
  await pool.query(`DELETE FROM users WHERE username LIKE 'gtest_%'`)
}

beforeAll(async () => {
  await cleanupTestUsers()

  // Register student
  const s = await request(app).post('/api/auth/register').send({
    username: 'gtest_student', email: 'gtest_student@test.com', password: 'Pass123!', role: 'student'
  })
  studentToken = s.body.token

  // Register teacher
  const t = await request(app).post('/api/auth/register').send({
    username: 'gtest_teacher', email: 'gtest_teacher@test.com', password: 'Pass123!', role: 'teacher'
  })
  teacherToken = t.body.token
})

afterAll(async () => {
  await cleanupTestUsers()
  await pool.end()
})

// ─── HEALTH ───────────────────────────────────────────────────
describe('Health Endpoints', () => {
  it('GET /health should return ok or degraded', async () => {
    const res = await request(app).get('/health')
    expect([200, 503]).toContain(res.statusCode)
    expect(res.body).toHaveProperty('status')
    expect(res.body).toHaveProperty('database')
  })

  it('GET /status should return components', async () => {
    const res = await request(app).get('/status')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('components')
    expect(Array.isArray(res.body.components)).toBe(true)
  })

  it('GET /ping should return pong', async () => {
    const res = await request(app).get('/ping')
    expect(res.statusCode).toBe(200)
    expect(res.body.pong).toBe(true)
  })
})

// ─── BATCHES ──────────────────────────────────────────────────
describe('Batch Routes', () => {
  it('teacher should create a batch', async () => {
    const res = await request(app)
      .post('/api/batches')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Test Batch CS101', subject: 'JavaScript' })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('join_code')
    batchId = res.body.id
  })

  it('student should NOT create a batch', async () => {
    const res = await request(app)
      .post('/api/batches')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Unauthorized Batch' })

    expect(res.statusCode).toBe(403)
  })

  it('student should join batch with valid code', async () => {
    const batchRes = await request(app)
      .get('/api/batches')
      .set('Authorization', `Bearer ${teacherToken}`)

    const joinCode = batchRes.body.find(b => b.id === batchId)?.join_code

    const res = await request(app)
      .post('/api/batches/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: joinCode })

    expect(res.statusCode).toBe(200)
  })

  it('should reject invalid join code', async () => {
    const res = await request(app)
      .post('/api/batches/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: 'INVALID99' })

    expect(res.statusCode).toBe(404)
  })

  it('should get batch members', async () => {
    const res = await request(app)
      .get(`/api/batches/${batchId}/members`)
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

// ─── QUESTIONS ────────────────────────────────────────────────
describe('Question Routes', () => {
  it('teacher should create a question with test cases', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Sum Two Numbers',
        description: 'Given a and b, return a + b',
        difficulty: 'easy',
        allowed_languages: ['javascript', 'python'],
        xp_reward: 15,
        test_cases: [
          { input: '1 2', expected_output: '3', is_hidden: false },
          { input: '10 20', expected_output: '30', is_hidden: true }
        ]
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.test_cases.length).toBe(2)
    questionId = res.body.id
  })

  it('student should NOT create a question', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hack', description: 'x', test_cases: [] })

    expect(res.statusCode).toBe(403)
  })

  it('should list questions', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('student should only see non-hidden test cases', async () => {
    const res = await request(app)
      .get(`/api/questions/${questionId}`)
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.statusCode).toBe(200)
    const hasHidden = res.body.test_cases.some(tc => tc.is_hidden)
    expect(hasHidden).toBe(false)
  })

  it('teacher should see all test cases', async () => {
    const res = await request(app)
      .get(`/api/questions/${questionId}`)
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(res.statusCode).toBe(200)
    const hasHidden = res.body.test_cases.some(tc => tc.is_hidden)
    expect(hasHidden).toBe(true)
  })

  it('should return 404 for unknown question', async () => {
    const res = await request(app)
      .get('/api/questions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.statusCode).toBe(404)
  })
})

// ─── LEADERBOARD ──────────────────────────────────────────────
describe('Leaderboard', () => {
  it('should return global leaderboard', async () => {
    const res = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should return batch leaderboard', async () => {
    const res = await request(app)
      .get(`/api/leaderboard/batch/${batchId}`)
      .set('Authorization', `Bearer ${teacherToken}`)

    expect(res.statusCode).toBe(200)
  })
})

// ─── ACTIVITY ─────────────────────────────────────────────────
describe('Activity Grid', () => {
  it('should return 365-day grid', async () => {
    const res = await request(app)
      .get('/api/activity')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.grid.length).toBe(365)
    expect(res.body).toHaveProperty('current_streak')
    expect(res.body).toHaveProperty('total_contributions')
  })
})