'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { questionApi, submissionApi } from '@/lib/api'
import { difficultyColor, statusColor, statusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2, Lightbulb, Send, ChevronDown, ChevronUp, Terminal } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANG_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  php: 'php',
  rust: 'rust',
  sql: 'sql',
  java: 'java',
  cpp: 'cpp',
}

const STARTERS: Record<string, string> = {
  javascript: `// Read from stdin:\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n')\nconst [a, b] = lines[0].split(' ').map(Number)\nconsole.log(a + b)`,
  python: `# Read from stdin:\nimport sys\ndata = sys.stdin.read().split()\na, b = int(data[0]), int(data[1])\nprint(a + b)`,
  php: `<?php\n$line = trim(fgets(STDIN));\n[$a, $b] = explode(' ', $line);\necho (int)$a + (int)$b;\n?>`,
  rust: `use std::io::{self, BufRead};\nfn main() {\n    let stdin = io::stdin();\n    let line = stdin.lock().lines().next().unwrap().unwrap();\n    let nums: Vec<i64> = line.trim().split(' ').map(|x| x.parse().unwrap()).collect();\n    println!("{}", nums[0] + nums[1]);\n}`,
  sql: `-- Write your SQL query here\nSELECT * FROM table_name;`,
  java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}`,
}

interface TestResult {
  test_case_id: string
  passed: boolean
  status: string
  input?: string
  expected_output?: string
  actual_output?: string
  stderr?: string
  is_hidden: boolean
}

interface Question {
  id: string
  title: string
  description: string
  difficulty: string
  allowed_languages: string[]
  xp_reward: number
  test_cases: { id: string; input: string; expected_output: string; is_hidden: boolean }[]
}

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, updateXP } = useAuthStore()
  const router = useRouter()

  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState(STARTERS.javascript)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ all_passed: boolean; test_results: TestResult[]; xp_earned: number; ai_feedback: string | null } | null>(null)
  const [hinting, setHinting] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [showDesc, setShowDesc] = useState(true)

  useEffect(() => {
    if (user === null) { router.push('/login'); return }
    load()
  }, [user])

  const load = async () => {
    try {
      const { data } = await questionApi.get(id)
      setQuestion(data)
      if (data.allowed_languages?.[0]) {
        setLang(data.allowed_languages[0])
        setCode(STARTERS[data.allowed_languages[0]] || '// Write your solution here')
      }
    } catch { 
      toast.error('Problem not found'); 
      router.push('/problems') 
    } finally { 
      setLoading(false) 
    }
  }

  const changeLang = (l: string) => {
    setLang(l)
    setCode(STARTERS[l] || '// Write your solution here')
    setResult(null)
  }

  const submit = async () => {
    if (!code.trim()) return toast.error('Write some code first!')
    setSubmitting(true)
    setResult(null)
    setHint(null)
    try {
      const { data } = await submissionApi.submit({ question_id: id, code, language: lang })
      setResult(data)
      if (data.all_passed) {
        toast.success(`✅ All tests passed! +${data.xp_earned} XP`)
        if (data.xp_earned > 0 && user) updateXP(user.xp + data.xp_earned)
      } else {
        const failed = data.test_results.filter((t: TestResult) => !t.passed).length
        toast.error(`${failed} test case${failed > 1 ? 's' : ''} failed`)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Submission failed')
    } finally { setSubmitting(false) }
  }

  const getHint = async () => {
    setHinting(true)
    try {
      const { data } = await questionApi.hint(id, { code, language: lang })
      setHint(data.hint)
    } catch { toast.error('Hint unavailable') }
    finally { setHinting(false) }
  }

  if (loading || !question) return (
    <div className="min-h-screen bg-ink flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-gun-red" size={40} />
      </div>
    </div>
  )

  const passed = result?.test_results.filter(t => t.passed).length || 0
  const total = result?.test_results.length || 0

  return (
    <div className="min-h-screen bg-ink flex flex-col mt-24">
       
      <Navbar/>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

          {/* ── Left Column: Information ─────────────────── */}
          <div className="space-y-6 overflow-y-auto lg:max-h-[calc(100vh-140px)] pr-0 lg:pr-2 scrollbar-hide">
            
            {/* Problem Card */}
            <div className="news-card p-6 bg-zinc-900/40 border border-paper/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gun-red opacity-50" />
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-headline font-black text-2xl md:text-3xl text-paper leading-tight tracking-tighter uppercase italic">
                    {question.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${difficultyColor(question.difficulty)} uppercase tracking-widest`}>
                      {question.difficulty}
                    </span>
                    <span className="text-[10px] text-gun-red font-mono font-bold tracking-widest">
                      // +{question.xp_reward} XP
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDesc(v => !v)}
                  className="flex items-center gap-2 text-[10px] text-paper/40 font-mono hover:text-paper transition-colors uppercase tracking-widest border border-paper/10 px-3 py-1 rounded-full"
                >
                  {showDesc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showDesc ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {showDesc && (
                <div className="text-sm md:text-base text-paper/70 leading-relaxed whitespace-pre-wrap font-light animate-in fade-in slide-in-from-top-2">
                  {question.description}
                </div>
              )}
            </div>

            {/* Samples */}
            {question.test_cases.filter(tc => !tc.is_hidden).length > 0 && (
              <div className="bg-zinc-900/20 border border-paper/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal size={14} className="text-paper/40" />
                  <h3 className="text-[10px] font-mono text-paper/40 uppercase tracking-[0.2em]">Sample Vectors</h3>
                </div>
                <div className="space-y-4">
                  {question.test_cases.filter(tc => !tc.is_hidden).map((tc, i) => (
                    <div key={tc.id} className="font-mono text-xs group">
                      <div className="text-paper/20 mb-2 uppercase tracking-widest text-[9px]">Case 0{i + 1}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-ink/50 p-3 border border-paper/5 rounded-lg group-hover:border-paper/10 transition-colors">
                          <div className="text-[9px] text-paper/20 mb-1 uppercase">Input</div>
                          <code className="text-paper break-all">{tc.input}</code>
                        </div>
                        <div className="bg-ink/50 p-3 border border-paper/5 rounded-lg group-hover:border-paper/10 transition-colors">
                          <div className="text-[9px] text-paper/20 mb-1 uppercase">Output</div>
                          <code className="text-emerald-500 break-all">{tc.expected_output}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Output */}
            {result && (
              <div className={`news-card p-6 border-2 ${result.all_passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-gun-red/20 bg-gun-red/5'} rounded-2xl animate-in slide-in-from-bottom-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-headline font-black text-xl italic uppercase ${result.all_passed ? 'text-emerald-500' : 'text-gun-red'}`}>
                    {result.all_passed ? 'Accepted' : 'System Failure'}
                  </h3>
                  <span className="text-xs font-mono text-paper/40 font-bold tracking-widest">{passed}/{total} Passed</span>
                </div>

                <div className="h-1 w-full bg-white/5 rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${total > 0 ? (passed / total) * 100 : 0}%`,
                      background: result.all_passed ? '#10b981' : '#ef4444'
                    }}
                  />
                </div>

                <div className="space-y-3">
                  {result.test_results.map((t, i) => (
                    <div key={t.test_case_id} className="text-[11px] font-mono flex flex-col gap-1 p-2 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <span className={t.passed ? 'text-emerald-500' : 'text-gun-red'}>
                          {t.passed ? '●' : '○'}
                        </span>
                        <span className="text-paper/60 uppercase tracking-tighter">
                          {t.is_hidden ? `HIDDEN_VECTOR_0${i + 1}` : `TEST_VECTOR_0${i + 1}`}
                        </span>
                        <span className={`ml-auto font-bold uppercase tracking-widest ${statusColor(t.status)}`}>
                          {statusLabel(t.status)}
                        </span>
                      </div>
                      {!t.passed && !t.is_hidden && (
                        <div className="mt-2 pl-6 py-2 border-l border-gun-red/20 space-y-1 text-paper/40">
                          <div className="flex justify-between"><span>Input:</span> <span className="text-paper/60">{t.input}</span></div>
                          <div className="flex justify-between"><span>Expect:</span> <span className="text-emerald-500">{t.expected_output}</span></div>
                          <div className="flex justify-between"><span>Actual:</span> <span className="text-gun-red">{t.actual_output || 'null'}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {result.ai_feedback && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-paper/40 uppercase tracking-widest">AI Diagnostics</span>
                    </div>
                    <p className="text-sm text-paper/70 font-light italic leading-relaxed">{result.ai_feedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Hint Section */}
            {hint && (
              <div className="news-card p-6 border-2 border-yellow-500/20 bg-yellow-500/5 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-2 mb-3 text-yellow-500">
                  <Lightbulb size={16} />
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Encrypted Hint Decoded</span>
                </div>
                <p className="text-sm text-paper/70 italic font-light">{hint}</p>
              </div>
            )}
          </div>

          {/* ── Right Column: IDE ─────────────────── */}
          <div className="flex flex-col gap-4 h-full min-h-[500px] lg:min-h-0">
            
            {/* IDE Header/Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-zinc-900/30 border border-paper/10 rounded-xl">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide p-1">
                {question.allowed_languages.map(l => (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all rounded-lg ${
                      lang === l
                        ? 'bg-paper text-ink font-bold shadow-lg shadow-white/5'
                        : 'text-paper/40 hover:text-paper hover:bg-white/5'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 p-1">
                <button
                  onClick={getHint}
                  disabled={hinting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-mono font-bold border border-yellow-500/20 text-yellow-500/60 hover:bg-yellow-500/10 transition-all rounded-lg disabled:opacity-30 uppercase tracking-widest"
                >
                  {hinting ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={12} />}
                  Hint
                </button>

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 text-[10px] font-mono font-black bg-gun-red text-white hover:bg-red-500 transition-all rounded-lg disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-gun-red/10"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? 'Running' : 'Deploy'}
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="relative flex-1 bg-[#1e1e1e] rounded-2xl overflow-hidden border border-paper/10 min-h-[400px] lg:min-h-0">
              <MonacoEditor
                height="100%"
                language={LANG_MAP[lang] || 'plaintext'}
                value={code}
                onChange={(v) => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  padding: { top: 20 },
                  wordWrap: 'on',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  contextmenu: false,
                }}
              />
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[9px] font-mono text-paper/20 uppercase tracking-[0.2em]">Environment: Stable</span>
              </div>
              <p className="text-[9px] text-paper/20 font-mono uppercase tracking-[0.2em]">
                Gunger v2.1 // Secure Cloud Execute
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}