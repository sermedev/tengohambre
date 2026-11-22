import { useState } from 'react'
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

const KEY = 'tengohambre-sidebar'

/** Plegada por defecto en tabletas horizontales (menos de 1400 px, donde la semana no cabe con la barra abierta); luego se recuerda lo que elija cada uno. */
function initialCollapsed() {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'plegada') return true
    if (v === 'abierta') return false
  } catch {
    /* sin almacenamiento */
  }
  return window.innerWidth < 1400
}

export function Layout() {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(KEY, c ? 'abierta' : 'plegada')
      } catch {
        /* sin almacenamiento */
      }
      return !c
    })

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl py-2 font-medium ${collapsed ? 'justify-center px-0' : 'px-3'} ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2'}`

  return (
    <div className={`mx-auto flex max-w-[1440px] px-4 lg:px-6 ${collapsed ? 'gap-4' : 'gap-6'}`}>
      {/* PC y tableta horizontal: barra lateral plegable */}
      <aside className={`sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 py-5 transition-[width] duration-200 lg:flex ${collapsed ? 'w-12' : 'w-56'}`}>
        {collapsed ? <img src="/icon.svg" alt="TengoHambre" width={30} height={30} className="mx-auto" /> : <Brand />}
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls} title={collapsed ? n.label : undefined} aria-label={collapsed ? n.label : undefined}>
              <Icon name={n.icon} /> {!collapsed && n.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Desplegar menú' : 'Plegar menú'}
          title={collapsed ? 'Desplegar menú' : 'Plegar menú'}
          className={`mt-auto flex items-center gap-3 rounded-xl py-2 text-sm font-medium text-muted hover:bg-surface-2 ${collapsed ? 'justify-center px-0' : 'px-3'}`}
        >
          <Icon name={collapsed ? 'desplegar' : 'plegar'} />
          {!collapsed && 'Plegar menú'}
        </button>
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
