import { useMemo, useState, type FormEvent } from 'react'
import { db } from '../lib/db'
import { useData, usePlan } from '../lib/data-context'
import { addDays, dayLabel, mondayOf, todayIso } from '../lib/dates'
import { menuNeeds, needNote, pendingMatch, qtyLabel, type NeedLine } from '../lib/shopping'
import { CAT_NAMES, addProduct } from '../lib/shopping-db'
import { norm } from '../lib/text'
import type { SavedProduct, ShoppingItem } from '../lib/types'
import { CATALOG, HABITUALES, SECTIONS } from '../data/catalog'
import { Card, Chip, Empty, Modal, PageTitle, Tabs, btnGhost, btnPrimary, btnSm, input } from '../components/ui'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Productos conocidos (catálogo + Mis productos + habituales) con su sección. */
function useKnown() {
  const { saved } = useData()
  return useMemo(() => {
    const m = new Map<string, { name: string; section: string }>()
    for (const s of SECTIONS) for (const n of CATALOG[s]) m.set(norm(n), { name: n, section: s })
    for (const [n, s] of HABITUALES) if (!m.has(norm(n))) m.set(norm(n), { name: n, section: s })
    for (const p of saved) m.set(norm(p.name), { name: p.name, section: p.section })
    return m
  }, [saved])
}

export function Compra() {
  const { shopping } = useData()
  const [tab, setTab] = useState<'lista' | 'catalogo'>('lista')
  const [fromMenu, setFromMenu] = useState(false)
  const pending = shopping.filter((s) => !s.checked).length
  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <PageTitle sub="Una sola lista para toda la casa: comida, limpieza, higiene… Se actualiza en los dos móviles.">Compra</PageTitle>
        <button className={btnPrimary} onClick={() => setFromMenu(true)}>
          🛒 Añadir ingredientes del menú
        </button>
      </div>
      <Tabs
        tabs={[
          ['lista', `Lista (${pending})`],
          ['catalogo', 'Catálogo'],
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'lista' ? <Lista /> : <Catalogo />}
      {fromMenu && <FromMenu onClose={() => setFromMenu(false)} />}
    </>
  )
}

// ───────── Lista ─────────
function Lista() {
  const { shopping, saved, ready } = useData()
  const known = useKnown()
  const [q, setQ] = useState('')
  const [section, setSection] = useState('Otros')
  const [err, setErr] = useState<string | null>(null)

  const pend = shopping.filter((s) => !s.checked)
  const done = shopping.filter((s) => s.checked).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  const have = new Set(pend.map((s) => norm(s.name)))
  const sugg = q.trim() ? [...known.values()].filter((k) => norm(k.name).includes(norm(q.trim())) && !have.has(norm(k.name))).slice(0, 6) : []
  const hab = HABITUALES.filter(([n]) => !have.has(norm(n)))

  async function add(name: string, sec: string) {
    setErr(null)
    try {
      await addProduct(name, sec, shopping, saved)
      setQ('')
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const raw = q.trim()
    if (!raw) return
    const k = known.get(norm(raw))
    void add(k?.name ?? cap(raw), k?.section ?? section)
  }

  const run = (f: () => Promise<unknown>) => () => void f().catch((e: Error) => setErr(e.message))

  return (
    <>
      <form onSubmit={submit} className="mb-3 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_13rem_auto]" autoComplete="off">
        <input
          className={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            const k = known.get(norm(e.target.value.trim()))
            if (k) setSection(k.section)
          }}
          placeholder="Añadir: suavizante, pilas, pan…"
          aria-label="Añadir a la lista"
        />
        <select className={`${input} order-last col-span-2 sm:order-none sm:col-span-1`} value={section} onChange={(e) => setSection(e.target.value)} aria-label="Sección">
          {SECTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className={btnGhost} type="submit">
          Añadir
        </button>
      </form>
      {sugg.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {sugg.map((k) => (
            <button key={k.name} className="rounded-full border border-line bg-surface px-3 py-1 text-sm" onClick={() => void add(k.name, k.section)}>
              + {k.name} <span className="text-muted">· {k.section}</span>
            </button>
          ))}
        </div>
      )}
      {err && <p className="mb-3 text-bad">{err}</p>}
      {hab.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold tracking-wider text-muted uppercase">Habituales</p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {hab.map(([n, s]) => (
              <button key={n} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-sm whitespace-nowrap text-muted" onClick={() => void add(n, s)}>
                + {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {!ready ? (
        <p className="text-muted">Cargando…</p>
      ) : pend.length === 0 ? (
        <Empty>La lista está vacía. Añade productos arriba, desde el Catálogo o con «Añadir ingredientes del menú».</Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {SECTIONS.concat(pend.some((s) => !SECTIONS.includes(s.section as never)) ? ['Otros'] : [])
            .filter((sec, i, a) => a.indexOf(sec) === i)
            .map((sec) => {
              const its = pend.filter((s) => (SECTIONS.includes(s.section as never) ? s.section : 'Otros') === sec).sort((a, b) => a.name.localeCompare(b.name, 'es'))
              if (!its.length) return null
              return (
                <Card key={sec} className="py-3">
                  <h2 className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">{sec}</h2>
                  {its.map((s) => (
                    <Row key={s.id} s={s} run={run} />
                  ))}
                </Card>
              )
            })}
        </div>
      )}

      {done.length > 0 && (
        <Card className="mt-4 py-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">Comprado ({done.length})</h2>
            <button className={`${btnSm} border border-line`} onClick={run(() => db.remove('shopping_items', done.map((s) => s.id)))}>
              Vaciar comprados
            </button>
          </div>
          {done.map((s) => (
            <Row key={s.id} s={s} run={run} />
          ))}
          <p className="mt-2 text-xs text-muted">Si guardas algo en casa que quieras descontar de futuras compras del menú, apúntalo en Almacén.</p>
        </Card>
      )}
    </>
  )
}

function Row({ s, run }: { s: ShoppingItem; run: (f: () => Promise<unknown>) => () => void }) {
  const q = qtyLabel(s.qty, s.unit)
  const sub = [q, s.from_menu ? 'del menú' : ''].filter(Boolean).join(' · ')
  return (
    <div className={`flex items-start gap-3 border-t border-line py-2 first-of-type:border-t-0 ${s.checked ? 'opacity-60' : ''}`}>
      <button
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 ${s.checked ? 'border-accent bg-accent text-accent-ink' : 'border-line'}`}
        aria-pressed={s.checked}
        aria-label={`${s.checked ? 'Desmarcar' : 'Marcar como comprado'}: ${s.name}`}
        onClick={run(() => db.update('shopping_items', s.id, { checked: !s.checked }))}
      >
        {s.checked ? '✓' : ''}
      </button>
      <div className="min-w-0 flex-1">
        <b className={`font-semibold ${s.checked ? 'line-through' : ''}`}>{s.name}</b>
        {sub && <span className="num ml-2 text-sm text-muted">{sub}</span>}
        {s.note && !s.checked && <p className="text-xs text-muted">{s.note}</p>}
      </div>
      <button className={`${btnSm} text-muted`} aria-label={`Quitar ${s.name}`} onClick={run(() => db.remove('shopping_items', [s.id]))}>
        ✕
      </button>
    </div>
  )
}

// ───────── Catálogo ─────────
function Catalogo() {
  const { shopping, saved } = useData()
  const [q, setQ] = useState('')
  const [sec, setSec] = useState<string>('all')
  const [newSec, setNewSec] = useState('Otros')
  const [err, setErr] = useState<string | null>(null)
  const pend = shopping.filter((s) => !s.checked)
  const nq = norm(q.trim())

  const mine = saved.filter((p) => !CAT_NAMES.has(norm(p.name)))
  const groups: [string, string, { name: string; section: string; saved?: SavedProduct }[]][] = [
    ['__mine', 'Mis productos', mine.map((p) => ({ name: p.name, section: p.section, saved: p }))],
    ...SECTIONS.map((s) => [s, s, CATALOG[s].map((n) => ({ name: n, section: s }))] as [string, string, { name: string; section: string }[]]),
  ]
  const shown = groups.filter(([k]) => sec === 'all' || sec === k).map(([k, t, its]) => [k, t, its.filter((i) => !nq || norm(i.name).includes(nq))] as const)
  const exists = groups.some(([, , its]) => its.some((i) => norm(i.name) === nq))

  async function toggle(name: string, section: string) {
    setErr(null)
    try {
      const ex = pendingMatch(pend, name)
      if (ex) await db.remove('shopping_items', [ex.id])
      else await addProduct(name, section, shopping, saved)
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <>
      <input className={`${input} mb-3 max-w-sm`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto…" aria-label="Buscar producto" />
      <div className="mb-3 flex flex-wrap gap-2">
        {[['all', 'Todo'], ['__mine', 'Mis productos'], ...SECTIONS.map((s) => [s, s])].map(([k, n]) => (
          <Chip key={k} on={sec === k} onClick={() => setSec(k)}>
            {n}
          </Chip>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">Toca un producto para añadirlo a la lista o quitarlo. Lo que añadís a mano y no está aquí se guarda en «Mis productos».</p>
      {err && <p className="mb-3 text-bad">{err}</p>}
      <div className="flex flex-col gap-4">
        {shown.map(([k, title, its]) =>
          its.length ? (
            <div key={k}>
              <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">{title}</h2>
              <div className="flex flex-wrap gap-2">
                {its.map((i) => {
                  const on = !!pendingMatch(pend, i.name)
                  return (
                    <span key={i.name} className={`inline-flex items-center rounded-full border ${on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface'}`}>
                      <button className="px-3 py-1 text-sm font-medium" aria-pressed={on} onClick={() => void toggle(i.name, i.section)}>
                        {on ? '✓ ' : '+ '}
                        {i.name}
                      </button>
                      {i.saved && (
                        <button className="pr-2.5 text-sm text-muted" aria-label={`Borrar ${i.name} de Mis productos`} onClick={() => void db.remove('saved_products', [i.saved!.id]).catch((e: Error) => setErr(e.message))}>
                          ✕
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          ) : k === '__mine' && sec === '__mine' && !nq ? (
            <Empty key={k}>Aún no hay productos propios. Se guardan solos al añadir a la lista algo que no está en el catálogo.</Empty>
          ) : null,
        )}
      </div>
      {nq && !exists && (
        <Card className="mt-4">
          <b>¿No está «{q.trim()}»?</b>
          <div className="mt-2 flex flex-wrap gap-2">
            <select className={`${input} max-w-56`} value={newSec} onChange={(e) => setNewSec(e.target.value)} aria-label="Sección">
              {SECTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              className={btnPrimary}
              onClick={async () => {
                await toggle(cap(q.trim()), newSec)
                setQ('')
              }}
            >
              Crear y añadir a la lista
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Se guarda en «Mis productos» para elegirlo otras veces.</p>
        </Card>
      )}
    </>
  )
}

// ───────── Del menú a la lista ─────────
type Range = 'resto' | 'semana' | 'siguiente'

function rangeOf(r: Range): [string, string] {
  const t = todayIso()
  const mon = mondayOf(t)
  if (r === 'resto') return [t, addDays(mon, 6)]
  if (r === 'semana') return [mon, addDays(mon, 6)]
  return [addDays(mon, 7), addDays(mon, 13)]
}

function FromMenu({ onClose }: { onClose: () => void }) {
  const { members, L, pantry, saved, shopping } = useData()
  // En domingo lo normal es preparar la compra de la semana siguiente
  const [range, setRange] = useState<Range>(() => (new Date().getDay() === 0 ? 'siguiente' : 'resto'))
  const [from, to] = rangeOf(range)
  const { items, loading } = usePlan(from, to)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const needs = useMemo(
    () =>
      menuNeeds(items, {
        members,
        recipes: L.recipes,
        ingredients: L.ingredients,
        pantry,
        saved,
        edible: (ref) => (ref.startsWith('bedca:') ? L.bedca.get(Number(ref.slice(6)))?.edible : undefined),
      }),
    [items, members, L, pantry, saved],
  )
  const buy = needs.lines.filter((l) => !l.covered)
  const covered = needs.lines.filter((l) => l.covered)
  const oldMenu = shopping.filter((s) => s.from_menu && !s.checked)
  const manual = shopping.filter((s) => !s.from_menu && !s.checked)

  async function apply() {
    setBusy(true)
    setErr(null)
    try {
      await db.remove('shopping_items', oldMenu.map((s) => s.id))
      const rows = buy
        .filter((l) => !pendingMatch(manual, l.name))
        .map((l) => ({ name: l.name, section: l.section, qty: l.qty, unit: l.unit, from_menu: true, note: needNote(l) }))
      if (rows.length) await db.insert<ShoppingItem>('shopping_items', rows)
      onClose()
    } catch (e) {
      setErr((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Añadir ingredientes del menú" onClose={onClose} wide>
      <div className="mb-3 flex flex-wrap gap-2">
        <Chip on={range === 'resto'} onClick={() => setRange('resto')}>
          De hoy al domingo
        </Chip>
        <Chip on={range === 'semana'} onClick={() => setRange('semana')}>
          Esta semana entera
        </Chip>
        <Chip on={range === 'siguiente'} onClick={() => setRange('siguiente')}>
          Semana que viene
        </Chip>
      </div>
      <p className="mb-3 text-sm text-muted">
        Del {dayLabel(from).toLowerCase()} al {dayLabel(to).toLowerCase()}. Cuenta la ración de cada persona y quita a quien no come. Las sobras del almacén y las comidas fuera de casa no suman.
      </p>
      {loading ? (
        <p className="text-muted">Cargando el menú…</p>
      ) : needs.lines.length === 0 ? (
        <Empty>No hay recetas en el menú de esos días.</Empty>
      ) : (
        <>
          <NeedList title={`A comprar (${buy.length})`} lines={buy} />
          {covered.length > 0 && <NeedList title={`Ya lo tenéis en el almacén (${covered.length})`} lines={covered} muted />}
          <p className="mt-3 text-xs text-muted">
            Las recetas llevan el peso de la parte que se come, en crudo (como BEDCA). Para comprar se suma lo que se tira (piel, espinas, hueso) con la fracción comestible de BEDCA; los huevos se cuentan de talla M. Del almacén se descuenta lo apuntado en g, kg o L
            con el mismo nombre; si está en unidades o paquetes, se avisa para que lo reviséis.
            {needs.skippedLeftovers + needs.skippedOut > 0 && ` No se cuentan ${needs.skippedLeftovers + needs.skippedOut} platos de sobras o de comer fuera.`}
          </p>
        </>
      )}
      {err && <p className="mt-2 text-bad">{err}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {oldMenu.length > 0 && <span className="mr-auto text-xs text-muted">Sustituye los {oldMenu.length} productos del menú que aún no están comprados.</span>}
        <button className={btnGhost} onClick={onClose}>
          Cancelar
        </button>
        <button className={btnPrimary} disabled={busy || loading || buy.length === 0} onClick={apply}>
          {busy ? 'Añadiendo…' : `Añadir ${buy.length} a la lista`}
        </button>
      </div>
    </Modal>
  )
}

function NeedList({ title, lines, muted = false }: { title: string; lines: NeedLine[]; muted?: boolean }) {
  return (
    <div className={`mb-3 ${muted ? 'opacity-70' : ''}`}>
      <h3 className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">{title}</h3>
      <div className="flex flex-col">
        {lines.map((l) => (
          <div key={l.key} className="grid grid-cols-[1fr_auto] gap-x-3 border-t border-line py-1.5 text-sm first:border-t-0">
            <span>
              <b className="font-semibold">{l.name}</b> <span className="text-xs text-muted">· {l.section}</span>
              <span className="block text-xs text-muted">{needNote(l)}</span>
            </span>
            <span className="num text-right font-semibold">{l.covered ? '✓' : qtyLabel(l.qty, l.unit)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

