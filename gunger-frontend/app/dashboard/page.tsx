'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/shared/Navbar'
import ActivityGrid from '@/components/shared/ActivityGrid'
import { useAuthStore } from '@/lib/store'
import { questionApi, statsApi, submissionApi, batchApi } from '@/lib/api'
import { xpToLevel, xpForNextLevel, difficultyColor, statusColor, statusLabel, formatRelative } from '@/lib/utils'
import { Loader2, BookOpen, Trophy, Zap, Target } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<unknown[]>([])
  const [submissions, setSubmissions] = useState<unknown[]>([])
  const [batches, setBatches] = useState<unknown[]>([])
  const [activity, setActivity] = useState<{ grid: { date: string; count: number }[]; current_streak: number; total_contributions: number } | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'student') { router.push('/teacher'); return }
    load()
  }, [user])

  const load = async () => {
    try {
      const [q, s, b, a] = await Promise.all([
        questionApi.list({ limit: 6 }),
        submissionApi.list(),
        batchApi.list(),
        statsApi.activity(),
      ])
      setQuestions(q.data)
      setSubmissions(s.data.slice(0, 8))
      setBatches(b.data)
      setActivity(a.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const joinBatch = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    try {
      await batchApi.join(joinCode.trim().toUpperCase())
      toast.success('Joined batch!')
      setJoinCode('')
      const b = await batchApi.list()
      setBatches(b.data)
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Invalid code')
    } finally { setJoining(false) }
  }

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-paper/40" size={32} />
    </div>
  )

  const level = xpToLevel(user.xp)
  const nextXP = xpForNextLevel(user.xp)
  const progress = Math.min((user.xp / nextXP) * 100, 100)
  const solved = (submissions as { status: string }[]).filter((s) => s.status === 'accepted').length

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ─────────────────────────── */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-headline font-black text-4xl text-paper">{user.username}</h1>
              <span className="stamp text-xs">Lv.{level}</span>
            </div>
            <p className="text-sm text-paper/40 font-mono">Student Correspondent · Gunger Times</p>
          </div>
          <div className="text-right">
            <div className="font-headline font-black text-3xl text-gun-red">{user.xp}</div>
            <div className="text-xs text-paper/40 font-mono">XP EARNED</div>
          </div>
        </div>

        {/* ── XP Bar ─────────────────────────── */}
        <div className="mb-8 news-card p-4 animate-slide-up" data-delay="1">
          <div className="flex justify-between text-xs font-mono text-paper/40 mb-2">
            <span>Level {level} Progress</span>
            <span>{user.xp} / {nextXP} XP → Level {level + 1}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* ── Stats row ──────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Total XP', value: user.xp, color: 'text-gun-red' },
            { icon: Target, label: 'Problems Solved', value: solved, color: 'text-green-400' },
            { icon: BookOpen, label: 'Batches', value: (batches as unknown[]).length, color: 'text-yellow-400' },
            { icon: Trophy, label: 'Streak', value: `${activity?.current_streak || 0}d`, color: 'text-paper' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="news-card p-4 animate-slide-up" data-delay="2">
              <Icon size={16} className={`${color} mb-2`} />
              <div className={`font-headline font-black text-2xl ${color}`}>{value}</div>
              <div className="text-xs text-paper/40 font-mono">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left col ───────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Activity */}
            {activity && (
              <div className="news-card p-5 animate-slide-up" data-delay="3">
                <ActivityGrid
                  grid={activity.grid}
                  streak={activity.current_streak}
                  total={activity.total_contributions}
                />
              </div>
            )}

            {/* Recent problems */}
            <div className="news-card animate-slide-up" data-delay="4">
              <div className="flex items-center justify-between p-4 border-b border-paper/10">
                <h2 className="font-headline font-bold text-paper">Latest Dispatches</h2>
                <Link href="/problems" className="text-xs text-gun-red font-mono hover:underline">
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-paper/5">
                {(questions as { id: string; difficulty: string; title: string; xp_reward: number; allowed_languages: string[] }[]).map((q) => (
                  <Link
                    key={q.id}
                    href={`/problems/${q.id}`}
                    className="flex items-center justify-between p-4 hover:bg-paper/3 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono uppercase ${difficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-sm text-paper group-hover:text-gun-red transition-colors font-headline">
                        {q.title}
                      </span>
                    </div>
                    <span className="text-xs text-paper/40 font-mono">+{q.xp_reward}xp</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right col ──────────────────── */}
          <div className="space-y-6">

            {/* Join Batch */}
            <div className="news-card p-5 animate-slide-up" data-delay="2">
              <h2 className="font-headline font-bold text-paper mb-3 border-b border-paper/10 pb-2">
                Join a Batch
              </h2>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  maxLength={10}
                  className="flex-1 bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20 uppercase"
                />
                <button
                  onClick={joinBatch}
                  disabled={joining || !joinCode}
                  className="bg-gun-red text-paper px-4 py-2 text-sm font-mono hover:bg-gun-red-dark disabled:opacity-50 transition-colors"
                >
                  {joining ? <Loader2 size={14} className="animate-spin" /> : 'JOIN'}
                </button>
              </div>
              {(batches as { id: string; name: string; subject?: string }[]).length > 0 && (
                <div className="mt-3 space-y-2">
                  {(batches as { id: string; name: string; subject?: string }[]).map((b) => (
                    <div key={b.id} className="flex items-center gap-2 text-xs text-paper/50 font-mono py-1 border-b border-paper/5">
                      <span className="text-gun-red">▪</span>
                      <span>{b.name}</span>
                      {b.subject && <span className="text-paper/30">— {b.subject}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="news-card animate-slide-up" data-delay="3">
              <div className="p-4 border-b border-paper/10">
                <h2 className="font-headline font-bold text-paper">Field Reports</h2>
                <p className="text-xs text-paper/40 font-mono">Recent submissions</p>
              </div>
              <div className="divide-y divide-paper/5">
                {(submissions as { id: string; question_title: string; status: string; created_at: string; xp_earned: number }[]).map((s) => (
                  <div key={s.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-paper/70 font-headline truncate">{s.question_title}</span>
                      <span className={`text-xs font-mono flex-shrink-0 ${statusColor(s.status)}`}>
                        {statusLabel(s.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-paper/25 font-mono">{formatRelative(s.created_at)}</span>
                      {s.xp_earned > 0 && <span className="text-xs text-gun-red font-mono">+{s.xp_earned}xp</span>}
                    </div>
                  </div>
                ))}
                {(submissions as unknown[]).length === 0 && (
                  <p className="p-4 text-xs text-paper/30 font-mono text-center">No submissions yet. Start solving!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
