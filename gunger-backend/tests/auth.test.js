const request = require('supertest')
const app = require('../index')
const { pool } = require('../src/config/db')

let testToken = ''
let teacherToken = ''

beforeAll(async () => {
  // Clean test users
  await pool.query("DELETE FROM users WHERE username LIKE 'testuser_%'")
})

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE username LIKE 'testuser_%'")
  await pool.end()
})

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a student successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser_s1', email: 'testuser_s1@test.com', password: 'Pass123!', role: 'student' })

      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.role).toBe('student')
      testToken = res.body.token
    })

    it('should register a teacher successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser_t1', email: 'testuser_t1@test.com', password: 'Pass123!', role: 'teacher' })

      expect(res.statusCode).toBe(201)
      expect(res.body.user.role).toBe('teacher')
      teacherToken = res.body.token
    })

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser_s1', email: 'new@test.com', password: 'Pass123!' })

      expect(res.statusCode).toBe(409)
    })

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser_x' })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser_s1', password: 'Pass123!' })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
    })

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser_s1', password: 'wrongpass' })

      expect(res.statusCode).toBe(401)
    })

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'ghost_user_xyz', password: 'Pass123!' })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.username).toBe('testuser_s1')
      expect(res.body).not.toHaveProperty('password_hash')
    })

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.statusCode).toBe(401)
    })

    it('should reject with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123')
      expect(res.statusCode).toBe(403)
    })
  })
})

module.exports = { testToken: () => testToken, teacherToken: () => teacherToken }
