import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** true cuando faltan las claves de Supabase (antes de configurar el proyecto). */
export const supabaseMissing = !url || !key

export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'missing', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
