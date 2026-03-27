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
import { LogoutModal } from '@/components/ui/LogoutModal'
import { GolfGivesLogo } from '@/components/ui/GolfGivesLogo'

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

const linkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60'
const activeLinkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 bg-zinc-800 text-zinc-100'
const adminActiveLinkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 bg-zinc-800 text-zinc-100'

export function Sidebar() {
  const navigate = useNavigate()
  const profile = useAppSelector((s) => s.auth.profile)
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  const sidebarContent = (
    <div className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-zinc-800/80 bg-[#0c0c0e] z-50">
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <GolfGivesLogo size={28} />
          <span className="font-semibold text-zinc-50 text-sm tracking-tight">GolfGives</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-zinc-600 hover:text-zinc-100">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!profile?.is_admin && userLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === '/dashboard' }}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
            onClick={() => setOpen(false)}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}

        {profile?.is_admin && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">Admin</p>
            </div>
            {adminLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={linkClass}
                activeProps={{ className: adminActiveLinkClass }}
                onClick={() => setOpen(false)}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-2 border-t border-zinc-800/80">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-zinc-800/60 cursor-pointer transition-colors">
          <Avatar name={profile?.full_name ?? null} avatarUrl={profile?.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-[10px] text-zinc-600 capitalize">{profile?.subscription_status}</p>
          </div>
          <button onClick={() => setLogoutOpen(true)} className="text-zinc-600 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0c0c0e] border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <GolfGivesLogo size={26} />
          <span className="font-semibold text-zinc-50 text-sm">GolfGives</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-zinc-500 hover:text-zinc-100">
          <Menu size={20} />
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

      <LogoutModal
        open={logoutOpen}
        onConfirm={handleSignOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  )
}
