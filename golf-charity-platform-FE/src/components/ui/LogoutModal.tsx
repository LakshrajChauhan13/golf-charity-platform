import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X } from 'lucide-react'
import { Button } from './Button'

interface LogoutModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LogoutModal({ open, onConfirm, onCancel }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-sm"
          >
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-md bg-red-500/10 flex items-center justify-center">
                  <LogOut className="text-red-400" size={20} />
                </div>
                <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Sign out?</h3>
              <p className="text-sm text-slate-400 mb-6">You will be redirected to the home page.</p>
              <div className="flex gap-3">
                <Button variant="danger" className="flex-1" onClick={onConfirm}>
                  Yes, sign out
                </Button>
                <Button variant="ghost" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
