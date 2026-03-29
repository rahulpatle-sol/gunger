'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { contestApi } from '@/lib/api'
import { Loader2, Crown, BookOpen, Timer } from 'lucide-react'
import { xpToLevel } from '@/lib/utils'

interface LeaderEntry {
  id: string; username: string; solved: string; total_marks: string; last_solve_time?: string
}
interface ContestDetail {
  id: string; name: string; description?: string
  start_time: string; end_time: string
  teacher_name: string; is_public: boolean
  questions: { id: string; title: string; difficulty: string; marks: number }[]
}

export default function ContestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()
  const router = useRouter()
  const [contest, setContest] = useState<ContestDetail | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'problems' | 'leaderboard'>('problems')
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    Promise.all([
      contestApi.get(id),
      contestApi.leaderboard(id),
    ]).then(([c, l]) => {
      setContest(c.data)
      setLeaderboard(l.data)
    }).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!contest) return
    const tick = () => {
      const now = Date.now()
      const end = new Date(contest.end_time).getTime()
      const start = new Date(contest.start_time).getTime()
      if (now < start) {
        const diff = start - now
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        setTimeLeft(`Starts in ${h}h ${m}m`)
      } else if (now < end) {
        const diff = end - now
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')} remaining`)
      } else {
        setTimeLeft('Contest ended')
      }
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [contest])

  if (!user || loading) return (
    <><Navbar /><div className="flex justify-center py-24"><Loader2 className="animate-spin text-paper/40" size={32} /></div></>
  )
  if (!contest) return null

  const now = Date.now()
  const isLive = now >= new Date(contest.start_time).getTime() && now < new Date(contest.end_time).getTime()

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="news-card p-6 mb-6 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              {isLive && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                  <span className="text-xs font-mono text-green-400">LIVE NOW</span>
                </div>
              )}
              <h1 className="font-headline font-black text-3xl text-paper">{contest.name}</h1>
              {contest.description && <p className="text-sm text-paper/50 mt-2">{contest.description}</p>}
              <p className="text-xs text-paper/30 font-mono mt-2">by {contest.teacher_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2 text-gun-red font-mono text-sm">
                <Timer size={14} />
                {timeLeft}
              </div>
              <div className="text-xs text-paper/30 font-mono mt-1">
                {new Date(contest.start_time).toLocaleString()} →<br />
                {new Date(contest.end_time).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-paper/10 mb-6">
          {[
            { key: 'problems', label: 'Problems', icon: BookOpen },
            { key: 'leaderboard', label: 'Leaderboard', icon: Crown },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'problems' | 'leaderboard')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-mono transition-colors border-b-2 -mb-px ${
                tab === key
                  ? 'text-paper border-gun-red'
                  : 'text-paper/40 border-transparent hover:text-paper'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Problems tab */}
        {tab === 'problems' && (
          <div className="space-y-3 animate-slide-up">
            {contest.questions.length === 0 ? (
              <p className="text-center py-12 text-paper/30 font-mono">No problems added yet</p>
            ) : contest.questions.map((q, i) => (
              <Link
                key={q.id}
                href={`/problems/${q.id}?contest=${contest.id}`}
                className="flex items-center justify-between news-card p-4 hover:border-paper/25 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-paper/20 w-4">{String.fromCharCode(65 + i)}</span>
                  <div>
                    <span className="font-headline font-bold text-paper group-hover:text-gun-red transition-colors">
                      {q.title}
                    </span>
                    <div className="text-xs text-paper/30 font-mono mt-0.5 capitalize">{q.difficulty}</div>
                  </div>
                </div>
                <div className="text-sm font-mono text-gun-red">{q.marks}pts</div>
              </Link>
            ))}
          </div>
        )}

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div className="animate-slide-up">
            {leaderboard.length === 0 ? (
              <p className="text-center py-12 text-paper/30 font-mono">No submissions yet</p>
            ) : (
              <div className="border border-paper/10">
                <div className="grid grid-cols-12 px-4 py-2 border-b border-paper/10 bg-paper/2">
                  <div className="col-span-1 text-xs font-mono text-paper/30">#</div>
                  <div className="col-span-5 text-xs font-mono text-paper/30 uppercase">Reporter</div>
                  <div className="col-span-3 text-xs font-mono text-paper/30 uppercase text-center">Solved</div>
                  <div className="col-span-3 text-xs font-mono text-paper/30 uppercase text-right">Score</div>
                </div>
                {leaderboard.map((entry, i) => {
                  const isMe = entry.id === user?.id
                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 px-4 py-3 border-b border-paper/5 ${isMe ? 'bg-gun-red/10' : 'hover:bg-paper/2'}`}
                    >
                      <div className="col-span-1 self-center text-xs font-mono text-paper/30">{i + 1}</div>
                      <div className="col-span-5 self-center">
                        <span className={`font-headline font-bold text-sm ${isMe ? 'text-gun-red' : 'text-paper'}`}>
                          {entry.username}
                        </span>
                        <div className="text-xs text-paper/25 font-mono">Lv.{xpToLevel(0)}</div>
                      </div>
                      <div className="col-span-3 self-center text-center text-sm font-mono text-paper/60">
                        {entry.solved}/{contest.questions.length}
                      </div>
                      <div className="col-span-3 self-center text-right font-headline font-bold text-paper">
                        {entry.total_marks}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
