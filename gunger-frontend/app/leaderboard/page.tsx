'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { statsApi } from '@/lib/api'
import { xpToLevel } from '@/lib/utils'
import { Loader2, Crown, Medal } from 'lucide-react'

interface LeaderEntry {
  id: string
  username: string
  xp: number
  problems_solved: string
  rank: string
}

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [board, setBoard] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    statsApi.globalLeaderboard().then(r => setBoard(r.data)).finally(() => setLoading(false))
  }, [user])

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={16} className="text-yellow-400" />
    if (rank === 2) return <Medal size={16} className="text-paper/60" />
    if (rank === 3) return <Medal size={16} className="text-yellow-700" />
    return <span className="text-xs font-mono text-paper/30 w-4 text-center">{rank}</span>
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1 bg-paper/10" />
            <span className="text-3xl">🏆</span>
            <div className="h-px flex-1 bg-paper/10" />
          </div>
          <h1 className="font-headline font-black text-4xl text-paper tracking-widest">HALL OF FAME</h1>
          <p className="text-xs text-paper/30 font-mono mt-2">GLOBAL RANKINGS · UPDATED LIVE</p>
        </div>

        {/* My rank */}
        {user && (
          <div className="news-card p-4 mb-6 border-l-4 border-l-gun-red animate-slide-up" data-delay="1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-paper/40 font-mono mb-1">YOUR STANDING</p>
                <p className="font-headline font-bold text-paper">{user.username}</p>
              </div>
              <div className="text-right">
                <p className="font-headline font-black text-2xl text-gun-red">{user.xp} XP</p>
                <p className="text-xs text-paper/40 font-mono">Level {xpToLevel(user.xp)}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-paper/40" size={24} /></div>
        ) : (
          <div className="border border-paper/10 animate-slide-up" data-delay="2">
            {/* Header row */}
            <div className="grid grid-cols-12 px-4 py-2 border-b border-paper/10 bg-paper/2">
              <div className="col-span-1 text-xs font-mono text-paper/30 uppercase">Rank</div>
              <div className="col-span-5 text-xs font-mono text-paper/30 uppercase">Reporter</div>
              <div className="col-span-3 text-xs font-mono text-paper/30 uppercase text-center">Solved</div>
              <div className="col-span-3 text-xs font-mono text-paper/30 uppercase text-right">XP</div>
            </div>

            {board.map((entry, i) => {
              const rank = parseInt(entry.rank)
              const isMe = entry.id === user?.id
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 px-4 py-3 border-b border-paper/5 transition-colors
                    ${isMe ? 'bg-gun-red/10 border-l-2 border-l-gun-red' : 'hover:bg-paper/2'}
                    ${rank <= 3 ? 'bg-paper/3' : ''}`}
                >
                  <div className="col-span-1 flex items-center">{rankIcon(rank)}</div>
                  <div className="col-span-5 flex items-center gap-2">
                    <span className={`font-headline font-bold text-sm ${isMe ? 'text-gun-red' : 'text-paper'}`}>
                      {entry.username}
                      {isMe && <span className="ml-1 text-xs font-mono text-gun-red/60">(you)</span>}
                    </span>
                    <span className="text-xs text-paper/25 font-mono">Lv.{xpToLevel(entry.xp)}</span>
                  </div>
                  <div className="col-span-3 flex items-center justify-center">
                    <span className="text-sm font-mono text-paper/60">{entry.problems_solved}</span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end">
                    <span className={`font-headline font-bold ${rank === 1 ? 'text-yellow-400' : rank <= 3 ? 'text-paper' : 'text-paper/60'}`}>
                      {entry.xp}
                    </span>
                  </div>
                </div>
              )
            })}

            {board.length === 0 && (
              <p className="text-center py-12 text-paper/30 font-mono text-sm">No entries yet. Be the first!</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-paper/15 font-mono">
            XP EARNED BY SOLVING PROBLEMS · CONTEST WINS MULTIPLY SCORE
          </p>
        </div>
      </div>
    </>
  )
}
