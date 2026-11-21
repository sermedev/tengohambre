import { Brand } from '../components/Brand'
import { Card } from '../components/ui'

/** Se muestra si la app se arranca sin las claves de Supabase. */
export function Setup() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-4">
      <Brand />
      <Card>
        <h1 className="mb-2 text-xl">Falta conectar Supabase</h1>
        <p className="text-muted">
          Añade <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> en <code>.env.local</code> (en tu ordenador) o en las
          variables de entorno de Vercel. Los pasos están en <code>docs/PUESTA-EN-MARCHA.md</code>.
        </p>
      </Card>
    </div>
  )
}
