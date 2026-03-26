import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Upload, CheckCircle, Clock, TrendingUp, Star, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { useDraws } from '@/hooks/useDraws'
import { useScores } from '@/hooks/useScores'
import { formatCurrency, formatDate } from '@/lib/utils'
import { computeTierAmounts } from '@/lib/draw-engine'
import type { Winner } from '@/types'

const tierConfig = {
  5: { label: '5-Number Jackpot', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Star },
  4: { label: '4-Number Match', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Trophy },
  3: { label: '3-Number Match', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
}

export function DrawPage() {
  const profile = useAppSelector((s) => s.auth.profile)
  const { draws, currentDraw, loading } = useDraws()
  const { scores, isComplete } = useScores()
  const [myWinnings, setMyWinnings] = useState<Winner[]>([])
  const [proofModal, setProofModal] = useState<Winner | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const isActive = profile?.subscription_status === 'active'
  const canEnter = isActive && isComplete

  const tierAmounts = currentDraw
    ? computeTierAmounts(currentDraw.total_pool + currentDraw.jackpot_rollover)
    : []

  async function fetchMyWinnings() {
    if (!profile) return
    const { data } = await supabase
      .from('winners')
      .select('*, draw:draws(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    setMyWinnings((data as Winner[]) ?? [])
  }

  useEffect(() => {
    fetchMyWinnings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  async function uploadProof(winner: Winner, file: File) {
    setUploading(true)
    setUploadError(null)
    const path = `${profile!.id}/${winner.id}/${file.name}`
    const { error: uploadErr } = await supabase.storage
      .from('winner-proofs')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      setUploadError(uploadErr.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(path)

    const { error: dbErr } = await supabase
      .from('winners')
      .update({ proof_url: publicUrl, status: 'verified' })
      .eq('id', winner.id)

    if (dbErr) {
      setUploadError(dbErr.message)
    } else {
      await fetchMyWinnings()
      setProofModal(null)
    }
    setUploading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Draw & Prizes</h1>
        <p className="text-slate-400 mt-1 text-sm">Monthly prize draws for active subscribers with 5 scores</p>
      </div>

      {/* Entry status */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${
        canEnter ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700 bg-white/2'
      }`}>
        {canEnter ? (
          <CheckCircle className="text-emerald-400 shrink-0" size={20} />
        ) : (
          <AlertCircle className="text-slate-500 shrink-0" size={20} />
        )}
        <div>
          <p className={`text-sm font-medium ${canEnter ? 'text-emerald-300' : 'text-slate-400'}`}>
            {canEnter
              ? 'You are entered in the next draw!'
              : !isActive
              ? 'Active subscription required to enter draws'
              : 'Add 5 scores to enter the draw'}
          </p>
        </div>
      </div>

      {/* User's draw numbers */}
      {canEnter && scores.length >= 5 && (
        <Card>
          <p className="text-xs text-slate-500 mb-3">Your Draw Numbers (latest 5 scores)</p>
          <div className="flex gap-3 flex-wrap">
            {scores.slice(0, 5).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20"
              >
                {s.score}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">Match 3, 4, or 5 of these with the drawn numbers to win</p>
        </Card>
      )}

      {/* Current draw */}
      {loading ? (
        <div className="h-40 rounded-2xl bg-white/3 animate-pulse" />
      ) : currentDraw ? (
        <Card glow className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Trophy className="text-amber-400" size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {currentDraw.status === 'upcoming' ? 'Upcoming Draw' : 'Latest Draw'}
                </h3>
                <p className="text-xs text-slate-500">{formatDate(currentDraw.draw_date)}</p>
              </div>
            </div>
            <Badge variant={currentDraw.status === 'upcoming' ? 'warning' : currentDraw.status === 'published' ? 'success' : 'info'}>
              {currentDraw.status}
            </Badge>
          </div>

          {/* Winning numbers */}
          {currentDraw.winning_numbers && currentDraw.status === 'published' && (
            <div className="mb-5">
              <p className="text-xs text-slate-500 mb-2">Winning Numbers</p>
              <div className="flex gap-2 flex-wrap">
                {currentDraw.winning_numbers.map((n) => (
                  <motion.div
                    key={n}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Prize tiers */}
          <div className="grid grid-cols-3 gap-3">
            {tierAmounts.map((t) => {
              const cfg = tierConfig[t.tier as keyof typeof tierConfig]
              return (
                <div key={t.tier} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3 text-center`}>
                  <p className={`text-xl font-bold ${cfg.color}`}>{formatCurrency(t.amount)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.label}</p>
                  <p className="text-xs text-slate-600">{t.percentage}% of pool</p>
                </div>
              )
            })}
          </div>

          {currentDraw.jackpot_rollover > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/8 px-3 py-2">
              <TrendingUp className="text-amber-400 shrink-0" size={14} />
              <p className="text-xs text-amber-300">
                Jackpot includes <strong>{formatCurrency(currentDraw.jackpot_rollover)}</strong> rolled over from last month
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <Clock className="text-slate-600 mx-auto mb-2" size={28} />
            <p className="text-slate-500 text-sm">No draws scheduled yet</p>
          </div>
        </Card>
      )}

      {/* Past draws */}
      {draws.length > 1 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-3">Draw History</h3>
          <div className="space-y-3">
            {draws.slice(1).map((d) => (
              <Card key={d.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      <Trophy className="text-slate-500" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{formatDate(d.draw_date)}</p>
                      <p className="text-xs text-slate-500">Pool: {formatCurrency(d.total_pool)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {d.winning_numbers && (
                      <div className="flex gap-1">
                        {d.winning_numbers.map((n) => (
                          <span key={n} className="w-7 h-7 rounded-full bg-white/5 text-xs flex items-center justify-center text-slate-400 font-medium">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                    <Badge variant={d.status === 'published' ? 'success' : 'neutral'}>{d.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My winnings */}
      {myWinnings.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-3">My Winnings</h3>
          <div className="space-y-3">
            {myWinnings.map((w) => {
              const cfg = tierConfig[w.tier as keyof typeof tierConfig]
              return (
                <Card key={w.id} className={`border ${cfg.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                        <cfg.icon className={cfg.color} size={18} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${cfg.color}`}>
                          {formatCurrency(w.prize_amount)}
                        </p>
                        <p className="text-xs text-slate-500">{cfg.label}</p>
                        {w.draw && <p className="text-xs text-slate-600">{formatDate(w.draw.draw_date)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={w.status === 'paid' ? 'success' : w.status === 'verified' ? 'info' : 'warning'}
                      >
                        {w.status}
                      </Badge>
                      {w.status === 'pending' && (
                        <Button size="sm" variant="outline" icon={<Upload size={14} />} onClick={() => setProofModal(w)}>
                          Upload Proof
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Proof upload modal */}
      <Modal open={!!proofModal} onClose={() => setProofModal(null)} title="Upload Winning Proof" size="sm">
        <p className="text-sm text-slate-400 mb-4">
          Upload a screenshot or photo as proof of your win. Our team will verify and process your payment.
        </p>
        <label className="block w-full rounded-xl border-2 border-dashed border-white/15 hover:border-emerald-500/40 transition-colors cursor-pointer p-8 text-center">
          <Upload className="mx-auto text-slate-500 mb-2" size={24} />
          <p className="text-sm text-slate-400">Click to select file</p>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && proofModal) uploadProof(proofModal, file)
            }}
          />
        </label>
        {uploading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Uploading…
          </div>
        )}
        {uploadError && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {uploadError}
          </div>
        )}
      </Modal>
    </div>
  )
}
