'use client'
import { useEffect, useState } from 'react'
import { statusCheck, wakeServer } from '@/lib/api'

interface StatusComponent {
  name: string
  status: string
  indicator: string
}

interface Status {
  overall_status: string
  indicator: string
  components: StatusComponent[]
  last_checked: string
}

export default function StatusBanner() {
  const [status, setStatus] = useState<Status | null>(null)
  const [waking, setWaking] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const wake = async () => {
      setWaking(true)
      await wakeServer()
      setWaking(false)
    }
    wake()

    const check = async () => {
      try {
        const data = await statusCheck()
        setStatus(data)
      } catch {
        setStatus({
          overall_status: 'outage',
          indicator: '🔴',
          components: [],
          last_checked: new Date().toISOString(),
        })
      }
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!status && !waking) return null

  const dotClass = {
    operational: 'status-operational',
    degraded: 'status-degraded',
    outage: 'status-outage',
  }[status?.overall_status || 'outage'] || 'status-outage'

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-paper/50 hover:text-paper transition-colors border-b border-paper/5 w-full"
      >
        {waking ? (
          <>
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse inline-block" />
            <span className="font-mono">Waking server...</span>
          </>
        ) : (
          <>
            <span className={`status-dot ${dotClass}`} />
            <span className="font-mono">
              {status?.indicator} Server {status?.overall_status}
            </span>
          </>
        )}
        <span className="ml-auto">▾</span>
      </button>

      {expanded && status && (
        <div className="absolute top-full left-0 right-0 bg-ink-soft border border-paper/10 p-3 z-40 shadow-2xl">
          <p className="text-xs text-paper/40 font-mono mb-2">
            SYSTEM STATUS — {new Date(status.last_checked).toLocaleTimeString()}
          </p>
          <div className="space-y-1.5">
            {status.components.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="text-paper/70">{c.name}</span>
                <span className={`font-mono ${c.status === 'operational' ? 'text-green-400' : 'text-gun-red'}`}>
                  {c.indicator} {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
