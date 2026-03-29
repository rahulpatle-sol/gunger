'use client'
import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, Activity, Info } from 'lucide-react'

interface Day { date: string; count: number }

interface Props {
  grid: Day[]
  streak: number
  total: number
}

export default function ActivityGrid({ grid, streak, total }: Props) {
  // Logic: Determine intensity levels for the heat map
  const getLevel = (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 6) return 3
    return 4
  }

  // Memoize grid processing so it doesn't re-run on every render
  const processedData = useMemo(() => {
    const weeks: Day[][] = []
    for (let i = 0; i < grid.length; i += 7) {
      weeks.push(grid.slice(i, i + 7))
    }

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    
    weeks.forEach((week, wi) => {
      const date = new Date(week[0]?.date)
      const month = date.getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ label: months[month], col: wi })
        lastMonth = month
      }
    })

    return { weeks, monthLabels }
  }, [grid])

  // Framer Motion Variants
  const containerVars = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.005, delayChildren: 0.2 } 
    }
  }

  const cellVars = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
  }

  return (
    <div className="w-full bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
            <Activity className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Neural Submission Feed</h3>
            <p className="text-sm text-zinc-300 font-semibold">{total} Global Transmissions</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-zinc-600 uppercase">Current Streak</span>
            <div className="flex items-center gap-2 text-red-500">
              <Flame className="w-4 h-4 fill-red-500/20" />
              <span className="font-bold tabular-nums">{streak} DAYS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative">
        {/* Month Labels */}
        <div className="flex text-[10px] font-mono text-zinc-600 mb-2 select-none h-4">
          {processedData.monthLabels.map((m, i) => (
            <div 
              key={i} 
              className="absolute transition-colors hover:text-zinc-400"
              style={{ left: `${m.col * 14}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {/* The Actual Grid */}
        <motion.div 
          variants={containerVars}
          initial="initial"
          animate="animate"
          className="flex gap-[3px] overflow-x-auto pb-4 no-scrollbar cursor-crosshair"
        >
          {processedData.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] shrink-0">
              {week.map((day, di) => {
                const level = getLevel(day.count)
                return (
                  <motion.div
                    key={`${wi}-${di}`}
                    variants={cellVars}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    title={`${day.date}: ${day.count} tasks`}
                    className={`
                      w-[11px] h-[11px] rounded-[2px] transition-colors duration-300
                      ${level === 0 && 'bg-zinc-900 hover:bg-zinc-800'}
                      ${level === 1 && 'bg-red-950/40 border border-red-900/20'}
                      ${level === 2 && 'bg-red-900/60 shadow-[0_0_8px_rgba(153,27,27,0.2)]'}
                      ${level === 3 && 'bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.3)]'}
                      ${level === 4 && 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}
                    `}
                  />
                )
              })}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer / Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 pt-4 border-t border-zinc-900/50">
        <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono italic">
          <Info className="w-3 h-3" />
          <span>Real-time data synchronization enabled</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">Latency</span>
          <div className="flex gap-[3px]">
            {[0, 1, 2, 3, 4].map(l => (
              <div 
                key={l} 
                className={`w-[10px] h-[10px] rounded-[2px] 
                  ${l === 0 && 'bg-zinc-900'}
                  ${l === 1 && 'bg-red-950/40'}
                  ${l === 2 && 'bg-red-900/60'}
                  ${l === 3 && 'bg-red-700'}
                  ${l === 4 && 'bg-red-500'}
                `} 
              />
            ))}
          </div>
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">High Load</span>
        </div>
      </div>

      {/* CSS for hiding scrollbar but keeping functionality */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}