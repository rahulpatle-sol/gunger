'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { 
  Loader2, User, Mail, Lock, Terminal, 
  GraduationCap, Code2, ChevronRight, Sparkles 
} from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const { setAuth, user } = useAuthStore()
  const router = useRouter()

  // Ensure redirect happens as soon as the auth state settles
  useEffect(() => {
    if (user && !loading) {
      setIsRedirecting(true)
      const path = user.role === 'student' ? '/dashboard' : '/teacher'
      router.replace(path)
    }
  }, [user, router, loading])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return toast.error('All sectors required')
    if (form.password.length < 6) return toast.error('Security key too short (min 6)')
    
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      setAuth(data.user, data.token)
      toast.success(`Welcome to Gunger, ${data.user.username}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Enlistment Failed'
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* ── Visual Backdrop ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-800/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        {/* Masthead */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md mb-6"
          >
            <Sparkles className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase">Deployment Office</span>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            JOIN THE <span className="text-red-600">NETWORK.</span>
          </h1>
        </div>

        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-zinc-800 via-red-500/10 to-zinc-800 rounded-3xl blur-md opacity-50 transition duration-1000" />
          
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-10 backdrop-blur-xl">
            
            {/* Role Selection Hook */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { id: 'student', label: 'Student', icon: <Code2 className="w-5 h-5" />, desc: 'Solve & Earn' },
                { id: 'teacher', label: 'Mentor', icon: <GraduationCap className="w-5 h-5" />, desc: 'Manage & Deploy' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setForm(f => ({ ...f, role: role.id }))}
                  type="button"
                  className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 ${
                    form.role === role.id 
                      ? 'bg-zinc-900 border-red-500/50 ring-1 ring-red-500/20' 
                      : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-3 ${form.role === role.id ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 bg-zinc-950'}`}>
                    {role.icon}
                  </div>
                  <div className="text-sm font-bold text-white">{role.label}</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{role.desc}</div>
                  
                  {form.role === role.id && (
                    <motion.div layoutId="activeRole" className="absolute inset-0 border-2 border-red-500/50 rounded-2xl pointer-events-none" />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-5">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Alias</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                      placeholder="hunter_7"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Digital Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                      placeholder="contact@gunger.io"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Security Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isRedirecting}
                className="w-full group relative flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                <AnimatePresence mode="wait">
                  {loading || isRedirecting ? (
                    <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Profile...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <span>Complete Enlistment</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
              <p className="text-xs text-zinc-500 font-light">
                Already part of the network?{' '}
                <Link href="/login" className="text-white font-semibold hover:text-red-500 transition-colors ml-1">
                  Access Terminal
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-zinc-700 mt-10 tracking-widest uppercase">
          Gunger Protocol © 2026 • Secure Execution Guaranteed
        </p>
      </motion.div>
    </div>
  )
}