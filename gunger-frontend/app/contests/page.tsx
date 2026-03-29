'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { contestApi } from '@/lib/api'
import { Loader2, Swords, Clock, Users } from 'lucide-react'

interface Contest {
  id: string; name: string; description?: string
  start_time: string; end_time: string
  teacher_name: string; is_public: boolean
}

export default function ContestsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    contestApi.list().then(r => setContests(r.data)).finally(() => setLoading(false))
  }, [user])

  const getStatus = (start: string, end: string) => {
    const now = Date.now()
    if (now < new Date(start).getTime()) return { label: 'UPCOMING', cls: 'text-yellow-400 border-yellow-400/30' }
    if (now < new Date(end).getTime()) return { label: '🔴 LIVE', cls: 'text-green-400 border-green-400/30 animate-pulse-red' }
    return { label: 'ENDED', cls: 'text-paper/30 border-paper/10' }
  }

  const formatDuration = (start: string, end: string) => {
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1 bg-paper/10" />
            <span className="text-3xl">⚔️</span>
            <div className="h-px flex-1 bg-paper/10" />
          </div>
          <h1 className="font-headline font-black text-4xl text-paper tracking-widest">WAR ROOM</h1>
          <p className="text-xs text-paper/30 font-mono mt-2">TIMED CONTESTS · COMPETE OR GO HOME</p>
        </div>

        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div className="flex justify-end mb-4">
            <Link
              href="/teacher/contests/new"
              className="flex items-center gap-2 bg-gun-red text-paper px-4 py-2 text-sm font-mono hover:bg-gun-red-dark transition-colors"
            >
              <Swords size={14} /> Deploy Contest
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-paper/40" size={24} /></div>
        ) : contests.length === 0 ? (
          <div className="text-center py-16 text-paper/30 font-mono">No contests yet. Stay tuned.</div>
        ) : (
          <div className="space-y-4">
            {contests.map(c => {
              const { label, cls } = getStatus(c.start_time, c.end_time)
              return (
                <Link
                  key={c.id}
                  href={`/contests/${c.id}`}
                  className="block news-card p-5 hover:border-paper/25 transition-all group animate-slide-up"
                  data-delay="1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-mono px-2 py-0.5 border ${cls}`}>{label}</span>
                        {c.is_public && <span className="text-xs font-mono text-paper/30">PUBLIC</span>}
                      </div>
                      <h3 className="font-headline font-bold text-xl text-paper group-hover:text-gun-red transition-colors">
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="text-sm text-paper/40 mt-1 line-clamp-2">{c.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-paper/40 font-mono mb-1">
                        <Clock size={10} />
                        {formatDuration(c.start_time, c.end_time)}
                      </div>
                      <div className="text-xs text-paper/30 font-mono">by {c.teacher_name}</div>
                      <div className="text-xs text-paper/20 font-mono mt-1">
                        {new Date(c.start_time).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
