'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { 
  Target, Bot, GraduationCap, Zap, Trophy, BarChart2, 
  ChevronRight, Terminal, Code2, ShieldAlert, Cpu, Layers 
} from 'lucide-react'

const FEATURES = [
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Hidden Test Cases',
    desc: 'Students only see sample inputs. Hidden cases run securely on submit — eliminating hardcoded workarounds.',
    tag: 'INTELLIGENCE',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'AI Code Review',
    desc: 'Groq AI analyzes every failed submission, providing targeted, context-aware nudges without revealing the solution.',
    tag: 'ARTIFICIAL INTEL',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Classroom Ecosystem',
    desc: 'Educators deploy invite-only, secure batches. Real-time grading ensures total academic accountability.',
    tag: 'EDUCATION',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Multi-Language Engine',
    desc: 'Python, JS, Rust, C++ and more. Executed in isolated, high-performance sandboxes with instant feedback.',
    tag: 'EXECUTION',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Gamified Progression',
    desc: 'Algorithmic XP distribution. Maintain streaks, climb the global ranks, and dominate the leaderboard.',
    tag: 'COMPETITION',
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Advanced Analytics',
    desc: 'Export granular student performance telemetry to CSV/PDF. Departmental reporting streamlined.',
    tag: 'ANALYTICS',
  },
]

const LANGS = ['Python', 'JavaScript', 'PHP', 'Rust', 'Java', 'C++', 'SQL']

const TICKER_ITEMS = [
  'WRITE CODE', 'RUN TESTS', 'DOMINATE', 'SUBMIT', 'EARN XP', 'CLIMB RANKS', 'REPEAT',
  'WRITE CODE', 'RUN TESTS', 'DOMINATE', 'SUBMIT', 'EARN XP', 'CLIMB RANKS', 'REPEAT',
]

const PIPELINE_STEPS = [
  { step: '01', title: 'Task Deployment', desc: 'Educators deploy problems with isolated edge-cases.', side: 'left', icon: <Layers /> },
  { step: '02', title: 'Code Synthesis', desc: 'Students execute solutions in our cloud Monaco environment.', side: 'right', icon: <Code2 /> },
  { step: '03', title: 'Sandbox Execution', desc: 'Code runs against hidden metrics. Millisecond precision.', side: 'left', icon: <Cpu /> },
  { step: '04', title: 'AI Diagnostics', desc: 'Groq analyzes failures, returning semantic hints.', side: 'right', icon: <ShieldAlert /> },
]

// Extracted Feature Card Component
function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 p-8 hover:bg-zinc-800/50 transition-colors duration-500 backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-red-500 group-hover:border-red-500/30 transition-colors duration-300">
            {f.icon}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest border border-zinc-800 bg-zinc-950/50 px-3 py-1 rounded-full">
            {f.tag}
          </span>
        </div>
        <h3 className="font-semibold text-xl text-zinc-100 mb-3 tracking-tight group-hover:text-white transition-colors">
          {f.title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed font-light">
          {f.desc}
        </p>
      </div>
    </motion.div>
  )
}

// Extracted Pipeline Step Component to fix Hook Rules
function PipelineStep({ item, index }: { item: typeof PIPELINE_STEPS[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`relative flex flex-col md:flex-row gap-8 mb-20 ${item.side === 'right' ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Node */}
      <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10" />
      
      <div className={`flex-1 ${item.side === 'right' ? 'md:text-right md:pr-16' : 'md:pl-16'} pl-16 md:pl-0`}>
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mb-6 ${item.side === 'right' ? 'md:ml-auto' : ''}`}>
          {item.icon}
        </div>
        <div className="font-mono text-red-500 text-sm mb-2">PHASE {item.step}</div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{item.title}</h3>
        <p className="text-zinc-400 leading-relaxed font-light">{item.desc}</p>
      </div>
      <div className="hidden md:block flex-1" />
    </motion.div>
  )
}

export default function LandingPage() {
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [currentLang, setCurrentLang] = useState(0)

  // Removed scroll transform that was causing unused variable warnings to keep it clean
  
  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setCurrentLang(prev => (prev + 1) % LANGS.length), 2000)
    return () => clearInterval(interval)
  }, [])

  // Removed the early `if (!mounted) return null` so hooks don't get skipped!
  
  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-zinc-200 selection:bg-red-500/30 selection:text-red-200">
      
      {/* ── Background Effects ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/30 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* ── SECTION 1: Hero ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <span className="text-xs font-mono text-zinc-400 tracking-wide uppercase">System Online • v2.0 Beta</span>
        </motion.div>

        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 mb-6"
          >
            GUNGER.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-tight">
              The ultimate execution environment for
            </p>
            <div className="h-10 md:h-12 bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 flex items-center justify-center overflow-hidden min-w-[180px]">
              {mounted ? (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentLang}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="text-xl md:text-2xl font-mono text-red-500 font-semibold"
                  >
                    {LANGS[currentLang]}
                  </motion.span>
                </AnimatePresence>
              ) : (
                 <span className="text-xl md:text-2xl font-mono text-red-500 font-semibold opacity-0">...</span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-3 bg-white text-zinc-950 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-200 transition-colors duration-300"
            >
              <Terminal className="w-5 h-5" />
              <span>Initialize Workspace</span>
              <div className="absolute inset-0 rounded-full ring-2 ring-white/20 scale-100 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-all duration-300 backdrop-blur-sm"
            >
              System Login <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: Infinity Ticker ── */}
      <section className="relative z-10 py-6 border-y border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 whitespace-nowrap"
        >
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="font-mono text-sm text-zinc-500 tracking-[0.2em] flex items-center gap-16">
              {item}
              <span className="text-red-500/50">///</span>
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── SECTION 3: The Architecture (Features) ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Performance</span>
            </h2>
            <p className="text-zinc-400 font-light max-w-2xl mx-auto">
              A high-end judging architecture designed to prevent shortcuts, encourage deep learning, and automate the grading pipeline entirely.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: The Execution Loop ── */}
      <section className="relative z-10 py-32 px-6 border-t border-zinc-800/50 bg-gradient-to-b from-zinc-950/50 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="mb-24 md:text-center">
            <span className="text-red-500 font-mono text-sm tracking-widest uppercase mb-4 block">The Pipeline</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">How Gunger Resolves.</h2>
          </div>

          <div className="relative">
            {/* Glowing connecting line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-500/0 via-red-500/20 to-red-500/0 md:-translate-x-1/2" />

            {/* Replaced map contents with the extracted component */}
            {PIPELINE_STEPS.map((item, i) => (
              <PipelineStep key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CTA ── */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-tr from-zinc-900 to-zinc-950 border border-zinc-800 p-12 md:p-20 text-center relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          
          <Terminal className="w-12 h-12 text-zinc-600 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to compile your future?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto font-light">
            Stop hardcoding solutions. Start building intuition. Join the elite tier of developers training on Gunger today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
          >
            Deploy Now <Zap className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

    </div>
  )
}