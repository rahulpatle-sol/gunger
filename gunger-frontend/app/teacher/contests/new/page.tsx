'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { contestApi, questionApi, batchApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Loader2 } from 'lucide-react'

interface QOption { id: string; title: string; difficulty: string }
interface BatchOption { id: string; name: string }
interface ContestQ { question_id: string; marks: number }

export default function NewContestPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', description: '', batch_id: '',
    start_time: '', end_time: '', is_public: false,
  })
  const [questions, setQuestions] = useState<ContestQ[]>([{ question_id: '', marks: 25 }])
  const [allQuestions, setAllQuestions] = useState<QOption[]>([])
  const [batches, setBatches] = useState<BatchOption[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user || user.role === 'student') { router.push('/dashboard'); return }
    Promise.all([questionApi.list(), batchApi.list()]).then(([q, b]) => {
      setAllQuestions(q.data)
      setBatches(b.data)
    })
  }, [user])

  const addQ = () => setQuestions(q => [...q, { question_id: '', marks: 25 }])
  const removeQ = (i: number) => setQuestions(q => q.filter((_, idx) => idx !== i))
  const updateQ = (i: number, field: keyof ContestQ, val: string | number) =>
    setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.start_time || !form.end_time) return toast.error('Fill required fields')
    if (new Date(form.start_time) >= new Date(form.end_time)) return toast.error('End time must be after start')
    const validQ = questions.filter(q => q.question_id)
    setSaving(true)
    try {
      const { data } = await contestApi.create({
        ...form,
        batch_id: form.batch_id || undefined,
        questions: validQ,
      })
      toast.success('Contest deployed! ⚔️')
      router.push(`/contests/${data.id}`)
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed')
    } finally { setSaving(false) }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-headline font-black text-3xl text-paper">Deploy Contest</h1>
          <p className="text-xs text-paper/40 font-mono mt-1">Create a timed coding contest for your batch</p>
        </div>

        <form onSubmit={submit} className="space-y-6 animate-slide-up" data-delay="1">
          <div className="news-card p-5 space-y-4">
            <h2 className="font-headline font-bold text-paper border-b border-paper/10 pb-2">Contest Info</h2>

            <div>
              <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Weekly Challenge #1"
                className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description..."
                rows={2}
                className="w-full bg-ink border border-paper/20 text-paper px-4 py-3 font-mono text-sm focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">Batch (Optional)</label>
                <select
                  value={form.batch_id}
                  onChange={e => setForm(f => ({ ...f, batch_id: e.target.value }))}
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red"
                >
                  <option value="">All / Public</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                    className="accent-gun-red"
                  />
                  <span className="text-xs font-mono text-paper/60">Make Public</span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="news-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-paper/10 pb-2">
              <h2 className="font-headline font-bold text-paper">Questions</h2>
              <button type="button" onClick={addQ} className="flex items-center gap-1.5 text-xs font-mono text-gun-red hover:underline">
                <Plus size={12} /> Add
              </button>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="flex items-center gap-3">
                <select
                  value={q.question_id}
                  onChange={e => updateQ(i, 'question_id', e.target.value)}
                  className="flex-1 bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red"
                >
                  <option value="">Select question...</option>
                  {allQuestions.map(aq => (
                    <option key={aq.id} value={aq.id}>{aq.title} ({aq.difficulty})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1} max={1000}
                  value={q.marks}
                  onChange={e => updateQ(i, 'marks', parseInt(e.target.value) || 25)}
                  className="w-20 bg-ink border border-paper/20 text-paper px-3 py-2 font-mono text-sm focus:outline-none focus:border-gun-red text-center"
                  placeholder="pts"
                />
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQ(i)} className="text-paper/30 hover:text-gun-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gun-red text-paper py-3 font-headline font-bold text-lg hover:bg-gun-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 size={18} className="animate-spin" />Deploying...</> : '⚔️ Deploy Contest'}
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
