# 🔥 GUNGER Backend

> Code. Test. Dominate. — The junior dev coding platform

## Stack
- **Node.js + Express** — API server
- **PostgreSQL (Neon)** — Database
- **Judge0** — Code execution
- **Groq (Llama3)** — AI feedback & hints
- **Render** — Deployment

---

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Setup env
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, JUDGE0_API_KEY, GROQ_API_KEY

# 3. Setup DB (run schema on your Neon console)
# Copy schema.sql contents → Neon SQL Editor → Run

# 4. Start dev server
npm run dev

# 5. Run tests
npm test
```

---

## API Endpoints

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |

### Batches (Classrooms)
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/batches` | Teacher |
| POST | `/api/batches/join` | Student |
| GET | `/api/batches` | Auth |
| GET | `/api/batches/:id/members` | Auth |
| DELETE | `/api/batches/:id` | Teacher |

### Questions
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/questions` | Teacher |
| GET | `/api/questions` | Auth |
| GET | `/api/questions/:id` | Auth |
| POST | `/api/questions/:id/hint` | Auth (AI hint) |
| DELETE | `/api/questions/:id` | Teacher |

### Submissions
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/submissions` | Auth |
| GET | `/api/submissions` | Auth |
| GET | `/api/submissions/:id` | Auth |

### Contests
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/contests` | Teacher |
| GET | `/api/contests` | Auth |
| GET | `/api/contests/:id` | Auth |
| GET | `/api/contests/:id/leaderboard` | Auth |

### Stats & Export
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/leaderboard` | Auth |
| GET | `/api/leaderboard/batch/:id` | Auth |
| GET | `/api/activity` | Auth |
| GET | `/api/export/batch/:id?format=excel\|pdf` | Teacher |

### Health
| Method | Route | Notes |
|--------|-------|-------|
| GET | `/health` | Full health check |
| GET | `/status` | Discord-style status |
| GET | `/ping` | Wake from Render sleep |

---

## Roles

| Role | Can Do |
|------|--------|
| `student` | Join batches, solve questions, submit code, view leaderboard |
| `teacher` | Create batches/questions/contests, view all submissions, export data |
| `admin` | Everything + delete users (set manually in DB) |

**Note:** To make a user admin, run in Neon SQL:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

---

## Security Features
- Helmet.js headers
- Rate limiting (auth: 20/15min, API: 100/min, submit: 10/min)
- XSS sanitization on all inputs
- bcrypt password hashing (12 rounds)
- JWT auth with expiry
- SQL injection prevention (parameterized queries only)
- Role-based access control

---

## Deployment (Render)

1. Push to GitHub
2. Create new **Web Service** on Render
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all env vars from `.env.example`
6. Set `NODE_ENV=production`

**UptimeRobot:** Add monitor for `https://your-app.onrender.com/ping` every 5 mins to prevent sleep.

---

## Postman Collection
Import `/postman/Gunger_API.postman_collection.json` into Postman.
Variables auto-set on register/create calls.
