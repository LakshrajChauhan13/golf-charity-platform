import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Target,
  Heart,
  Trophy,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { Avatar } from '@/components/ui/Avatar'

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/scores', icon: Target, label: 'My Scores' },
  { to: '/dashboard/charity', icon: Heart, label: 'My Charity' },
  { to: '/dashboard/draw', icon: Trophy, label: 'Draw & Prizes' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const adminLinks = [
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
]

const linkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-slate-400 hover:text-white hover:bg-white/5'
const activeLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 bg-emerald-500/15 text-emerald-400'
const adminActiveLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 bg-indigo-500/15 text-indigo-400'

export function Sidebar() {
  const navigate = useNavigate()
  const profile = useAppSelector((s) => s.auth.profile)
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  const sidebarContent = (
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-white/8 bg-[#0d1424] z-50">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">GG</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">GolfGives</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {userLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === '/dashboard' }}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
            onClick={() => setOpen(false)}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {profile?.is_admin && (
          <>
            <div className="px-3 pt-4 pb-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Admin</p>
            </div>
            {adminLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={linkClass}
                activeProps={{ className: adminActiveLinkClass }}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <Avatar name={profile?.full_name ?? null} avatarUrl={profile?.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.subscription_status}</p>
          </div>
          <button onClick={handleSignOut} className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0d1424] border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">GG</span>
          </div>
          <span className="font-bold text-white">GolfGives</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-slate-400 hover:text-white">
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop sidebar - always visible */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:block"
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile sidebar - overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
