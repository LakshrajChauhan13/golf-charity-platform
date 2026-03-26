import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { CheckCircle, Trophy, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const perks = [
  { icon: Trophy, text: 'Entered into this month\'s prize draw' },
  { icon: Heart, text: 'Supporting your chosen charity every month' },
]

export function SubscriptionSuccessPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    refreshProfile()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-emerald-400" size={48} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">You're subscribed!</h1>
          <p className="text-slate-400 mb-8">
            Your subscription is active. Welcome to GolfGives.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-5 mb-8 text-left space-y-4"
        >
          {perks.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Icon className="text-emerald-400" size={18} />
              </div>
              <span className="text-slate-300 text-sm">{text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            size="lg"
            className="w-full"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
