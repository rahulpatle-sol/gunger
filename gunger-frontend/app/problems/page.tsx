'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { questionApi } from '@/lib/api'
import { difficultyColor } from '@/lib/utils'
import { Loader2, Search, Filter, Terminal, Zap, ChevronRight } from 'lucide-react'

const LANGS = ['all', 'javascript', 'python', 'php', 'rust', 'sql', 'java']
const DIFFS = ['all', 'easy', 'medium', 'hard']

interface Question {
  id: string
  title: string
  difficulty: string
  allowed_languages: string[]
  xp_reward: number
  teacher_name: string
}

export default function ProblemsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState('all')
  const [diff, setDiff] = useState('all')

  useEffect(() => {
    if (user === null) { router.push('/login'); return }
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
    } catch { 
      setQuestions([]) 
    } finally { 
      setLoading(false) 
    }
  }

  const filtered = questions.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-ink pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* --- Header Section --- */}
        <div className="mb-10 text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gun-red" />
            <h1 className="font-headline font-black text-4xl md:text-5xl text-paper tracking-tighter italic uppercase">
              Problem <span className="text-gun-red">Archive</span>
            </h1>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gun-red" />
          </div>
          <p className="text-[10px] text-paper/30 font-mono tracking-[0.3em] uppercase">
            {filtered.length} active dispatches // Select your objective
          </p>
        </div>

        {/* --- Controls / Filters --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Search Bar */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={16} className="text-paper/20 group-focus-within:text-gun-red transition-colors" />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by mission title..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-paper/10 text-paper font-mono text-sm rounded-xl focus:outline-none focus:border-gun-red/50 transition-all placeholder:text-paper/10"
            />
          </div>

          {/* Difficulty Toggle */}
          <div className="flex bg-zinc-900/50 border border-paper/10 p-1 rounded-xl overflow-x-auto scrollbar-hide">
            {DIFFS.map(d => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={`flex-1 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-all rounded-lg whitespace-nowrap ${
                  diff === d 
                    ? 'bg-gun-red text-white shadow-lg shadow-gun-red/20' 
                    : 'text-paper/30 hover:text-paper hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Language Scroll (Mobile Friendly) */}
          <div className="flex bg-zinc-900/50 border border-paper/10 p-1 rounded-xl overflow-x-auto scrollbar-hide">
             <div className="flex gap-1 w-full">
                {LANGS.slice(0, 4).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`flex-1 px-3 py-3 text-[10px] font-mono transition-all rounded-lg uppercase tracking-tighter ${
                      lang === l 
                        ? 'bg-paper text-ink font-black' 
                        : 'text-paper/20 hover:text-paper'
                    }`}
                  >
                    {l.slice(0, 3)}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* --- Problem List --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-gun-red" size={40} />
            <span className="font-mono text-[10px] text-paper/20 tracking-widest uppercase">Fetching encrypted data...</span>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-zinc-950/50 border border-paper/5 rounded-t-xl mb-2 text-[10px] font-mono text-paper/20 uppercase tracking-[0.2em]">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Mission Objective</div>
              <div className="col-span-2">Threat Level</div>
              <div className="col-span-2">Engines</div>
              <div className="col-span-2 text-right">Yield</div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-paper/10 rounded-2xl">
                <Terminal size={40} className="mx-auto text-paper/10 mb-4" />
                <p className="font-mono text-sm text-paper/30">Zero matches found in the current sector.</p>
              </div>
            ) : (
              filtered.map((q, i) => (
                <Link
                  key={q.id}
                  href={`/problems/${q.id}`}
                  className="group relative block bg-zinc-900/40 border border-paper/10 hover:border-gun-red/30 rounded-xl transition-all hover:translate-x-1"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gun-red opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />
                  
                  {/* Grid / Content Wrapper */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 items-center">
                    
                    {/* Index & Title */}
                    <div className="col-span-1 hidden md:block font-mono text-xs text-paper/10">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    
                    <div className="col-span-1 md:col-span-5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg md:text-xl font-headline font-bold text-paper group-hover:text-gun-red transition-colors uppercase tracking-tight italic">
                          {q.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-paper/10 group-hover:bg-gun-red transition-colors" />
                        <span className="text-[10px] text-paper/20 font-mono uppercase tracking-widest italic group-hover:text-paper/40 transition-colors">
                          Dispatch by {q.teacher_name}
                        </span>
                      </div>
                    </div>

                    {/* Difficulty (Mobile & Desktop) */}
                    <div className="col-span-1 md:col-span-2 flex items-center">
                      <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${difficultyColor(q.difficulty)} uppercase tracking-widest`}>
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Languages Tags */}
                    <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2">
                      {q.allowed_languages.slice(0, 3).map(l => (
                        <span key={l} className="text-[9px] font-mono text-paper/30 border border-paper/10 px-2 py-0.5 rounded uppercase tracking-tighter bg-ink/50">
                          {l}
                        </span>
                      ))}
                    </div>

                    {/* XP & Arrow */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-paper/5 pt-4 md:pt-0">
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-gun-red fill-gun-red/20" />
                        <span className="text-sm font-mono font-black text-gun-red group-hover:scale-110 transition-transform">
                          +{q.xp_reward} <span className="text-[10px] opacity-50 font-normal ml-0.5">XP</span>
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-paper/10 group-hover:text-gun-red group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}