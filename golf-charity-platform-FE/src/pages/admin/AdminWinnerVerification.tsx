import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, Trophy, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Winner } from '@/types'

const tierLabels = {
  5: { label: '5-Number Jackpot', color: 'text-amber-400', icon: Star },
  4: { label: '4-Number Match', color: 'text-indigo-400', icon: Trophy },
  3: { label: '3-Number Match', color: 'text-emerald-400', icon: CheckCircle },
}

export function AdminWinnerVerification() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [proofModal, setProofModal] = useState<Winner | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'paid'>('pending')

  useEffect(() => {
    fetchWinners()
  }, [])

  async function fetchWinners() {
    setLoading(true)
    const { data } = await supabase
      .from('winners')
      .select('*, profile:profiles(full_name, avatar_url), draw:draws(draw_date)')
      .order('created_at', { ascending: false })
    setWinners((data as Winner[]) ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'verified' | 'paid') {
    setProcessing(id)
    await supabase.from('winners').update({ status }).eq('id', id)
    await fetchWinners()
    setProcessing(null)
  }

  async function rejectWinner(id: string) {
    setProcessing(id)
    await supabase.from('winners').update({ status: 'pending', proof_url: null }).eq('id', id)
    await fetchWinners()
    setProcessing(null)
    setProofModal(null)
  }

  const filtered = filter === 'all' ? winners : winners.filter((w) => w.status === filter)

  const counts = {
    all: winners.length,
    pending: winners.filter((w) => w.status === 'pending').length,
    verified: winners.filter((w) => w.status === 'verified').length,
    paid: winners.filter((w) => w.status === 'paid').length,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Winner Verification</h1>
        <p className="text-slate-400 mt-1 text-sm">Review proof submissions and mark payouts as paid</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'verified', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}{' '}
            <span className="ml-1 text-xs opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/3 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Trophy className="text-slate-600 mx-auto mb-3" size={28} />
            <p className="text-slate-500 text-sm">No {filter === 'all' ? '' : filter} winners found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((w, i) => {
            const tierCfg = tierLabels[w.tier as keyof typeof tierLabels]
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={w.profile?.full_name ?? null}
                        avatarUrl={w.profile?.avatar_url}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {w.profile?.full_name ?? 'Unknown User'}
                        </p>
                        <p className={`text-xs font-medium ${tierCfg?.color}`}>
                          {tierCfg?.label}
                        </p>
                        {w.draw && (
                          <p className="text-xs text-slate-500">Draw: {formatDate(w.draw.draw_date)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{formatCurrency(w.prize_amount)}</p>
                      </div>
                      <Badge
                        variant={
                          w.status === 'paid'
                            ? 'success'
                            : w.status === 'verified'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {w.status}
                      </Badge>

                      {w.proof_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Eye size={14} />}
                          onClick={() => setProofModal(w)}
                        >
                          View Proof
                        </Button>
                      )}

                      {w.status === 'pending' && w.proof_url && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<CheckCircle size={14} />}
                            loading={processing === w.id}
                            onClick={() => updateStatus(w.id, 'verified')}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<XCircle size={14} />}
                            loading={processing === w.id}
                            onClick={() => rejectWinner(w.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {w.status === 'verified' && (
                        <>
                          <Button
                            size="sm"
                            icon={<CheckCircle size={14} />}
                            loading={processing === w.id}
                            onClick={() => updateStatus(w.id, 'paid')}
                          >
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<XCircle size={14} />}
                            loading={processing === w.id}
                            onClick={() => rejectWinner(w.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {w.status === 'pending' && !w.proof_url && (
                        <span className="text-xs text-slate-500 italic">Awaiting proof upload</span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Proof modal */}
      <Modal
        open={!!proofModal}
        onClose={() => setProofModal(null)}
        title="Winner Proof"
        size="md"
      >
        {proofModal?.proof_url && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={proofModal.profile?.full_name ?? null} size="md" />
              <div>
                <p className="text-sm font-semibold text-white">{proofModal.profile?.full_name}</p>
                <p className="text-xs text-slate-500">{formatCurrency(proofModal.prize_amount)} prize</p>
              </div>
            </div>
            <img
              src={proofModal.proof_url}
              alt="Winner proof"
              className="w-full rounded-xl border border-white/10 object-contain max-h-80"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <a
              href={proofModal.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:underline"
            >
              Open original file ↗
            </a>
            <div className="flex gap-3 pt-1">
              {proofModal.status === 'pending' && (
                <Button
                  icon={<CheckCircle size={15} />}
                  onClick={() => { updateStatus(proofModal.id, 'verified'); setProofModal(null) }}
                >
                  Verify Win
                </Button>
              )}
              {proofModal.status === 'verified' && (
                <Button
                  icon={<CheckCircle size={15} />}
                  onClick={() => { updateStatus(proofModal.id, 'paid'); setProofModal(null) }}
                >
                  Mark as Paid
                </Button>
              )}
              {(proofModal.status === 'pending' || proofModal.status === 'verified') && (
                <Button
                  variant="danger"
                  icon={<XCircle size={15} />}
                  onClick={() => rejectWinner(proofModal.id)}
                >
                  Reject
                </Button>
              )}
              <Button variant="ghost" onClick={() => setProofModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
