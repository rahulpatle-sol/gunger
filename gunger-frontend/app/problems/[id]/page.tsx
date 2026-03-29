'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/shared/Navbar'
import { useAuthStore } from '@/lib/store'
import { questionApi, submissionApi } from '@/lib/api'
import { difficultyColor, statusColor, statusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader2, Lightbulb, Send, ChevronDown, ChevronUp } from 'lucide-react'

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
    if (!user) { router.push('/login'); return }
    load()
  }, [user])

  const load = async () => {
    try {
      const { data } = await questionApi.get(id)
      setQuestion(data)
      if (data.allowed_languages[0]) {
        setLang(data.allowed_languages[0])
        setCode(STARTERS[data.allowed_languages[0]] || '// Write your solution here')
      }
    } catch { toast.error('Problem not found'); router.push('/problems') }
    finally { setLoading(false) }
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
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Submission failed')
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
    <><Navbar /><div className="flex justify-center py-24"><Loader2 className="animate-spin text-paper/40" size={32} /></div></>
  )

  const passed = result?.test_results.filter(t => t.passed).length || 0
  const total = result?.test_results.length || 0

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Problem ─────────────────── */}
          <div className="space-y-4">

            {/* Problem header */}
            <div className="news-card p-5 animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="font-headline font-black text-2xl text-paper leading-tight">{question.title}</h1>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-mono uppercase ${difficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="text-xs text-gun-red font-mono">+{question.xp_reward} XP</span>
                </div>
              </div>

              <button
                onClick={() => setShowDesc(v => !v)}
                className="flex items-center gap-2 text-xs text-paper/40 font-mono hover:text-paper transition-colors"
              >
                {showDesc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showDesc ? 'Hide' : 'Show'} description
              </button>

              {showDesc && (
                <div className="mt-4 text-sm text-paper/70 leading-relaxed whitespace-pre-wrap border-t border-paper/10 pt-4">
                  {question.description}
                </div>
              )}
            </div>

            {/* Sample test cases */}
            {question.test_cases.filter(tc => !tc.is_hidden).length > 0 && (
              <div className="news-card p-4">
                <h3 className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-3">Sample Test Cases</h3>
                <div className="space-y-3">
                  {question.test_cases.filter(tc => !tc.is_hidden).map((tc, i) => (
                    <div key={tc.id} className="font-mono text-xs">
                      <div className="text-paper/30 mb-1">Case {i + 1}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-ink p-2 border border-paper/10">
                          <div className="text-paper/30 mb-1">Input</div>
                          <div className="text-paper">{tc.input}</div>
                        </div>
                        <div className="bg-ink p-2 border border-paper/10">
                          <div className="text-paper/30 mb-1">Expected</div>
                          <div className="text-green-400">{tc.expected_output}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className={`news-card p-4 border ${result.all_passed ? 'border-green-400/30' : 'border-gun-red/30'} animate-slide-up`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline font-bold text-paper">
                    {result.all_passed ? '✅ Accepted' : '❌ Wrong Answer'}
                  </h3>
                  <span className="text-xs font-mono text-paper/40">{passed}/{total} passed</span>
                </div>

                {/* Progress bar */}
                <div className="xp-bar mb-4">
                  <div
                    className="xp-fill"
                    style={{
                      width: `${total > 0 ? (passed / total) * 100 : 0}%`,
                      background: result.all_passed ? '#22c55e' : '#C41E3A'
                    }}
                  />
                </div>

                {/* Test results */}
                <div className="space-y-2 mb-4">
                  {result.test_results.map((t, i) => (
                    <div key={t.test_case_id} className="text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className={t.passed ? 'text-green-400' : 'text-gun-red'}>{t.passed ? '✓' : '✗'}</span>
                        <span className="text-paper/50">
                          {t.is_hidden ? `Hidden Test ${i + 1}` : `Test ${i + 1}`}
                        </span>
                        <span className={`ml-auto ${statusColor(t.status)}`}>{statusLabel(t.status)}</span>
                      </div>
                      {!t.passed && !t.is_hidden && t.input && (
                        <div className="ml-4 mt-1 space-y-1 text-paper/40">
                          <div>Input: <span className="text-paper/60">{t.input}</span></div>
                          <div>Expected: <span className="text-green-400">{t.expected_output}</span></div>
                          <div>Got: <span className="text-gun-red">{t.actual_output || 'no output'}</span></div>
                        </div>
                      )}
                      {t.stderr && !t.passed && (
                        <div className="ml-4 mt-1 text-orange-400 truncate">{t.stderr}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Feedback */}
                {result.ai_feedback && (
                  <div className="border-t border-paper/10 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-paper/40 uppercase tracking-wider">🤖 AI Analysis</span>
                    </div>
                    <p className="text-sm text-paper/70 leading-relaxed italic">{result.ai_feedback}</p>
                  </div>
                )}

                {result.xp_earned > 0 && (
                  <div className="mt-3 text-center">
                    <span className="stamp text-sm">+{result.xp_earned} XP EARNED</span>
                  </div>
                )}
              </div>
            )}

            {/* Hint */}
            {hint && (
              <div className="news-card p-4 border border-gun-brass/30 animate-slide-up">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-yellow-400" />
                  <span className="text-xs font-mono text-paper/40 uppercase">AI Hint</span>
                </div>
                <p className="text-sm text-paper/70 italic">{hint}</p>
              </div>
            )}
          </div>

          {/* ── Right: Editor ─────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Lang selector + actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {question.allowed_languages.map(l => (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                      lang === l
                        ? 'bg-paper text-ink font-bold'
                        : 'border border-paper/20 text-paper/50 hover:text-paper'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={getHint}
                  disabled={hinting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-yellow-400/30 text-yellow-400/70 hover:text-yellow-400 hover:border-yellow-400/60 transition-colors disabled:opacity-50"
                >
                  {hinting ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={12} />}
                  Hint
                </button>

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-mono bg-gun-red text-paper hover:bg-gun-red-dark transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? 'Running...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="code-editor-wrap flex-1 min-h-[500px]">
              <MonacoEditor
                height="500px"
                language={LANG_MAP[lang] || 'plaintext'}
                value={code}
                onChange={(v) => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'gutter',
                  padding: { top: 12 },
                  wordWrap: 'on',
                }}
              />
            </div>

            <p className="text-xs text-paper/20 font-mono text-right">
              Hidden test cases will run on submit · AI feedback auto-generated
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
