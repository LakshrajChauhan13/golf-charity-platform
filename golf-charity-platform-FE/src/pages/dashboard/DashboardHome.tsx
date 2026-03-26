import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { Target, Heart, Trophy, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { useScores } from '@/hooks/useScores'
import { useDraws } from '@/hooks/useDraws'
import { useCharities } from '@/hooks/useCharities'
import { useSubscription } from '@/hooks/useSubscription'
import { formatCurrency, formatDate } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function DashboardHome() {
  const profile = useAppSelector((s) => s.auth.profile)
  const { scores, isComplete } = useScores()
  const { currentDraw } = useDraws()
  const { charities } = useCharities()
  const { subscribe, loading: subLoading, error: subError } = useSubscription()

  const selectedCharity = charities.find((c) => c.id === profile?.charity_id)
  const isActive = profile?.subscription_status === 'active'

  const statusMap = {
    active: { label: 'Active', variant: 'success' as const },
    trialing: { label: 'Trialing', variant: 'info' as const },
    past_due: { label: 'Past Due', variant: 'warning' as const },
    canceled: { label: 'Canceled', variant: 'danger' as const },
    inactive: { label: 'Inactive', variant: 'neutral' as const },
  }
  const status = statusMap[profile?.subscription_status ?? 'inactive']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Golfer'} 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Here's what's happening with your account</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </motion.div>

        {/* Alert: inactive subscription */}
        {!isActive && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3"
          >
            <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-amber-300 font-medium text-sm">Subscription Required</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Activate a subscription to enter monthly draws and track scores.
              </p>
              {subError && (
                <p className="text-xs text-red-400 mt-1">{subError}</p>
              )}
            </div>
            <Button size="sm" variant="secondary" loading={subLoading} onClick={() => subscribe('monthly')}>
              Subscribe Now
            </Button>
          </motion.div>
        )}

        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card glow>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Target className="text-emerald-400" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{scores.length}/5</p>
                <p className="text-sm text-slate-400">Scores Logged</p>
                {isComplete ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle size={12} /> Draw Active
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {5 - scores.length} more needed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/15 flex items-center justify-center shrink-0">
                <Heart className="text-pink-400" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{profile?.charity_percentage ?? 10}%</p>
                <p className="text-sm text-slate-400">
                  {selectedCharity ? selectedCharity.name : 'No Charity Selected'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Trophy className="text-amber-400" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {currentDraw ? formatCurrency(currentDraw.total_pool + currentDraw.jackpot_rollover) : '—'}
                </p>
                <p className="text-sm text-slate-400">Current Prize Pool</p>
                {currentDraw && (
                  <span className="text-xs text-slate-500">
                    Draw: {formatDate(currentDraw.draw_date)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Scores */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Rolling 5 Scores</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your 5 most recent Stableford scores</p>
              </div>
              <Link to="/dashboard/scores">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            </div>
            {scores.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                <Target className="text-slate-600 mx-auto mb-2" size={28} />
                <p className="text-slate-500 text-sm">No scores yet. Add your first score to get started.</p>
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {scores.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/3 px-4 py-3 min-w-[72px]"
                  >
                    <span className="text-2xl font-bold text-emerald-400">{s.score}</span>
                    <span className="text-xs text-slate-500">{formatDate(s.date)}</span>
                  </motion.div>
                ))}
                {Array.from({ length: 5 - scores.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-white/8 px-4 py-3 min-w-[72px]"
                  >
                    <span className="text-2xl font-bold text-slate-700">—</span>
                    <span className="text-xs text-slate-700">empty</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Draw Status */}
        {currentDraw && (
          <motion.div variants={itemVariants}>
            <Card glow className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="text-amber-400" size={20} />
                  <h3 className="text-base font-semibold text-white">Next Draw</h3>
                </div>
                <Badge variant={currentDraw.status === 'upcoming' ? 'warning' : 'success'}>
                  {currentDraw.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Draw Date</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{formatDate(currentDraw.draw_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Prize Pool</p>
                  <p className="text-sm font-semibold text-amber-400 mt-0.5">{formatCurrency(currentDraw.total_pool)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Jackpot Rollover</p>
                  <p className="text-sm font-semibold text-amber-400 mt-0.5">{formatCurrency(currentDraw.jackpot_rollover)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Your Status</p>
                  <p className="text-sm font-semibold mt-0.5">
                    {isComplete && isActive ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={14} /> Entered
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Entered</span>
                    )}
                  </p>
                </div>
              </div>
              {currentDraw.jackpot_rollover > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/8 px-3 py-2">
                  <TrendingUp className="text-amber-400 shrink-0" size={14} />
                  <p className="text-xs text-amber-300">
                    Jackpot rolled over from last month! Current jackpot tier:{' '}
                    <strong>{formatCurrency(currentDraw.total_pool * 0.4 + currentDraw.jackpot_rollover)}</strong>
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
