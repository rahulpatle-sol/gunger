import Link from 'next/link'
import type { Metadata } from 'next'
import StatusBanner from '@/components/shared/StatusBanner'

export const metadata: Metadata = {
  title: 'GUNGER — Code. Test. Dominate.',
}

const date = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StatusBanner />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

        {/* ── Masthead ─────────────────────────── */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-paper/40 font-mono mb-3 border-b border-paper/10 pb-3">
            <span>VOL. I, No. 1</span>
            <span>{date}</span>
            <span>PRICE: FREE (FOR NOW)</span>
          </div>

          <div className="masthead-border py-4 mb-4">
            <div className="flex items-center justify-center gap-4 mb-1">
              <div className="h-px flex-1 bg-paper/30" />
              <span className="text-3xl">🔫</span>
              <div className="h-px flex-1 bg-paper/30" />
            </div>
            <h1 className="font-headline font-black text-7xl md:text-9xl text-paper tracking-[0.08em] leading-none animate-flicker">
              GUNGER
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="h-px flex-1 bg-paper/30" />
              <p className="text-sm font-mono text-paper/50 tracking-[0.3em] uppercase">
                The Underground Coding Daily
              </p>
              <div className="h-px flex-1 bg-paper/30" />
            </div>
          </div>

          {/* Red deck */}
          <div className="inline-block bg-gun-red px-6 py-2 mb-6">
            <p className="font-headline italic text-paper text-lg">
              "Where juniors become coders — one test case at a time"
            </p>
          </div>
        </div>

        {/* ── 3-Column layout ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-paper/15">

          {/* Column 1 */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-paper/15 animate-slide-up" data-delay="1">
            <div className="stamp mb-4 text-xs">Breaking News</div>
            <h2 className="font-headline font-bold text-2xl text-paper mb-3 leading-tight">
              Junior Devs Finally Get Platform That Doesn&apos;t Lie About Test Cases
            </h2>
            <p className="text-sm text-paper/60 leading-relaxed mb-4">
              Hidden test cases expose what tutorials never show. Submit your code,
              face the truth, earn XP, and climb the leaderboard — or go home.
            </p>
            <div className="border-t border-paper/10 pt-4">
              <h3 className="font-headline font-bold text-sm text-paper/80 mb-2 uppercase tracking-wide">
                Today&apos;s Headlines
              </h3>
              {['Off-by-one error kills 3rd submission', 'Student hits 50 XP milestone', 'Teacher creates SQL injection question'].map((h) => (
                <div key={h} className="flex gap-2 items-start py-1.5 border-b border-paper/5">
                  <span className="text-gun-red text-xs mt-0.5">▪</span>
                  <span className="text-xs text-paper/50">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 — Main CTA */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-paper/15 text-center animate-slide-up" data-delay="2">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="font-headline font-black text-3xl text-paper mb-4 leading-tight">
              ENTER THE ARENA
            </h2>
            <p className="text-sm text-paper/50 mb-6 font-mono">
              Choose your weapon. The code editor awaits.
            </p>

            <div className="space-y-3">
              <Link
                href="/register"
                className="block w-full bg-gun-red text-paper py-3 font-headline font-bold text-lg hover:bg-gun-red-dark transition-colors border-2 border-gun-red hover:border-gun-red-dark"
              >
                🔫 ENLIST NOW — FREE
              </Link>
              <Link
                href="/login"
                className="block w-full border border-paper/30 text-paper py-3 font-headline font-bold hover:bg-paper/5 transition-colors"
              >
                Already Enlisted? Login
              </Link>
            </div>

            <div className="mt-6 border-t border-paper/10 pt-4 grid grid-cols-2 gap-4 text-center">
              {[
                { v: '6', l: 'Languages' },
                { v: 'AI', l: 'Feedback' },
                { v: 'XP', l: 'System' },
                { v: '🔒', l: 'Hidden Tests' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="font-headline font-black text-2xl text-gun-red">{v}</div>
                  <div className="text-xs text-paper/40 font-mono">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3 */}
          <div className="p-6 animate-slide-up" data-delay="3">
            <h2 className="font-headline font-bold text-xl text-paper mb-4 border-b border-paper/15 pb-2">
              Platform Dispatch
            </h2>
            <div className="space-y-4">
              {[
                {
                  icon: '🏫',
                  title: 'Classroom Warfare',
                  desc: 'Teachers create invite-only batches. Students join with a code. Real classroom, real grades.',
                },
                {
                  icon: '⚡',
                  title: 'Live Judge Execution',
                  desc: 'Code runs on Judge0 sandbox. JS, Python, PHP, Rust, SQL — all supported.',
                },
                {
                  icon: '🤖',
                  title: 'AI Interrogation',
                  desc: 'Failed a test? AI tells you exactly why without giving the answer. Mentor, not spoiler.',
                },
                {
                  icon: '🏆',
                  title: 'Contest Mode',
                  desc: 'Timed contests with leaderboards. Teacher sets questions, marks, duration.',
                },
                {
                  icon: '📊',
                  title: 'Export Intelligence',
                  desc: 'Teachers export class performance to Excel or PDF. HOD loves spreadsheets.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-headline font-bold text-paper">{title}</p>
                    <p className="text-xs text-paper/45 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Language ticker ──────────────────── */}
        <div className="mt-6 border border-paper/10 p-4 bg-paper/2">
          <p className="text-xs text-paper/30 font-mono text-center mb-3 uppercase tracking-widest">
            Supported Languages
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'JavaScript', emoji: '🟨' },
              { name: 'Python', emoji: '🐍' },
              { name: 'PHP', emoji: '🐘' },
              { name: 'Rust', emoji: '🦀' },
              { name: 'SQL', emoji: '🗄️' },
              { name: 'Java', emoji: '☕' },
              { name: 'C++', emoji: '⚙️' },
            ].map(({ name, emoji }) => (
              <div key={name} className="flex items-center gap-2 text-sm text-paper/60 font-mono">
                <span>{emoji}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer rule */}
        <div className="mt-8 border-t-4 border-double border-paper/20 pt-4 text-center">
          <p className="text-xs text-paper/20 font-mono">
            GUNGER PRESS © 2025 — ALL SUBMISSIONS LOGGED — NO CHEATING, ONLY LEARNING
          </p>
        </div>

      </main>
    </div>
  )
}
