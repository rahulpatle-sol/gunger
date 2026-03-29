'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Loader2, ShieldCheck, Lock, User, Terminal, ChevronRight } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const { setAuth, user } = useAuthStore()
  const router = useRouter()

  // FIX: Watch the auth state. If user exists, move them immediately.
  // This prevents the "stuck on login" bug if router.push fails the first time.
  useEffect(() => {
    if (user && !loading) {
      setIsRedirecting(true)
      const path = user.role === 'student' ? '/dashboard' : '/teacher'
      router.replace(path)
    }
  }, [user, router, loading])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Credentials required')
    
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      
      // Update store
      setAuth(data.user, data.token)
      toast.success(`Access Granted: Welcome ${data.user.username}`)
      
      // The useEffect above will handle the actual redirection smoothly
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Authentication Failed'
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex items-center justify-center px-6 relative overflow-hidden">
      
      {/* ── Background Aesthetics ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Brand/Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md mb-6"
          >
            <Terminal className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase">Auth Terminal v2.0</span>
          </motion.div>
          
          <Link href="/" className="group block">
            <h1 className="text-5xl font-black tracking-tighter text-white group-hover:text-red-500 transition-colors duration-300">
              GUNGER<span className="text-red-600">.</span>
            </h1>
          </Link>
        </div>

        {/* Login Card */}
        <div className="relative group">
          {/* Animated Border Glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-zinc-800 via-red-500/20 to-zinc-800 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                Identity Verification
              </h2>
              <p className="text-sm text-zinc-500 mt-1 font-light">Enter your secure credentials to proceed.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    placeholder="sol_dev_01"
                    disabled={loading || isRedirecting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    placeholder="••••••••"
                    disabled={loading || isRedirecting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isRedirecting}
                className="w-full group relative flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {loading || isRedirecting ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRedirecting ? 'Initializing Session...' : 'Verifying Identity...'}</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="static"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span>Authorize Access</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
              <p className="text-xs text-zinc-500 font-light">
                New operative?{' '}
                <Link href="/register" className="text-red-500 font-semibold hover:text-red-400 transition-colors ml-1">
                  Enlist now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-zinc-900" />
          <span className="text-[10px] font-mono text-zinc-700 tracking-tighter uppercase">Encrypted Connection Established</span>
          <div className="h-px flex-1 bg-zinc-900" />
        </div>
      </motion.div>
    </div>
  )
}