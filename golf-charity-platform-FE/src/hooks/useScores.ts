import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppSelector } from './useAppDispatch'
import type { Score } from '@/types'

export const SCORES_KEY = (userId: string) => ['scores', userId]

export function useScores() {
  const user = useAppSelector((s) => s.auth.user)
  const queryClient = useQueryClient()

  const { data: scores = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: SCORES_KEY(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(5)
      if (error) throw error
      return data as Score[]
    },
    enabled: !!user,
  })

  const addMutation = useMutation({
    mutationFn: async ({ score, date }: { score: number; date: string }) => {
      const { data: existing } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', user!.id)
        .order('date', { ascending: true })

      if (existing && existing.length >= 5) {
        await supabase.from('scores').delete().eq('id', existing[0].id)
      }

      const { error } = await supabase
        .from('scores')
        .insert({ user_id: user!.id, score, date })
      if (error) throw error
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SCORES_KEY(user?.id ?? '') }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scores').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SCORES_KEY(user?.id ?? '') }),
  })

  async function addScore(score: number, date: string) {
    try {
      await addMutation.mutateAsync({ score, date })
      return { error: null }
    } catch (err) {
      return { error: (err as Error).message }
    }
  }

  async function deleteScore(id: string) {
    await deleteMutation.mutateAsync(id)
  }

  return {
    scores,
    loading,
    error: queryError ? (queryError as Error).message : null,
    addScore,
    deleteScore,
    isComplete: scores.length >= 5,
  }
}
