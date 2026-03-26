import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, Heart, CheckCircle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  activeSubscribers: number
  totalDraws: number
  totalCharities: number
  pendingWinners: number
  totalRaised: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    activeSubscribers: 0,
    totalDraws: 0,
    totalCharities: 0,
    pendingWinners: 0,
    totalRaised: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [subRes, drawRes, charRes, winRes, raisedRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_status', 'active'),
        supabase.from('draws').select('id', { count: 'exact' }),
        supabase.from('charities').select('id', { count: 'exact' }),
        supabase.from('winners').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('charities').select('total_raised'),
      ])

      const totalRaised = (raisedRes.data ?? []).reduce((sum, c) => sum + (c.total_raised ?? 0), 0)

      setStats({
        activeSubscribers: subRes.count ?? 0,
        totalDraws: drawRes.count ?? 0,
        totalCharities: charRes.count ?? 0,
        pendingWinners: winRes.count ?? 0,
        totalRaised,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const kpis = [
    { label: 'Active Subscribers', value: stats.activeSubscribers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Draws', value: stats.totalDraws, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Charities', value: stats.totalCharities, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Pending Verifications', value: stats.pendingWinners, icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 mt-1 text-sm">Platform-wide statistics and health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center shrink-0`}>
                  <k.icon className={k.color} size={18} />
                </div>
                <div>
                  {loading ? (
                    <div className="h-6 w-12 rounded bg-white/5 animate-pulse" />
                  ) : (
                    <p className="text-xl font-bold text-white">{k.value.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-slate-500">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card glow>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-pink-400" size={20} />
          <h3 className="text-base font-semibold text-white">Total Charitable Impact</h3>
        </div>
        {loading ? (
          <div className="h-10 w-40 rounded bg-white/5 animate-pulse" />
        ) : (
          <p className="text-4xl font-extrabold text-pink-400">{formatCurrency(stats.totalRaised)}</p>
        )}
        <p className="text-slate-500 text-sm mt-1">Raised across all charities on the platform</p>
      </Card>
    </div>
  )
}
