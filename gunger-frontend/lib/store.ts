import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  xp: number
  avatar_url?: string
  created_at: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  updateXP: (xp: number) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('gunger_token', token)
          localStorage.setItem('gunger_user', JSON.stringify(user))
        }
        set({ user, token })
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gunger_token')
          localStorage.removeItem('gunger_user')
        }
        set({ user: null, token: null })
      },
      updateXP: (xp) => set((s) => ({ user: s.user ? { ...s.user, xp } : null })),
    }),
    {
      name: 'gunger-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
)
