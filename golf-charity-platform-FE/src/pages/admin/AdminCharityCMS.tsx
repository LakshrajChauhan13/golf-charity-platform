import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Heart, Star, StarOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useCharities, CHARITIES_KEY } from '@/hooks/useCharities'
import { useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import type { Charity } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().min(10, 'Description too short'),
  image_url: z.string().url('Must be a valid URL').or(z.literal('')),
  min_contribution: z.string(),
})
type FormData = z.infer<typeof schema>

export function AdminCharityCMS() {
  const queryClient = useQueryClient()
  const { charities, loading } = useCharities()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Charity | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function openAdd() {
    reset({ name: '', description: '', image_url: '', min_contribution: '10' })
    setEditing(null)
    setModal('add')
  }

  function openEdit(c: Charity) {
    reset({
      name: c.name,
      description: c.description,
      image_url: c.image_url ?? '',
      min_contribution: String(c.min_contribution),
    })
    setEditing(c)
    setModal('edit')
  }

  async function onSubmit(data: FormData) {
    setSaving(true)
    const payload = {
      name: data.name,
      description: data.description,
      image_url: data.image_url || null,
      min_contribution: parseFloat(data.min_contribution) || 10,
    }

    if (modal === 'edit' && editing) {
      await supabase
        .from('charities')
        .update(payload)
        .eq('id', editing.id)
    } else {
      await supabase
        .from('charities')
        .insert({ ...payload, is_featured: false, total_raised: 0 })
    }
    queryClient.invalidateQueries({ queryKey: CHARITIES_KEY })

    setSaving(false)
    setModal(null)
    reset()
  }

  async function handleDelete(id: string) {
    await supabase.from('charities').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: CHARITIES_KEY })
    setDeleteConfirm(null)
  }

  async function toggleFeatured(c: Charity) {
    await supabase
      .from('charities')
      .update({ is_featured: !c.is_featured })
      .eq('id', c.id)
    queryClient.invalidateQueries({ queryKey: CHARITIES_KEY })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Charity CMS</h1>
          <p className="text-slate-400 mt-1 text-sm">Add, edit, and feature charities on the platform</p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={openAdd}>
          Add Charity
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/3 animate-pulse" />
          ))}
        </div>
      ) : charities.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Heart className="text-slate-600 mx-auto mb-3" size={28} />
            <p className="text-slate-500">No charities yet. Add the first one.</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {charities.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={c.is_featured ? 'border-amber-500/30' : ''}>
                <div className="flex items-start gap-3">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                      <Heart className="text-pink-400" size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      {c.is_featured && <Badge variant="gold">Featured</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                    <p className="text-xs text-pink-400 mt-1.5">
                      Raised: {formatCurrency(c.total_raised)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/8">
                  <button
                    onClick={() => toggleFeatured(c)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {c.is_featured ? <StarOff size={13} /> : <Star size={13} />}
                    {c.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  {deleteConfirm === c.id ? (
                    <>
                      <span className="text-xs text-slate-500 ml-1">Sure?</span>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Yes</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>No</Button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(c.id)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-red-500/10 text-slate-400 hover:text-red-400 hover:border-red-500/20 transition-colors ml-auto"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); reset() }}
        title={modal === 'edit' ? 'Edit Charity' : 'Add Charity'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Charity Name" placeholder="e.g. Children in Need" error={errors.name?.message} {...register('name')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[80px] resize-none"
              placeholder="Brief description of the charity's mission..."
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>
          <Input label="Image URL (optional)" placeholder="https://..." error={errors.image_url?.message} {...register('image_url')} />
          <Input label="Min Contribution %" type="number" placeholder="10" {...register('min_contribution')} />
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={saving}>{modal === 'edit' ? 'Save Changes' : 'Add Charity'}</Button>
            <Button type="button" variant="ghost" onClick={() => { setModal(null); reset() }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
