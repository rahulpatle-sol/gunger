'use client'

interface Day { date: string; count: number }

interface Props {
  grid: Day[]
  streak: number
  total: number
}

export default function ActivityGrid({ grid, streak, total }: Props) {
  const getLevel = (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 6) return 3
    return 4
  }

  // Group into weeks
  const weeks: Day[][] = []
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7))
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const month = new Date(week[0]?.date).getMonth()
    if (month !== lastMonth) {
      monthLabels.push({ label: months[month], col: wi })
      lastMonth = month
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-paper/40 font-mono uppercase tracking-wider">
          Submission Activity
        </span>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-paper/40">{total} total</span>
          <span className="text-gun-red">🔥 {streak} day streak</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex gap-1 mb-1" style={{ paddingLeft: '0' }}>
        {monthLabels.map(({ label, col }) => (
          <div
            key={`${label}-${col}`}
            className="text-paper/30 text-xs font-mono"
            style={{ marginLeft: col === 0 ? 0 : `${(col - (monthLabels[monthLabels.indexOf(monthLabels.find(m => m.col === col)!)] ? monthLabels[monthLabels.indexOf(monthLabels.find(m => m.col === col)!) - 1]?.col || 0 : 0)) * 14}px` }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`activity-cell activity-${getLevel(day.count)}`}
                title={`${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-xs text-paper/30 font-mono">Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} className={`activity-cell activity-${l}`} />
        ))}
        <span className="text-xs text-paper/30 font-mono">More</span>
      </div>
    </div>
  )
}
