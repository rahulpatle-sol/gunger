import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ── Rate limiter ─────────────────────────────────────────────
class RateLimiter {
  private queue: Array<() => void> = []
  private running = 0
  private readonly maxPerSecond: number

  constructor(maxPerSecond = 10) {
    this.maxPerSecond = maxPerSecond
  }

  async throttle(): Promise<void> {
    if (this.running < this.maxPerSecond) {
      this.running++
      setTimeout(() => {
        this.running--
        const next = this.queue.shift()
        if (next) next()
      }, 1000)
      return
    }
    return new Promise((resolve) => {
      this.queue.push(resolve)
    })
  }
}

const limiter = new RateLimiter(8)

// ── Axios instance ───────────────────────────────────────────
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token + rate limit on every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  await limiter.throttle()

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gunger_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gunger_token')
      localStorage.removeItem('gunger_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Wake server (ping before load) ───────────────────────────
export const wakeServer = async () => {
  try {
    await axios.get(`${BASE_URL}/ping`, { timeout: 10000 })
  } catch { /* silent — server sleeping */ }
}

// ── Health check ─────────────────────────────────────────────
export const healthCheck = async () => {
  const res = await axios.get(`${BASE_URL}/health`)
  return res.data
}

export const statusCheck = async () => {
  const res = await axios.get(`${BASE_URL}/status`)
  return res.data
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ── Batches ───────────────────────────────────────────────────
export const batchApi = {
  create: (data: { name: string; subject?: string }) => api.post('/batches', data),
  join: (join_code: string) => api.post('/batches/join', { join_code }),
  list: () => api.get('/batches'),
  members: (id: string) => api.get(`/batches/${id}/members`),
  delete: (id: string) => api.delete(`/batches/${id}`),
}

// ── Questions ─────────────────────────────────────────────────
export const questionApi = {
  create: (data: object) => api.post('/questions', data),
  list: (params?: object) => api.get('/questions', { params }),
  get: (id: string) => api.get(`/questions/${id}`),
  hint: (id: string, data: { code: string; language: string }) =>
    api.post(`/questions/${id}/hint`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
}

// ── Submissions ───────────────────────────────────────────────
export const submissionApi = {
  submit: (data: { question_id: string; code: string; language: string; contest_id?: string }) =>
    api.post('/submissions', data),
  list: (params?: object) => api.get('/submissions', { params }),
  get: (id: string) => api.get(`/submissions/${id}`),
}

// ── Contests ──────────────────────────────────────────────────
export const contestApi = {
  create: (data: object) => api.post('/contests', data),
  list: () => api.get('/contests'),
  get: (id: string) => api.get(`/contests/${id}`),
  leaderboard: (id: string) => api.get(`/contests/${id}/leaderboard`),
}

// ── Leaderboard & Activity ────────────────────────────────────
export const statsApi = {
  globalLeaderboard: (params?: object) => api.get('/leaderboard', { params }),
  batchLeaderboard: (id: string) => api.get(`/leaderboard/batch/${id}`),
  activity: (userId?: string) => userId ? api.get(`/activity/${userId}`) : api.get('/activity'),
}

// ── Export ────────────────────────────────────────────────────
export const exportApi = {
  batch: (batchId: string, format: 'excel' | 'pdf') =>
    api.get(`/export/batch/${batchId}`, {
      params: { format },
      responseType: 'blob',
    }),
}
