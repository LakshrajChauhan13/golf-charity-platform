import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Trophy, RefreshCw, CheckCircle, AlertTriangle, Shuffle, BarChart2, Users, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useDraws } from '@/hooks/useDraws'
import { formatCurrency, formatDate, generateDrawNumbers } from '@/lib/utils'
import { computeTierAmounts, calculatePrizePool, shouldRolloverJackpot, evaluateTickets, calculateWinnerPrize } from '@/lib/draw-engine'
import type { Draw } from '@/types'

type DrawMode = 'random' | 'algorithmic'

export function AdminDrawControl() {
  const { draws, refetch } = useDraws()
  const [simulatingId, setSimulatingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [createModal, setCreateModal] = useState(false)
  const [previewDraw, setPreviewDraw] = useState<Draw | null>(null)
  const [drawMode, setDrawMode] = useState<DrawMode>('random')
  const [publishResult, setPublishResult] = useState<{ winners: number; rollover: boolean } | null>(null)
  const [newDrawDate, setNewDrawDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  )

  async function generateAlgorithmicNumbers(): Promise<number[]> {
    const { data: scores } = await supabase.from('scores').select('score')
    if (!scores || scores.length === 0) return generateDrawNumbers(5, 45)
    const freq = new Map<number, number>()
    for (const s of scores) {
      freq.set(s.score, (freq.get(s.score) ?? 0) + 1)
    }
    const pool: number[] = []
    freq.forEach((count, score) => {
      for (let i = 0; i < count; i++) pool.push(score)
    })
    const picked = new Set<number>()
    let attempts = 0
    while (picked.size < 5 && attempts < 1000) {
      picked.add(pool[Math.floor(Math.random() * pool.length)])
      attempts++
    }
    while (picked.size < 5) picked.add(Math.floor(Math.random() * 45) + 1)
    return Array.from(picked).sort((a, b) => a - b)
  }

  async function handleSimulate(draw: Draw) {
    setSimulatingId(draw.id)
    const winningNumbers = drawMode === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateDrawNumbers(5, 45)
    await supabase
      .from('draws')
      .update({ winning_numbers: winningNumbers, status: 'simulated' })
      .eq('id', draw.id)
    await refetch()
    setSimulatingId(null)
  }

  async function handleDelete(draw: Draw) {
    if (draw.status === 'published') return
    setDeletingId(draw.id)
    await supabase.from('draws').delete().eq('id', draw.id)
    await refetch()
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  async function handlePublish(draw: Draw) {
    if (!draw.winning_numbers) return
    setPublishingId(draw.id)

    const { data: allScores } = await supabase.rpc('get_active_scores')

    const tickets: { userId: string; numbers: number[] }[] = []
    const scoresByUser = new Map<string, number[]>()
    for (const s of (allScores ?? [])) {
      if (!scoresByUser.has(s.user_id)) scoresByUser.set(s.user_id, [])
      const arr = scoresByUser.get(s.user_id)!
      if (arr.length < 5) arr.push(s.score)
    }
    scoresByUser.forEach((numbers, userId) => {
      if (numbers.length === 5) tickets.push({ userId, numbers })
    })

    const results = evaluateTickets(tickets, draw.winning_numbers)
    const totalPool = draw.total_pool + draw.jackpot_rollover

    const byTier = { 3: [] as string[], 4: [] as string[], 5: [] as string[] }
    for (const r of results) {
      if (r.tier) byTier[r.tier].push(r.userId)
    }

    const insertWinners = []
    for (const [tierStr, userIds] of Object.entries(byTier)) {
      const tier = Number(tierStr) as 3 | 4 | 5
      const prize = calculateWinnerPrize(tier, userIds.length, totalPool)
      for (const userId of userIds) {
        insertWinners.push({ user_id: userId, draw_id: draw.id, tier, prize_amount: prize, status: 'pending' })
      }
    }

    if (insertWinners.length > 0) {
      await supabase.from('winners').insert(insertWinners)

      const prizeAmounts: Record<string, number> = {}
      const tierLabelMap: Record<string, string> = { 5: '5-Number Jackpot', 4: '4-Number Match', 3: '3-Number Match' }
      const tierLabelsForEmail: Record<string, string> = {}
      for (const w of insertWinners) {
        prizeAmounts[w.user_id] = w.prize_amount
        tierLabelsForEmail[w.user_id] = tierLabelMap[String(w.tier)]
      }
      supabase.functions.invoke('send-winner-email', {
        body: {
          winnerIds: insertWinners.map((w) => w.user_id),
          drawDate: draw.draw_date,
          prizeAmounts,
          tierLabels: tierLabelsForEmail,
        },
      })
    }

    const rollover = shouldRolloverJackpot(byTier[5].length)
    const nextDraw = draws.find((d) => d.status === 'upcoming' && d.id !== draw.id)
    if (rollover && nextDraw) {
      await supabase
        .from('draws')
        .update({ jackpot_rollover: nextDraw.jackpot_rollover + totalPool * 0.4 })
        .eq('id', nextDraw.id)
    }

    await supabase.from('draws').update({ status: 'published' }).eq('id', draw.id)
    setPublishResult({ winners: insertWinners.length, rollover })
    await refetch()
    setPublishingId(null)
  }

  async function handleCreateDraw() {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('subscription_status', 'active')

    const activeCount = profiles?.length ?? 0
    const { prizePool } = calculatePrizePool(activeCount, activeCount * 10, 10, 0)

    await supabase.from('draws').insert({
      draw_date: newDrawDate,
      status: 'upcoming',
      total_pool: prizePool,
      jackpot_rollover: 0,
      active_subscriber_count: activeCount,
    })

    await refetch()
    setCreateModal(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Draw Control</h1>
          <p className="text-slate-400 mt-1 text-sm">Simulate and publish monthly prize draws</p>
        </div>
        <Button size="sm" onClick={() => setCreateModal(true)}>
          + New Draw
        </Button>
      </div>

      {/* Draw mode toggle */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-4">
        <div className="flex-1 min-w-[160px]">
          <p className="text-sm font-medium text-white">Draw Mode</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {drawMode === 'random' ? 'Pure random — 5 numbers drawn from 1–45' : 'Algorithmic — weighted by most-played score values'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDrawMode('random')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              drawMode === 'random' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <Shuffle size={13} /> Random
          </button>
          <button
            onClick={() => setDrawMode('algorithmic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              drawMode === 'algorithmic' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <BarChart2 size={13} /> Algorithmic
          </button>
        </div>
      </div>

      {draws.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Trophy className="text-slate-600 mx-auto mb-3" size={32} />
            <p className="text-slate-500">No draws yet. Create the first one.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {draws.map((draw, i) => {
            const tiers = computeTierAmounts(draw.total_pool + draw.jackpot_rollover)
            return (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={draw.status === 'upcoming' ? 'border-amber-500/20' : ''}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Trophy className="text-amber-400" size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            Draw — {formatDate(draw.draw_date)}
                          </p>
                          <Badge
                            variant={
                              draw.status === 'published'
                                ? 'success'
                                : draw.status === 'simulated'
                                ? 'info'
                                : 'warning'
                            }
                          >
                            {draw.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <p className="text-xs text-slate-500">
                            Pool: <span className="text-white">{formatCurrency(draw.total_pool)}</span>
                          </p>
                          {draw.jackpot_rollover > 0 && (
                            <p className="text-xs text-amber-400">
                              + {formatCurrency(draw.jackpot_rollover)} rollover
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            Subscribers: <span className="text-white">{draw.active_subscriber_count}</span>
                          </p>
                        </div>
                        {draw.winning_numbers && (
                          <div className="flex gap-1.5 mt-2">
                            {draw.winning_numbers.map((n) => (
                              <span
                                key={n}
                                className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-400 text-xs flex items-center justify-center font-semibold"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Eye size={14} />}
                        onClick={() => setPreviewDraw(draw)}
                      >
                        Preview
                      </Button>
                      {draw.status !== 'published' && (
                        confirmDeleteId === draw.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-red-400">Sure?</span>
                            <button
                              onClick={() => handleDelete(draw)}
                              disabled={deletingId === draw.id}
                              className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 disabled:opacity-50"
                            >
                              {deletingId === draw.id ? 'Deleting…' : 'Yes, delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-slate-500 hover:text-white px-2 py-1 rounded-lg bg-white/5"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<Trash2 size={13} />}
                            disabled={simulatingId !== null || publishingId !== null || deletingId !== null}
                            onClick={() => setConfirmDeleteId(draw.id)}
                          >
                            Delete
                          </Button>
                        )
                      )}
                      {draw.status === 'upcoming' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<RefreshCw size={14} />}
                          loading={simulatingId === draw.id}
                          disabled={simulatingId !== null || publishingId !== null}
                          onClick={() => handleSimulate(draw)}
                        >
                          Simulate
                        </Button>
                      )}
                      {draw.status === 'simulated' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<RefreshCw size={14} />}
                            loading={simulatingId === draw.id}
                            disabled={simulatingId !== null || publishingId !== null}
                            onClick={() => handleSimulate(draw)}
                          >
                            Re-simulate
                          </Button>
                          <Button
                            size="sm"
                            icon={<Play size={14} />}
                            loading={publishingId === draw.id}
                            disabled={simulatingId !== null || publishingId !== null}
                            onClick={() => handlePublish(draw)}
                          >
                            Publish
                          </Button>
                        </>
                      )}
                      {draw.status === 'published' && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle size={14} />
                          Published
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tier breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {tiers.map((t) => (
                      <div key={t.tier} className="rounded-lg bg-white/3 p-3 text-center">
                        <p className="text-sm font-bold text-white">{formatCurrency(t.amount)}</p>
                        <p className="text-xs text-slate-500">{t.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Preview modal */}
      <Modal
        open={!!previewDraw}
        onClose={() => setPreviewDraw(null)}
        title={previewDraw ? `Draw — ${formatDate(previewDraw.draw_date)}` : ''}
        size="md"
      >
        {previewDraw && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/3 p-3">
                <p className="text-xs text-slate-500">Total Pool</p>
                <p className="text-lg font-bold text-white">{formatCurrency(previewDraw.total_pool)}</p>
              </div>
              <div className="rounded-xl bg-white/3 p-3">
                <p className="text-xs text-slate-500">Rollover</p>
                <p className="text-lg font-bold text-amber-400">{formatCurrency(previewDraw.jackpot_rollover)}</p>
              </div>
            </div>
            {previewDraw.winning_numbers ? (
              <>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Winning Numbers</p>
                  <div className="flex gap-2">
                    {previewDraw.winning_numbers.map((n) => (
                      <div
                        key={n}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2">
                  <AlertTriangle className="text-amber-400 shrink-0" size={16} />
                  <p className="text-xs text-amber-300">
                    These numbers are {previewDraw.status === 'published' ? 'final and published' : 'simulated — not yet live'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No numbers generated yet. Run a simulation first.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Publish result modal */}
      <Modal
        open={!!publishResult}
        onClose={() => setPublishResult(null)}
        title="Draw Published"
        size="sm"
      >
        {publishResult && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{publishResult.winners}</p>
              <p className="text-sm text-slate-400">winner{publishResult.winners !== 1 ? 's' : ''} found across all tiers</p>
            </div>
            {publishResult.rollover && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                <AlertTriangle className="text-amber-400 shrink-0" size={16} />
                <p className="text-xs text-amber-300">No jackpot winner — 40% rolled over to next draw</p>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-indigo-500/8 border border-indigo-500/20 p-3">
              <Users className="text-indigo-400 shrink-0" size={14} />
              <p className="text-xs text-slate-400">Winners are now visible in the Verification tab and their Draw & Prizes pages</p>
            </div>
            <Button className="w-full" onClick={() => setPublishResult(null)}>Done</Button>
          </div>
        )}
      </Modal>

      {/* Create draw modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Draw" size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Draw Date</label>
            <input
              type="date"
              value={newDrawDate}
              onChange={(e) => setNewDrawDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button className="w-full" onClick={handleCreateDraw}>
            Create Draw
          </Button>
        </div>
      </Modal>
    </div>
  )
}
