'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { LogOut, Trophy, BookOpen, Swords, LayoutDashboard, GraduationCap } from 'lucide-react'

export default function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const path = usePathname()

  const logout = () => { clearAuth(); router.push('/login') }

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const links = [
    { href: isTeacher ? '/teacher' : '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/problems', label: 'Problems', icon: BookOpen },
    { href: '/contests', label: 'Contests', icon: Swords },
    { href: '/leaderboard', label: 'Board', icon: Trophy },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-paper/10 bg-ink/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl" aria-label="gun">🔫</span>
          <span className="font-headline font-black text-xl text-paper tracking-widest group-hover:text-gun-red transition-colors">
            GUNGER
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors
                  ${path === href || path.startsWith(href + '/')
                    ? 'text-paper border-b-2 border-gun-red'
                    : 'text-paper/50 hover:text-paper'
                  }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* User */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm text-paper font-headline">{user.username}</span>
              <span className="text-xs text-gun-red font-mono">{user.xp} XP</span>
            </div>
            {isTeacher && (
              <span className="hidden sm:block text-xs border border-gun-red/50 text-gun-red px-2 py-0.5 uppercase tracking-wider">
                {user.role}
              </span>
            )}
            <button
              onClick={logout}
              className="p-2 text-paper/40 hover:text-gun-red transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="text-sm text-paper/60 hover:text-paper px-3 py-1.5 transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-sm bg-gun-red text-paper px-3 py-1.5 hover:bg-gun-red-dark transition-colors">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile nav */}
      {user && (
        <div className="md:hidden flex border-t border-paper/5">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors
                ${path === href ? 'text-paper' : 'text-paper/40'}`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
