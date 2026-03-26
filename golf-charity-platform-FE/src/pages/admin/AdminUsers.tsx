import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, CheckCircle, XCircle, Calendar, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types'

interface UserRow extends Profile {
  email?: string
  score_count?: number
  charity_name?: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, charity:charities(name)')
      .order('created_at', { ascending: false })

    if (!profiles) { setLoading(false); return }

    const userIds = profiles.map((p) => p.id)

    const { data: scoreCounts } = await supabase
      .from('scores')
      .select('user_id')
      .in('user_id', userIds)

    const countMap = new Map<string, number>()
    for (const s of (scoreCounts ?? [])) {
      countMap.set(s.user_id, (countMap.get(s.user_id) ?? 0) + 1)
    }

    const mapped: UserRow[] = profiles.map((p) => ({
      ...p,
      charity_name: (p.charity as { name?: string } | null)?.name ?? undefined,
      score_count: countMap.get(p.id) ?? 0,
    }))

    setUsers(mapped)
    setLoading(false)
  }

  const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    if (s === 'active') return 'success'
    if (s === 'past_due') return 'warning'
    if (s === 'canceled') return 'danger'
    return 'neutral'
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && u.subscription_status === 'active') ||
      (filter === 'inactive' && u.subscription_status !== 'active')
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1 text-sm">{users.length} total users on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/3 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Users className="text-slate-600 mx-auto mb-3" size={28} />
            <p className="text-slate-500 text-sm">No users found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} avatarUrl={user.avatar_url} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user.full_name ?? 'Unnamed User'}
                        {user.is_admin && (
                          <span className="ml-2 text-xs text-indigo-400 font-normal">(admin)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={11} />
                          Joined {formatDate(user.created_at)}
                        </span>
                        {user.charity_name && (
                          <span className="flex items-center gap-1 text-xs text-pink-400">
                            <Heart size={11} />
                            {user.charity_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Scores</p>
                      <p className="text-sm font-semibold text-white">{user.score_count ?? 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Charity %</p>
                      <p className="text-sm font-semibold text-pink-400">{user.charity_percentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Period</p>
                      <p className="text-xs font-medium text-slate-300 capitalize">
                        {user.subscription_period ?? '—'}
                      </p>
                    </div>
                    <Badge variant={statusVariant(user.subscription_status)}>
                      {user.subscription_status}
                    </Badge>
                    {user.subscription_status === 'active' ? (
                      <CheckCircle className="text-emerald-400 shrink-0" size={16} />
                    ) : (
                      <XCircle className="text-slate-600 shrink-0" size={16} />
                    )}
                  </div>
                </div>

                {user.subscription_current_period_end && user.subscription_status === 'active' && (
                  <p className="text-xs text-slate-600 mt-2 ml-13">
                    Renews {formatDate(user.subscription_current_period_end)}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
