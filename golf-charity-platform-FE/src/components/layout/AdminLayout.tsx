import { useState } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Heart, CheckSquare, LayoutDashboard, LogOut, Users, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { Avatar } from '@/components/ui/Avatar'
import { LogoutModal } from '@/components/ui/LogoutModal'

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/draws', icon: Trophy, label: 'Draw Control' },
  { to: '/admin/charities', icon: Heart, label: 'Charity CMS' },
  { to: '/admin/winners', icon: CheckSquare, label: 'Verification' },
]

const linkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60'
const activeLinkClass = 'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 bg-zinc-800 text-zinc-100'

export function AdminLayout() {
  const navigate = useNavigate()
  const profile = useAppSelector((s) => s.auth.profile)
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  const sidebarContent = (
    <div className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r border-zinc-800/80 bg-[#0c0c0e] z-50">
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-300 text-[10px] font-semibold">A</span>
          </div>
          <span className="font-semibold text-zinc-50 text-sm">Admin</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-zinc-600 hover:text-zinc-100">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {adminLinks.map(({ to, icon: Icon, label, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: !!exact }}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
            onClick={() => setOpen(false)}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-zinc-800/80">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-zinc-800/60 transition-colors">
          <Avatar name={profile?.full_name ?? null} avatarUrl={profile?.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-[10px] text-zinc-600">Administrator</p>
          </div>
          <button onClick={() => setLogoutOpen(true)} className="text-zinc-600 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0c0c0e] border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-300 text-[10px] font-semibold">A</span>
          </div>
          <span className="font-semibold text-zinc-50 text-sm">Admin</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-zinc-500 hover:text-zinc-100">
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:block"
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile sidebar overlay */}
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

      <main className="flex-1 lg:ml-56 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>

      <LogoutModal
        open={logoutOpen}
        onConfirm={handleSignOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}
