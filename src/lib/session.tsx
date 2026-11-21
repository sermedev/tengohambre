import { useEffect, useState, type ReactNode } from 'react'
import { SessionCtx } from './session-context'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseMissing } from './supabase'
import type { Household } from './types'

export type Ctx = {
  loading: boolean
  session: Session | null
  household: Household | null
  refreshHousehold: () => Promise<void>
  signOut: () => Promise<void>
}


export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(!supabaseMissing)

  async function loadHousehold() {
    const { data } = await supabase.from('households').select('id,name,invite_code').limit(1).maybeSingle()
    setHousehold(data ?? null)
  }

  useEffect(() => {
    if (supabaseMissing) return
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await loadHousehold()
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) void loadHousehold()
      else setHousehold(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: Ctx = {
    loading,
    session,
    household,
    refreshHousehold: loadHousehold,
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

