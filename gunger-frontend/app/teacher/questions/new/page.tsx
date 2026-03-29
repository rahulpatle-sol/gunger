'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { questionApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'

const LANGS = ['javascript', 'python', 'php', 'rust', 'sql', 'java', 'cpp']

interface TestCase { input: string; expected_output: string; is_hidden: boolean }

export default function NewQuestionPage() {
  const { user } = useAuthStore()
  const router = useRouter()

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
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create')
    } finally { setSaving(false) }
  }

  if (!user || user.role === 'student') {
    router.push('/dashboard')
    return null
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-headline font-black text-3xl text-paper">File New Dispatch</h1>
          <p className="text-xs text-paper/40 font-mono mt-1">Create a question with hidden test cases</p>
        </div>

        <form onSubmit={submit} className="space-y-6 animate-slide-up" data-delay="1">

          {/* Basic info */}
          <div className="news-card p-5 space-y-4">
            <h2 className="font-headline font-bold text-paper border-b border-paper/10 pb-2">Question Details</h2>

            <div>
              <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Two Sum, Reverse String, etc."
                className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Given an array of integers... Explain input/output format clearly."
                rows={5}
                className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20 resize-y"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">XP Reward</label>
                <input
                  type="number"
                  min={5} max={200}
                  value={form.xp_reward}
                  onChange={e => setForm(f => ({ ...f, xp_reward: parseInt(e.target.value) || 20 }))}
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                    className="accent-gun-red"
                  />
                  <span className="text-xs font-mono text-paper/60">Public</span>
                </label>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Allowed Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGS.map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLang(l)}
                    className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                      form.allowed_languages.includes(l)
                        ? 'bg-paper text-ink font-bold'
                        : 'border border-paper/20 text-paper/40 hover:text-paper'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="news-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-paper/10 pb-2">
              <div>
                <h2 className="font-headline font-bold text-paper">Test Cases</h2>
                <p className="text-xs text-paper/30 font-mono mt-0.5">Hidden cases not shown to students</p>
              </div>
              <button
                type="button"
                onClick={addTC}
                className="flex items-center gap-1.5 text-xs font-mono text-gun-red hover:underline"
              >
                <Plus size={12} /> Add Case
              </button>
            </div>

            {testCases.map((tc, i) => (
              <div key={i} className="border border-paper/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-paper/40">Test Case {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateTC(i, 'is_hidden', !tc.is_hidden)}
                      className={`flex items-center gap-1 text-xs font-mono transition-colors ${
                        tc.is_hidden ? 'text-gun-red' : 'text-green-400'
                      }`}
                    >
                      {tc.is_hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      {tc.is_hidden ? 'Hidden' : 'Visible'}
                    </button>
                    {testCases.length > 1 && (
                      <button type="button" onClick={() => removeTC(i)} className="text-paper/30 hover:text-gun-red transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-paper/30 mb-1 block">Input</label>
                    <textarea
                      value={tc.input}
                      onChange={e => updateTC(i, 'input', e.target.value)}
                      placeholder="1 2"
                      rows={3}
                      className="w-full bg-ink border border-paper/15 text-paper px-3 py-2 font-mono text-xs focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/15 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-paper/30 mb-1 block">Expected Output</label>
                    <textarea
                      value={tc.expected_output}
                      onChange={e => updateTC(i, 'expected_output', e.target.value)}
                      placeholder="3"
                      rows={3}
                      className="w-full bg-ink border border-paper/15 text-paper px-3 py-2 font-mono text-xs focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/15 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gun-red text-paper py-3 font-headline font-bold text-lg hover:bg-gun-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : '🔫 Publish Question'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/teacher')}
              className="px-6 py-3 border border-paper/20 text-paper/60 hover:text-paper font-mono text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
