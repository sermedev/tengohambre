import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './lib/session'
import { useSession } from './lib/session-context'
import { supabaseMissing } from './lib/supabase'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Setup } from './pages/Setup'
import { Hogar } from './pages/Hogar'
import { Almacen, Compra, Menu, Recetas } from './pages/Sections'
import { Seguimiento } from './pages/Seguimiento'
import { Mas } from './pages/Mas'

function Gate() {
  const { loading, session, household } = useSession()
  if (supabaseMissing) return <Setup />
  if (loading) return <p className="p-6 text-muted">Cargando…</p>
  if (!session) return <Login />
  if (!household) return <Hogar />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/menu" element={<Menu />} />
        <Route path="/recetas" element={<Recetas />} />
        <Route path="/compra" element={<Compra />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/seguimiento" element={<Seguimiento />} />
        <Route path="/mas" element={<Mas />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Gate />
      </SessionProvider>
    </BrowserRouter>
  )
}
