import { useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function subscribe(period: 'monthly' | 'yearly' = 'monthly') {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error: fnErr } = await supabase.functions.invoke('create-checkout-session', {
        body: { period },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (fnErr) {
        if (fnErr instanceof FunctionsHttpError) {
          const body = await fnErr.context.json().catch(() => ({}))
          throw new Error(body?.error ?? fnErr.message)
        }
        throw new Error(fnErr.message)
      }
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function manageBilling() {
    setPortalLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error: fnErr } = await supabase.functions.invoke('create-portal-session', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (fnErr) {
        if (fnErr instanceof FunctionsHttpError) {
          const body = await fnErr.context.json().catch(() => ({}))
          throw new Error(body?.error ?? fnErr.message)
        }
        throw new Error(fnErr.message)
      }
      if (data?.url) window.location.href = data.url
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPortalLoading(false)
    }
  }

  return { subscribe, manageBilling, loading, portalLoading, error }
}
