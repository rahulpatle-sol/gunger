'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { 
  LogOut, Trophy, BookOpen, Swords, 
  LayoutDashboard, Terminal, Menu, X, 
  Settings, Bell, Zap 
} from 'lucide-react'

export default function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const path = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track scroll for background blur effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logout = () => {
    clearAuth()
    router.push('/login')
  }

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const links = [
    { href: isTeacher ? '/teacher' : '/dashboard', label: 'Terminal', icon: LayoutDashboard },
    { href: '/problems', label: 'Tasks', icon: BookOpen },
    { href: '/contests', label: 'Arenas', icon: Swords },
    { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  ]

  return (
    <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
      scrolled ? 'py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative flex items-center justify-between transition-all duration-500 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl px-4 md:px-6 h-16 ${
          scrolled ? 'shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : ''
        }`}>
          
          {/* ── Brand Logo ── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-red-500/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Terminal className="w-6 h-6 text-red-500 relative" />
            </div>
            <span className="font-black text-xl tracking-[0.2em] text-white hidden sm:block">
              GUNGER<span className="text-red-600">.</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          {user && (
            <div className="hidden md:flex items-center bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 gap-1">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = path === href || path.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-widest uppercase transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-red-500' : ''} />
                    <span>{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-zinc-800/80 rounded-lg -z-10 border border-zinc-700/50 shadow-inner"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* ── User Actions ── */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <div className="hidden lg:flex flex-col items-end pr-4 border-r border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">System ID</span>
                  <span className="text-sm font-bold text-zinc-100">{user.username}</span>
                </div>

                <div className="flex items-center bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-full gap-2 group">
                  <Zap className="w-3 h-3 text-red-500 group-hover:animate-pulse" />
                  <span className="text-[11px] font-bold font-mono text-white tracking-wider">
                    {user.xp || 0} <span className="text-zinc-500">XP</span>
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                  title="Shutdown Session"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
                  LOGIN
                </Link>
                <Link 
                  href="/register" 
                  className="bg-red-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-red-500 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                >
                  ENLIST
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-zinc-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full inset-x-6 mt-2 z-50"
          >
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-2 gap-2">
                {links.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      path === href 
                        ? 'bg-zinc-900 border-red-500/50 text-white' 
                        : 'bg-zinc-900/30 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Icon size={18} className={path === href ? 'text-red-500' : ''} />
                    <span className="text-[10px] font-mono tracking-widest uppercase">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}