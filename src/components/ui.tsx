import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-line bg-surface p-4 shadow-card ${className}`}>{children}</section>
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl">{children}</h1>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="mb-4 inline-flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
      {tabs.map(([k, label]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${value === k ? 'bg-surface text-ink shadow-card' : 'text-muted'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Soon({ what, step }: { what: string; step: number }) {
  return (
    <Card>
      <p className="text-muted">
        {what} llega en el paso {step} del plan. La base (cuentas, hogar compartido y base de datos) ya está lista para ello.
      </p>
    </Card>
  )
}

export const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold disabled:opacity-60'
export const btnPrimary = `${btn} bg-accent text-accent-ink`
export const btnGhost = `${btn} border border-line bg-surface text-ink`
export const input = 'w-full rounded-xl border border-line bg-surface px-3 py-2.5'
