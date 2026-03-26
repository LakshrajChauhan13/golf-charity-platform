import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, CheckCircle, TrendingUp, AlertCircle, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { useCharities } from '@/hooks/useCharities'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, cn } from '@/lib/utils'

export function CharityPage() {
  const profile = useAppSelector((s) => s.auth.profile)
  const { charities, loading } = useCharities()
  const { refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [percent, setPercent] = useState(profile?.charity_percentage ?? 10)
  const [selectedId, setSelectedId] = useState(profile?.charity_id ?? null)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  const filteredCharities = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return charities
    return charities.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
    )
  }, [charities, search])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ charity_id: selectedId, charity_percentage: percent })
      .eq('id', profile.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const hasChanges =
    selectedId !== profile?.charity_id || percent !== (profile?.charity_percentage ?? 10)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Charity</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Choose where your contribution goes. Minimum 10% of your subscription.
        </p>
      </div>

      {/* Percentage selector */}
      <Card glow>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
            <Heart className="text-pink-400" size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Contribution Percentage</h3>
            <p className="text-xs text-slate-500">Slide to increase your charity share</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">10% (min)</span>
              <span className="text-2xl font-bold text-pink-400">{percent}%</span>
              <span className="text-xs text-slate-500">50% (max)</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-pink-500 h-2 rounded-full"
            />
            <div className="flex justify-between mt-1">
              {[10, 15, 20, 25, 30, 35, 40, 45, 50].map((v) => (
                <span key={v} className={`text-xs ${v === percent ? 'text-pink-400' : 'text-slate-700'}`}>
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-pink-500/15 bg-pink-500/5 p-3 flex items-start gap-2">
          <TrendingUp className="text-pink-400 shrink-0 mt-0.5" size={14} />
          <p className="text-xs text-pink-300">
            At <strong>{percent}%</strong>, you'll contribute approximately{' '}
            <strong>{formatCurrency(10 * (percent / 100))}</strong> per month to your chosen charity.
          </p>
        </div>
      </Card>

      {/* Charity grid */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="text-base font-semibold text-white">Select Your Charity</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search charities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/40 w-52"
            />
          </div>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : charities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
            <AlertCircle className="text-slate-600 mx-auto mb-2" size={28} />
            <p className="text-slate-500 text-sm">No charities available yet.</p>
          </div>
        ) : filteredCharities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
            <Search className="text-slate-600 mx-auto mb-2" size={28} />
            <p className="text-slate-500 text-sm">No charities match "{search}"</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredCharities.map((c) => {
              const isSelected = selectedId === c.id
              return (
                <motion.div
                  key={c.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'relative rounded-2xl border p-5 cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-pink-500/40 bg-pink-500/5 shadow-lg shadow-pink-500/10'
                      : 'border-white/8 bg-[#111827] hover:border-white/15',
                  )}
                >
                  {c.is_featured && (
                    <Badge variant="gold" className="absolute top-3 right-3">Featured</Badge>
                  )}
                  {isSelected && (
                    <div className="absolute top-3 left-3">
                      <CheckCircle className="text-pink-400" size={18} />
                    </div>
                  )}
                  <div className="flex items-start gap-3 mt-1">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                        <Heart className="text-pink-400" size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                      <p className="text-xs text-pink-400 mt-2">
                        Total raised: {formatCurrency(c.total_raised)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Save */}
      <CardContent className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!hasChanges || !selectedId}
          icon={saved ? <CheckCircle size={16} /> : <Heart size={16} />}
          variant={saved ? 'ghost' : 'primary'}
        >
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
        {!selectedId && (
          <p className="text-xs text-slate-500">Select a charity to save</p>
        )}
      </CardContent>
    </div>
  )
}
