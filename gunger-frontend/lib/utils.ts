import { clsx, type ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]) => clsx(inputs)

export const difficultyColor = (d: string) => ({
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-gun-red',
})[d] || 'text-paper'

export const statusColor = (s: string) => ({
  accepted: 'text-green-400',
  wrong_answer: 'text-gun-red',
  runtime_error: 'text-orange-400',
  time_limit_exceeded: 'text-yellow-400',
  compile_error: 'text-red-300',
  pending: 'text-paper/50',
})[s] || 'text-paper/50'

export const statusLabel = (s: string) => ({
  accepted: 'ACCEPTED',
  wrong_answer: 'WRONG ANSWER',
  runtime_error: 'RUNTIME ERROR',
  time_limit_exceeded: 'TIME LIMIT',
  compile_error: 'COMPILE ERROR',
  pending: 'PENDING',
})[s] || s.toUpperCase()

export const xpToLevel = (xp: number) => Math.floor(Math.sqrt(xp / 10)) + 1

export const xpForNextLevel = (xp: number) => {
  const level = xpToLevel(xp)
  return level * level * 10
}

export const formatRelative = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
