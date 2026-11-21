import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Brand } from '../components/Brand'
import { Card, btnPrimary } from '../components/ui'

export function Login() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function google() {
    setBusy(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (error) {
      setError(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <Brand />
      <Card>
        <h1 className="mb-2 text-xl">Entra con tu cuenta de Google</h1>
        <p className="mb-4 text-muted">Solo las cuentas que se unan a vuestro hogar verán el menú, las recetas y la lista de la compra.</p>
        <button className={`${btnPrimary} w-full`} onClick={google} disabled={busy}>
          {busy ? 'Abriendo Google…' : 'Continuar con Google'}
        </button>
        {error && <p className="mt-3 text-bad">{error}</p>}
      </Card>
    </div>
  )
}
