import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Target, Info, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useScores } from '@/hooks/useScores'
import { formatDate } from '@/lib/utils'

const schema = z.object({
  score: z.string().min(1, 'Score is required'),
  date: z.string().min(1, 'Date is required'),
})
type FormData = z.infer<typeof schema>

export function ScoresPage() {
  const { scores, loading, error, addScore, deleteScore, isComplete } = useScores()
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(data: FormData) {
    setFormError(null)
    const parsed = parseInt(data.score, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 45) {
      setFormError('Score must be a whole number between 1 and 45')
      return
    }
    const { error: addErr } = await addScore(parsed, data.date)
    if (!addErr) {
      reset({ date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Scores</h1>
          <p className="text-slate-400 mt-1 text-sm">Track your 5 most recent Stableford scores</p>
        </div>
        {scores.length < 5 && (
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setShowForm((v) => !v)}
          >
            Add Score
          </Button>
        )}
      </div>

      {/* Status banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${
        isComplete
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : 'border-amber-500/20 bg-amber-500/5'
      }`}>
        {isComplete ? (
          <CheckCircle className="text-emerald-400 shrink-0" size={20} />
        ) : (
          <Info className="text-amber-400 shrink-0" size={20} />
        )}
        <div>
          <p className={`text-sm font-medium ${isComplete ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isComplete
              ? 'All 5 scores logged — you are entered in the next draw!'
              : `${5 - scores.length} more score${5 - scores.length !== 1 ? 's' : ''} needed to enter the draw`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            When you add a 6th score, the oldest is automatically removed.
          </p>
        </div>
      </div>

      {/* Add Score Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-emerald-500/20">
              <h3 className="text-base font-semibold text-white mb-4">Add New Score</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Stableford Score"
                    type="number"
                    placeholder="e.g. 32"
                    hint="Range: 1 – 45"
                    error={errors.score?.message}
                    {...register('score')}
                  />
                  <Input
                    label="Date Played"
                    type="date"
                    error={errors.date?.message}
                    {...register('date')}
                  />
                </div>
                {(formError || error) && (
                  <p className="text-sm text-red-400">{formError ?? error}</p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" size="sm" loading={isSubmitting}>
                    Save Score
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowForm(false); reset() }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scores list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Score History</h3>
          <Badge variant={isComplete ? 'success' : 'warning'}>{scores.length}/5</Badge>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
            <Target className="text-slate-700 mx-auto mb-3" size={32} />
            <p className="text-slate-500">No scores yet.</p>
            <p className="text-slate-600 text-sm mt-1">Add your first score to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {scores.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-400">{s.score}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Stableford Score</p>
                      <p className="text-xs text-slate-500">{formatDate(s.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {i === 0 && <Badge variant="info">Latest</Badge>}
                    {deleteConfirm === s.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Confirm?</span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => { deleteScore(s.id); setDeleteConfirm(null) }}
                        >
                          Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Rule explanation */}
      <div className="rounded-xl border border-white/8 bg-white/2 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <Info size={14} className="text-slate-500" /> Rolling 5 Rule
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Only your 5 most recent scores determine draw eligibility. When you submit a 6th score, the
          oldest is automatically removed. You must have exactly 5 scores logged to be entered in the
          monthly draw.
        </p>
      </div>
    </div>
  )
}
