'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return toast.error('Fill all fields')
    if (form.password.length < 6) return toast.error('Password min 6 chars')
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      setAuth(data.user, data.token)
      toast.success(`Welcome to the newsroom, ${data.user.username}!`)
      router.push(data.user.role === 'student' ? '/dashboard' : '/teacher')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-12 bg-paper/30" />
              <span className="text-2xl">🔫</span>
              <div className="h-px w-12 bg-paper/30" />
            </div>
            <h1 className="font-headline font-black text-5xl text-paper tracking-widest">GUNGER</h1>
          </Link>
          <p className="text-xs text-paper/40 font-mono mt-2 tracking-widest">ENLISTMENT OFFICE</p>
        </div>

        <div className="border border-paper/15 p-8 news-card">
          <div className="border-b border-paper/10 pb-4 mb-6">
            <h2 className="font-headline font-bold text-xl text-paper">Enlist in the Newsroom</h2>
            <p className="text-xs text-paper/40 font-mono mt-1">Choose your role and start your mission</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'student', label: 'Student', emoji: '👨‍💻', desc: 'Solve problems, earn XP' },
              { value: 'teacher', label: 'Teacher', emoji: '🎓', desc: 'Create batches & contests' },
            ].map(({ value, label, emoji, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: value }))}
                className={`border p-3 text-left transition-all ${
                  form.role === value
                    ? 'border-gun-red bg-gun-red/10'
                    : 'border-paper/15 hover:border-paper/30'
                }`}
              >
                <div className="text-xl mb-1">{emoji}</div>
                <div className="text-sm font-headline font-bold text-paper">{label}</div>
                <div className="text-xs text-paper/40 font-mono">{desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[
              { key: 'username', label: 'Username', type: 'text', placeholder: 'cool_coder_99' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-paper/50 font-mono uppercase tracking-wider mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gun-red text-paper py-3 font-headline font-bold text-lg hover:bg-gun-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Enlisting...</>
                : `🔫 Enlist as ${form.role === 'student' ? 'Student' : 'Teacher'}`
              }
            </button>
          </form>

          <p className="text-center text-xs text-paper/30 font-mono mt-6">
            Already enlisted?{' '}
            <Link href="/login" className="text-gun-red hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
