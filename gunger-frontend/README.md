# 🔫 GUNGER Frontend

> Next.js 15 · TypeScript · Tailwind · Zustand · Monaco Editor

## Stack
- **Next.js 15** (App Router + Turbopack)
- **TypeScript**
- **Tailwind CSS** — Old newspaper dark aesthetic
- **Zustand** — Auth state management
- **Monaco Editor** — VS Code-grade code editor
- **Framer Motion** — Animations
- **react-hot-toast** — Notifications
- **Axios** — API calls with rate limiter

## Quick Start

```bash
npm install

cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

npm run dev
# → http://localhost:3000
```

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page (newspaper front page) | Public |
| `/login` | Login | Public |
| `/register` | Register as student or teacher | Public |
| `/dashboard` | Student dashboard (XP, activity, problems) | Student |
| `/teacher` | Teacher command centre | Teacher/Admin |
| `/teacher/questions/new` | Create question with test cases | Teacher |
| `/teacher/contests/new` | Deploy a contest | Teacher |
| `/problems` | Browse all problems | Auth |
| `/problems/[id]` | Monaco editor + submit + AI hint | Auth |
| `/contests` | All contests | Auth |
| `/contests/[id]` | Contest detail + live leaderboard | Auth |
| `/leaderboard` | Global XP leaderboard | Auth |

## Design

- **Aesthetic**: Dark underground newspaper / classified ads
- **Fonts**: Playfair Display (headlines) + Special Elite (body) + JetBrains Mono (code)
- **Colors**: Ink black `#0D0B08`, aged paper `#F4ECD8`, gun red `#C41E3A`
- **OG Image**: Auto-generated at `/api/og`
- **Favicon**: Gun SVG at `/favicon.svg`

## Deploy on Vercel

1. Push to GitHub
2. Import repo on Vercel
3. Set env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
4. Deploy!

## Features

- 🔫 Gun favicon + OG image
- 📰 Old newspaper UI with Playfair Display
- ⚡ Auto-wake backend on page load (pings `/ping`)
- 🟢 Live server status banner (Discord-style)
- 🤖 AI hints + code feedback (Groq)
- 📊 GitHub-style activity grid
- 🏆 Real-time leaderboard
- 📥 Excel/PDF export for teachers
- 🔒 Rate-limited API client (8 req/sec)
- 📱 Mobile responsive
