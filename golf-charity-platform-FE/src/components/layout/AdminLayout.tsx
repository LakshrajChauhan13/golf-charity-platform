import { useState } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Heart, CheckSquare, LayoutDashboard, ArrowLeft, Users, Menu, X } from 'lucide-react'

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/draws', icon: Trophy, label: 'Draw Control' },
  { to: '/admin/charities', icon: Heart, label: 'Charity CMS' },
  { to: '/admin/winners', icon: CheckSquare, label: 'Verification' },
]

const linkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-slate-400 hover:text-white hover:bg-white/5'
const activeLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 bg-indigo-500/15 text-indigo-400'

export function AdminLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const sidebarContent = (
    <div className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r border-white/8 bg-[#0d1424] z-50">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {adminLinks.map(({ to, icon: Icon, label, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: !!exact }}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
            onClick={() => setOpen(false)}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/8">
        <button
          onClick={() => { navigate({ to: '/dashboard' }); setOpen(false) }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0d1424] border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-slate-400 hover:text-white">
          <Menu size={22} />
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

      <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
