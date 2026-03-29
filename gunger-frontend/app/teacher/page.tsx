'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { batchApi, questionApi, contestApi, exportApi } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2, Plus, Users, BookOpen, Swords, Download, Copy, Trash2 } from 'lucide-react'

interface Batch { id: string; name: string; subject?: string; join_code: string; created_at: string }
interface Question { id: string; title: string; difficulty: string; xp_reward: number }
interface Contest { id: string; name: string; start_time: string; end_time: string }

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [batches, setBatches] = useState<Batch[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchForm, setBatchForm] = useState({ name: '', subject: '' })
  const [creating, setCreating] = useState(false)
  const [exportingId, setExportingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role === 'student') { router.push('/dashboard'); return }
    load()
  }, [user])

  const load = async () => {
    try {
      const [b, q, c] = await Promise.all([
        batchApi.list(), questionApi.list(), contestApi.list()
      ])
      setBatches(b.data)
      setQuestions(q.data)
      setContests(c.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const createBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchForm.name) return toast.error('Batch name required')
    setCreating(true)
    try {
      await batchApi.create(batchForm)
      toast.success('Batch created!')
      setShowBatchForm(false)
      setBatchForm({ name: '', subject: '' })
      const b = await batchApi.list()
      setBatches(b.data)
    } catch { toast.error('Failed to create batch') }
    finally { setCreating(false) }
  }

  const deleteBatch = async (id: string, name: string) => {
    if (!confirm(`Delete batch "${name}"? This cannot be undone.`)) return
    try {
      await batchApi.delete(id)
      toast.success('Batch deleted')
      setBatches(prev => prev.filter(b => b.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Join code copied!')
  }

  const exportBatch = async (id: string, fmt: 'excel' | 'pdf') => {
    setExportingId(id + fmt)
    try {
      const { data } = await exportApi.batch(id, fmt)
      downloadBlob(data, `gunger-batch-${id}.${fmt === 'excel' ? 'xlsx' : 'pdf'}`)
      toast.success(`${fmt.toUpperCase()} downloaded!`)
    } catch { toast.error('Export failed') }
    finally { setExportingId(null) }
  }

  if (!user || loading) return (
    <><Navbar /><div className="flex justify-center py-24"><Loader2 className="animate-spin text-paper/40" size={32} /></div></>
  )

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-headline font-black text-4xl text-paper">{user.username}</h1>
              <span className="stamp text-xs">
                {user.role === 'admin' ? 'EDITOR-IN-CHIEF' : 'SENIOR REPORTER'}
              </span>
            </div>
            <p className="text-sm text-paper/40 font-mono">Teacher Command Centre · Gunger Times</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Batches', value: batches.length, color: 'text-gun-red' },
            { icon: BookOpen, label: 'Questions', value: questions.length, color: 'text-yellow-400' },
            { icon: Swords, label: 'Contests', value: contests.length, color: 'text-green-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="news-card p-5 animate-slide-up" data-delay="1">
              <Icon size={18} className={`${color} mb-2`} />
              <div className={`font-headline font-black text-3xl ${color}`}>{value}</div>
              <div className="text-xs text-paper/40 font-mono uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Batches ──────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-xl text-paper">Batches</h2>
              <button
                onClick={() => setShowBatchForm(v => !v)}
                className="flex items-center gap-1.5 text-xs font-mono text-gun-red hover:underline"
              >
                <Plus size={12} /> New Batch
              </button>
            </div>

            {showBatchForm && (
              <form onSubmit={createBatch} className="news-card p-4 border border-gun-red/20 animate-slide-up space-y-3">
                <input
                  value={batchForm.name}
                  onChange={e => setBatchForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Batch name (e.g. CSE-A 2025)"
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 text-sm font-mono focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
                />
                <input
                  value={batchForm.subject}
                  onChange={e => setBatchForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Subject (optional)"
                  className="w-full bg-ink border border-paper/20 text-paper px-3 py-2 text-sm font-mono focus:outline-none focus:border-gun-red transition-colors placeholder:text-paper/20"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-gun-red text-paper py-2 text-sm font-mono hover:bg-gun-red-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create Batch'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBatchForm(false)}
                    className="px-4 py-2 text-sm font-mono text-paper/40 hover:text-paper border border-paper/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="news-card divide-y divide-paper/5 animate-slide-up" data-delay="2">
              {batches.length === 0 ? (
                <p className="p-6 text-center text-paper/30 font-mono text-sm">No batches yet. Create one above.</p>
              ) : batches.map(b => (
                <div key={b.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-headline font-bold text-paper text-sm">{b.name}</p>
                      {b.subject && <p className="text-xs text-paper/40 font-mono">{b.subject}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono bg-ink border border-paper/15 px-2 py-0.5 text-paper/60 tracking-widest">
                          {b.join_code}
                        </span>
                        <button onClick={() => copyCode(b.join_code)} className="text-paper/30 hover:text-paper transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => exportBatch(b.id, 'excel')}
                        disabled={exportingId === b.id + 'excel'}
                        className="flex items-center gap-1 text-xs font-mono text-green-400/70 hover:text-green-400 transition-colors disabled:opacity-50"
                      >
                        {exportingId === b.id + 'excel'
                          ? <Loader2 size={10} className="animate-spin" />
                          : <Download size={10} />} Excel
                      </button>
                      <button
                        onClick={() => exportBatch(b.id, 'pdf')}
                        disabled={exportingId === b.id + 'pdf'}
                        className="flex items-center gap-1 text-xs font-mono text-yellow-400/70 hover:text-yellow-400 transition-colors disabled:opacity-50"
                      >
                        {exportingId === b.id + 'pdf'
                          ? <Loader2 size={10} className="animate-spin" />
                          : <Download size={10} />} PDF
                      </button>
                      <button
                        onClick={() => deleteBatch(b.id, b.name)}
                        className="flex items-center gap-1 text-xs font-mono text-gun-red/50 hover:text-gun-red transition-colors"
                      >
                        <Trash2 size={10} /> Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Questions + Contests ─────────── */}
          <div className="space-y-4">

            {/* Questions */}
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-xl text-paper">Questions</h2>
              <Link href="/teacher/questions/new" className="flex items-center gap-1.5 text-xs font-mono text-gun-red hover:underline">
                <Plus size={12} /> New Question
              </Link>
            </div>

            <div className="news-card divide-y divide-paper/5 animate-slide-up" data-delay="3">
              {questions.length === 0 ? (
                <p className="p-6 text-center text-paper/30 font-mono text-sm">No questions yet.</p>
              ) : questions.slice(0, 6).map(q => (
                <div key={q.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-headline text-paper">{q.title}</p>
                    <p className="text-xs text-paper/30 font-mono">{q.difficulty} · +{q.xp_reward}xp</p>
                  </div>
                  <Link
                    href={`/problems/${q.id}`}
                    className="text-xs text-gun-red font-mono hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ))}
              {questions.length > 6 && (
                <Link href="/problems" className="block p-3 text-center text-xs text-paper/30 font-mono hover:text-paper transition-colors">
                  +{questions.length - 6} more problems →
                </Link>
              )}
            </div>

            {/* Contests */}
            <div className="flex items-center justify-between mt-4">
              <h2 className="font-headline font-bold text-xl text-paper">Contests</h2>
              <Link href="/teacher/contests/new" className="flex items-center gap-1.5 text-xs font-mono text-gun-red hover:underline">
                <Plus size={12} /> New Contest
              </Link>
            </div>

            <div className="news-card divide-y divide-paper/5 animate-slide-up" data-delay="4">
              {contests.length === 0 ? (
                <p className="p-6 text-center text-paper/30 font-mono text-sm">No contests yet.</p>
              ) : contests.map(c => {
                const now = Date.now()
                const start = new Date(c.start_time).getTime()
                const end = new Date(c.end_time).getTime()
                const status = now < start ? 'UPCOMING' : now < end ? 'LIVE' : 'ENDED'
                const statusCls = status === 'LIVE' ? 'text-green-400' : status === 'UPCOMING' ? 'text-yellow-400' : 'text-paper/30'
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-headline text-paper">{c.name}</p>
                      <p className="text-xs text-paper/30 font-mono">
                        {new Date(c.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${statusCls}`}>{status}</span>
                      <Link href={`/contests/${c.id}`} className="text-xs text-gun-red font-mono hover:underline">
                        View →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
