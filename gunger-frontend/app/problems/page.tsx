'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { questionApi } from '@/lib/api'
import { difficultyColor } from '@/lib/utils'
import { Loader2, Search, Filter } from 'lucide-react'

const LANGS = ['all', 'javascript', 'python', 'php', 'rust', 'sql', 'java']
const DIFFS = ['all', 'easy', 'medium', 'hard']

export default function ProblemsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [questions, setQuestions] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState('all')
  const [diff, setDiff] = useState('all')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    load()
  }, [user, lang, diff])

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (lang !== 'all') params.language = lang
      if (diff !== 'all') params.difficulty = diff
      const { data } = await questionApi.list(params)
      setQuestions(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  type Question = { id: string; title: string; difficulty: string; allowed_languages: string[]; xp_reward: number; teacher_name: string }
  const filtered = (questions as Question[]).filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-paper/10" />
            <h1 className="font-headline font-black text-3xl text-paper tracking-wide">PROBLEM ARCHIVE</h1>
            <div className="h-px flex-1 bg-paper/10" />
          </div>
          <p className="text-center text-xs text-paper/40 font-mono">
            {filtered.length} dispatches available — choose your weapon
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 border border-paper/10 animate-slide-up" data-delay="1">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-9 pr-3 py-2 bg-ink border border-paper/15 text-paper text-sm font-mono focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
            />
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-paper/30" />
            {DIFFS.map(d => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors ${
                  diff === d ? 'bg-gun-red text-paper' : 'text-paper/40 hover:text-paper border border-paper/10'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Language */}
          <div className="flex flex-wrap gap-1">
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-xs font-mono transition-colors ${
                  lang === l ? 'bg-paper/10 text-paper border border-paper/30' : 'text-paper/30 hover:text-paper'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Problems table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-paper/40" size={24} /></div>
        ) : (
          <div className="border border-paper/10 animate-slide-up" data-delay="2">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-paper/10 bg-paper/2">
              <div className="col-span-1 text-xs font-mono text-paper/30 uppercase">#</div>
              <div className="col-span-5 text-xs font-mono text-paper/30 uppercase">Title</div>
              <div className="col-span-2 text-xs font-mono text-paper/30 uppercase">Difficulty</div>
              <div className="col-span-2 text-xs font-mono text-paper/30 uppercase">Languages</div>
              <div className="col-span-2 text-xs font-mono text-paper/30 uppercase text-right">XP</div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-paper/30 font-mono text-sm">
                No problems match your filters
              </div>
            ) : (
              filtered.map((q, i) => (
                <Link
                  key={(q as Question).id}
                  href={`/problems/${(q as Question).id}`}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-paper/5 hover:bg-paper/3 transition-colors group"
                >
                  <div className="col-span-1 text-xs text-paper/20 font-mono self-center">{i + 1}</div>
                  <div className="col-span-5 self-center">
                    <span className="text-sm text-paper group-hover:text-gun-red transition-colors font-headline">
                      {(q as Question).title}
                    </span>
                    <div className="text-xs text-paper/25 font-mono mt-0.5">by {(q as Question).teacher_name}</div>
                  </div>
                  <div className="col-span-2 self-center">
                    <span className={`text-xs font-mono uppercase ${difficultyColor((q as Question).difficulty)}`}>
                      {(q as Question).difficulty}
                    </span>
                  </div>
                  <div className="col-span-2 self-center">
                    <div className="flex flex-wrap gap-1">
                      {(q as Question).allowed_languages.slice(0, 2).map(l => (
                        <span key={l} className="text-xs text-paper/30 font-mono border border-paper/10 px-1">
                          {l.slice(0, 2)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 self-center text-right">
                    <span className="text-xs text-gun-red font-mono">+{(q as Question).xp_reward}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
