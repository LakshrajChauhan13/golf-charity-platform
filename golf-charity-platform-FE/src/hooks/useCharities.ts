import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Charity } from '@/types'

export const CHARITIES_KEY = ['charities']

export function useCharities() {
  const queryClient = useQueryClient()

  const { data: charities = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: CHARITIES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name')
      if (error) throw error
      return data as Charity[]
    },
  })

  function refetch() {
    queryClient.invalidateQueries({ queryKey: CHARITIES_KEY })
  }

  return {
    charities,
    loading,
    error: queryError ? (queryError as Error).message : null,
    refetch,
  }
}
