'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { questionApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react'

const LANGS = ['javascript', 'python', 'php', 'rust', 'sql', 'java', 'cpp']

interface TestCase { input: string; expected_output: string; is_hidden: boolean }

export default function NewQuestionPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'medium',
    allowed_languages: ['javascript', 'python'],
    xp_reward: 20, is_public: false,
  })
  
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expected_output: '', is_hidden: false },
    { input: '', expected_output: '', is_hidden: true },
  ])
  const [saving, setSaving] = useState(false)

  // FIX: Protect Route inside useEffect to avoid 'location' errors during build
  useEffect(() => {
    if (user !== undefined) {
      if (!user || user.role === 'student') {
        toast.error("Unauthorized Access")
        router.push('/dashboard')
      } else {
        setIsChecking(false)
      }
    }
  }, [user, router])

  const toggleLang = (l: string) => {
    setForm(f => ({
      ...f,
      allowed_languages: f.allowed_languages.includes(l)
        ? f.allowed_languages.filter(x => x !== l)
        : [...f.allowed_languages, l]
    }))
  }

  const addTC = () => setTestCases(t => [...t, { input: '', expected_output: '', is_hidden: true }])
  const removeTC = (i: number) => setTestCases(t => t.filter((_, idx) => idx !== i))
  const updateTC = (i: number, field: keyof TestCase, val: string | boolean) =>
    setTestCases(t => t.map((tc, idx) => idx === i ? { ...tc, [field]: val } : tc))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) return toast.error('Title and description required')
    const validTC = testCases.filter(t => t.input.trim() && t.expected_output.trim())
    if (validTC.length === 0) return toast.error('At least one test case required')
    if (form.allowed_languages.length === 0) return toast.error('Select at least one language')

    setSaving(true)
    try {
      await questionApi.create({ ...form, test_cases: validTC })
      toast.success('Question created! 🎯')
      router.push('/teacher')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create')
    } finally { setSaving(false) }
  }

  // Loading state to prevent layout shift/flash
  if (isChecking) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-gun-red animate-spin" />
          <p className="font-mono text-xs text-paper/40 tracking-widest uppercase animate-pulse">
            Authenticating Secure Line...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gun-red/10 border border-gun-red/20 rounded text-gun-red">
              <ShieldAlert size={20} />
            </div>
            <h1 className="font-headline font-black text-4xl text-paper tracking-tighter uppercase italic">
              Dispatch <span className="text-gun-red">New Task</span>
            </h1>
          </div>
          <p className="text-[10px] text-paper/30 font-mono tracking-[0.2em] uppercase ml-12">
            Protocol: Encrypted Judging // Hidden Metrics Enabled
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          {/* Question Details */}
          <div className="bg-zinc-900/50 border border-paper/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-8 border-b border-paper/5 pb-4">
              <span className="w-2 h-2 rounded-full bg-gun-red animate-pulse" />
              <h2 className="font-headline font-bold text-lg text-paper uppercase tracking-widest">Metadata</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono text-paper/40 uppercase tracking-[0.2em] mb-3">Target Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Memory Leak Detection"
                  className="w-full bg-ink/50 border border-paper/10 text-paper px-4 py-4 font-mono text-sm focus:outline-none focus:border-gun-red/50 transition-all placeholder:text-paper/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-paper/40 uppercase tracking-[0.2em] mb-3">Objective Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Define the challenge parameters..."
                  rows={6}
                  className="w-full bg-ink/50 border border-paper/10 text-paper px-4 py-4 font-mono text-sm focus:outline-none focus:border-gun-red/50 transition-all placeholder:text-paper/10 rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-paper/40 uppercase">Threat Level</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full bg-zinc-950 border border-paper/10 text-paper px-4 py-3 font-mono text-xs focus:outline-none focus:border-gun-red rounded-lg appearance-none cursor-pointer"
                  >
                    <option value="easy">Low (Easy)</option>
                    <option value="medium">Elevated (Medium)</option>
                    <option value="hard">Critical (Hard)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-paper/40 uppercase">XP Yield</label>
                  <input
                    type="number"
                    value={form.xp_reward}
                    onChange={e => setForm(f => ({ ...f, xp_reward: parseInt(e.target.value) || 20 }))}
                    className="w-full bg-zinc-950 border border-paper/10 text-paper px-4 py-3 font-mono text-xs focus:outline-none focus:border-gun-red rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                      className="w-4 h-4 rounded border-paper/20 bg-ink text-gun-red focus:ring-gun-red accent-gun-red"
                    />
                    <span className="text-[10px] font-mono text-paper/40 uppercase group-hover:text-paper transition-colors">Public Access</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="bg-zinc-900/50 border border-paper/10 rounded-2xl p-8 backdrop-blur-sm">
            <label className="block text-[10px] font-mono text-paper/40 uppercase tracking-[0.2em] mb-6">Execution Engines</label>
            <div className="flex flex-wrap gap-3">
              {LANGS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLang(l)}
                  className={`px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all rounded-lg border ${
                    form.allowed_languages.includes(l)
                      ? 'bg-gun-red border-gun-red text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                      : 'bg-ink/40 border-paper/10 text-paper/30 hover:border-paper/30 hover:text-paper'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="bg-zinc-900/50 border border-paper/10 rounded-2xl p-8 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-paper/5 pb-6">
              <div>
                <h2 className="font-headline font-bold text-lg text-paper uppercase tracking-widest">Test Matrices</h2>
                <p className="text-[10px] text-paper/20 font-mono mt-1">Hidden cases prevent algorithmic hardcoding.</p>
              </div>
              <button
                type="button"
                onClick={addTC}
                className="flex items-center gap-2 text-[10px] font-mono font-black text-gun-red bg-gun-red/5 px-4 py-2 rounded-full border border-gun-red/20 hover:bg-gun-red hover:text-white transition-all uppercase tracking-tighter"
              >
                <Plus size={14} /> Add Vector
              </button>
            </div>

            <div className="space-y-4">
              {testCases.map((tc, i) => (
                <div key={i} className="group bg-ink/30 border border-paper/5 rounded-xl p-6 transition-all hover:border-paper/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-paper/20 uppercase tracking-widest">Vector #{i + 1}</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => updateTC(i, 'is_hidden', !tc.is_hidden)}
                        className={`flex items-center gap-2 text-[10px] font-mono font-bold transition-all uppercase ${
                          tc.is_hidden ? 'text-gun-red' : 'text-emerald-500'
                        }`}
                      >
                        {tc.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        {tc.is_hidden ? 'Hidden' : 'Visible'}
                      </button>
                      {testCases.length > 1 && (
                        <button type="button" onClick={() => removeTC(i)} className="text-paper/10 hover:text-gun-red transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-paper/20 uppercase">Input Stream</label>
                      <textarea
                        value={tc.input}
                        onChange={e => updateTC(i, 'input', e.target.value)}
                        placeholder="e.g. [1, 5, 10]"
                        rows={2}
                        className="w-full bg-zinc-950 border border-paper/10 text-paper px-4 py-3 font-mono text-xs focus:outline-none focus:border-gun-red transition-all rounded-lg resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-paper/20 uppercase">Expected Resolve</label>
                      <textarea
                        value={tc.expected_output}
                        onChange={e => updateTC(i, 'expected_output', e.target.value)}
                        placeholder="e.g. 16"
                        rows={2}
                        className="w-full bg-zinc-950 border border-paper/10 text-paper px-4 py-3 font-mono text-xs focus:outline-none focus:border-gun-red transition-all rounded-lg resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] bg-gun-red text-white py-5 rounded-xl font-headline font-black text-xl hover:bg-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
            >
              {saving ? (
                <><Loader2 size={24} className="animate-spin" /> Finalizing...</>
              ) : (
                'Deploy Protocol'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/teacher')}
              className="flex-1 px-8 py-5 border border-paper/10 text-paper/40 hover:text-paper hover:bg-zinc-900 font-mono text-xs uppercase tracking-[0.2em] rounded-xl transition-all"
            >
              Abort
            </button>
          </div> 
        </form>
      </div>
    </div>
  )
}