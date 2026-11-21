import { NavLink, Outlet } from 'react-router-dom'
import { Brand } from './Brand'
import { Icon } from './Icon'

const NAV = [
  { to: '/menu', label: 'Menú', icon: 'menu' },
  { to: '/recetas', label: 'Recetas', icon: 'recetas' },
  { to: '/compra', label: 'Compra', icon: 'compra' },
  { to: '/almacen', label: 'Almacén', icon: 'almacen' },
  { to: '/seguimiento', label: 'Seguimiento', icon: 'seguimiento' },
  { to: '/mas', label: 'Más', icon: 'mas' },
] as const

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2'}`

export function Layout() {
  return (
    <div className="mx-auto flex max-w-[1440px] gap-6 px-4 lg:px-6">
      {/* PC: barra lateral */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-6 py-5 lg:flex">
        <Brand />
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls}>
              <Icon name={n.icon} /> {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 pb-[calc(84px+env(safe-area-inset-bottom))] lg:pb-8">
        <header className="sticky top-0 z-20 flex items-center bg-bg py-3 lg:hidden">
          <Brand />
          <span className="flex-1" />
          <NavLink to="/mas" aria-label="Más" className="rounded-xl p-2 text-muted">
            <Icon name="mas" />
          </NavLink>
        </header>
        <main className="pt-2 lg:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Móvil y tablet: barra inferior (Más va en el engranaje de arriba) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.filter((n) => n.to !== '/mas').map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium ${isActive ? 'text-accent' : 'text-muted'}`}
          >
            <Icon name={n.icon} />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
