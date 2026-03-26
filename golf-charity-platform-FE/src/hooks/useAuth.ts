import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { setUser, setProfile, setLoading, setInitialized, signOut } from '@/store/slices/authSlice'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import type { Profile } from '@/types'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, profile, loading, initialized } = useAppSelector((s) => s.auth)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser({ id: session.user.id, email: session.user.email ?? '' }))
        fetchProfile(session.user.id)
      } else {
        dispatch(setLoading(false))
        dispatch(setInitialized(true))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser({ id: session.user.id, email: session.user.email ?? '' }))
        fetchProfile(session.user.id)
      } else {
        dispatch(signOut())
        dispatch(setLoading(false))
        dispatch(setInitialized(true))
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  async function fetchProfile(userId: string) {
    dispatch(setLoading(true))
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) dispatch(setProfile(data as Profile))
    dispatch(setLoading(false))
    dispatch(setInitialized(true))
  }

  async function refreshProfile() {
    if (!user) return
    await fetchProfile(user.id)
  }

  return { user, profile, loading, initialized, refreshProfile }
}
