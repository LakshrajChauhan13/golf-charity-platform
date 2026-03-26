import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Draw } from '@/types'

export const DRAWS_KEY = ['draws']

export function useDraws() {
  const queryClient = useQueryClient()

  const { data: draws = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: DRAWS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Draw[]
    },
  })

  const currentDraw =
    draws.find((d) => d.status === 'upcoming') ??
    draws.find((d) => d.status === 'simulated') ??
    draws[0] ??
    null

  function refetch() {
    queryClient.invalidateQueries({ queryKey: DRAWS_KEY })
  }

  return {
    draws,
    currentDraw,
    loading,
    error: queryError ? (queryError as Error).message : null,
    refetch,
  }
}
