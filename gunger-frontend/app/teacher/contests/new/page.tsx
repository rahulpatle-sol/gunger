'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Swords, Timer, Users, Trophy, Zap, 
  Search, Filter, ChevronRight, Lock, 
  Terminal, BarChart3, Radio
} from 'lucide-react'

// Mock Real-World Contest Data
const CONTEST_DATA = [
  {
    id: 'c1',
    title: 'Zero-Day Genesis',
    status: 'live',
    participants: 1240,
    startTime: 'Active Now',
    duration: '2h 00m',
    prize: '5000 XP',
    difficulty: 'Hard',
    tag: 'SYSTEM_CORE',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'
  },
  {
    id: 'c2',
    title: 'Neural Link Breach',
    status: 'upcoming',
    participants: 850,
    startTime: 'Starts in 4h 12m',
    duration: '1h 30m',
    prize: '2500 XP',
    difficulty: 'Medium',
    tag: 'AI_LOGIC'
  },
  {
    id: 'c3',
    title: 'Rust Engine Optimization',
    status: 'upcoming',
    participants: 420,
    startTime: 'Tomorrow, 10:00 AM',
    duration: '3h 00m',
    prize: '8000 XP',
    difficulty: 'Expert',
    tag: 'LOW_LEVEL'
  },
  {
    id: 'c4',
    title: 'Protocol 7: Encryption',
    status: 'past',
    participants: 2100,
    startTime: 'Ended 2 days ago',
    duration: '2h 00m',
    prize: 'Winner: @SoulDev',
    difficulty: 'Medium',
    tag: 'SECURITY'
  }
]

export default function ContestsPage() {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'past'>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredContests = CONTEST_DATA.filter(c => filter === 'all' || c.status === filter)

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 pb-20 pt-28 px-6 relative overflow-hidden">
      
      {/* ── Background Polish ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-zinc-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="p-2 bg-red-600/10 border border-red-500/20 rounded-lg text-red-500">
                <Swords size={18} />
              </div>
              <span className="text-xs font-mono text-zinc-500 tracking-[0.3em] uppercase">Combat Arenas</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-white"
            >
              THE <span className="text-red-600 underline decoration-red-900/50 underline-offset-8">ARENAS.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl backdrop-blur-sm"
          >
            {['all', 'live', 'upcoming', 'past'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all ${
                  filter === t ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── Featured Bento Arena ── */}
        <AnimatePresence mode="wait">
          {filter === 'all' || filter === 'live' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
            >
              {/* Featured Card */}
              <div className="lg:col-span-2 relative h-[400px] group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                <img 
                  src={CONTEST_DATA[0].image} 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                  alt="arena"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                
                <div className="absolute top-6 left-6 flex gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Arena</span>
                  </div>
                  <div className="px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-full backdrop-blur-md">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{CONTEST_DATA[0].tag}</span>
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 right-10">
                  <div className="flex items-center gap-4 text-red-500 mb-2">
                    <span className="text-4xl font-black">01:42:59</span>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Time Remaining</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">ZERO-DAY GENESIS</h2>
                  <div className="flex flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-zinc-500" />
                      <span className="text-sm font-mono text-zinc-300">{CONTEST_DATA[0].participants} ENLISTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-red-500" />
                      <span className="text-sm font-mono text-white">5,000 XP BOUNTY</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all uppercase tracking-widest">
                    Enter Arena <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] mb-6">Your Status</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase mb-2">
                        <span>Global Rank</span>
                        <span className="text-red-500">#42</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-red-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Solved</div>
                        <div className="text-2xl font-black text-white">128</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Wins</div>
                        <div className="text-2xl font-black text-white">12</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 rounded-2xl bg-red-600/5 border border-red-500/20">
                  <p className="text-[11px] text-red-500/80 font-mono leading-relaxed uppercase">
                    &gt; Warning: Neural fatigue detected. 2 hours of arena time remaining before mandatory cooling.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Contest Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border ${
                  c.status === 'live' ? 'bg-red-600/10 border-red-500/50 text-red-500' : 
                  c.status === 'upcoming' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' :
                  'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}>
                  {c.status}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 uppercase">
                   <BarChart3 size={12} />
                   {c.difficulty}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-red-500 transition-colors">
                {c.title}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-6">
                {c.tag} • {c.duration}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Timer size={14} className="text-zinc-600" />
                    <span>{c.startTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users size={14} className="text-zinc-600" />
                    <span>{c.participants} Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-red-500" />
                  <span className="text-sm font-bold text-white">{c.prize}</span>
                </div>
                <button className={`p-2 rounded-lg transition-all ${
                  c.status === 'past' ? 'text-zinc-700 pointer-events-none' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}>
                  {c.status === 'upcoming' ? <Lock size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}