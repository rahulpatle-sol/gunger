'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.username}`)
      router.push(data.user.role === 'student' ? '/dashboard' : '/teacher')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Masthead */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-12 bg-paper/30" />
              <span className="text-2xl">🔫</span>
              <div className="h-px w-12 bg-paper/30" />
            </div>
            <h1 className="font-headline font-black text-5xl text-paper tracking-widest">GUNGER</h1>
          </Link>
          <p className="text-xs text-paper/40 font-mono mt-2 tracking-widest">SECURE ACCESS TERMINAL</p>
        </div>

        {/* Form card */}
        <div className="border border-paper/15 p-8 news-card">
          <div className="border-b border-paper/10 pb-4 mb-6">
            <h2 className="font-headline font-bold text-xl text-paper">Reporter Sign-In</h2>
            <p className="text-xs text-paper/40 font-mono mt-1">Present your credentials to enter the newsroom</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs text-paper/50 font-mono uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
                placeholder="your_username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs text-paper/50 font-mono uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gun-red text-paper py-3 font-headline font-bold text-lg hover:bg-gun-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : '🔫 Enter Newsroom'}
            </button>
          </form>

          <p className="text-center text-xs text-paper/30 font-mono mt-6">
            No credentials?{' '}
            <Link href="/register" className="text-gun-red hover:underline">
              Enlist here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-paper/15 font-mono mt-6">
          ALL ACCESS ATTEMPTS ARE LOGGED AND MONITORED
        </p>
      </div>
    </div>
  )
}
