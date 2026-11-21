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

export function Modal({ title, onClose, children, wide = false }: { title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-card sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <h2 className="min-w-0 flex-1 text-lg">{title}</h2>
          <button className="rounded-lg p-1.5 text-muted hover:bg-surface-2" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  )
}

/** Campo con su etiqueta. Con group, para un grupo de botones (no un <label>, que activaría el primer botón). */
export function Field({ label, children, hint, group = false }: { label: string; children: ReactNode; hint?: ReactNode; group?: boolean }) {
  const inner = (
    <>
      <span className="text-sm font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </>
  )
  return group ? (
    <div role="group" aria-label={label} className="flex flex-col gap-1">
      {inner}
    </div>
  ) : (
    <label className="flex flex-col gap-1">{inner}</label>
  )
}

export function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={title}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium ${on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted'}`}
    >
      {children}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-card border border-dashed border-line p-4 text-center text-sm text-muted">{children}</div>
}

export function Bar({ value, target, color = 'var(--accent)' }: { value: number; target: number; color?: string }) {
  const scale = 1.2
  const pct = target > 0 ? Math.min(value / target, scale) / scale : 0
  return (
    <div className="relative h-2 rounded-full bg-surface-2" role="img" aria-label={`${Math.round(target ? (value / target) * 100 : 0)} % del objetivo`}>
      <i className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
      <s className="absolute -inset-y-0.5 w-0.5 bg-ink/50" style={{ left: `${100 / scale}%` }} />
    </div>
  )
}

export const btnSm = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold disabled:opacity-60'
export const btnDanger = `${btn} border border-line bg-surface text-bad`
