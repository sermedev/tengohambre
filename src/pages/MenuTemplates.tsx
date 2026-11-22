import { useCallback, useEffect, useState } from 'react'
import { db } from '../lib/db'
import { useData } from '../lib/data-context'
import { DSHORT } from '../lib/dates'
import { EAT_OUT } from '../lib/nutrition'
import { fromWeek, templateSummary, toWeek, type MenuTemplate, type TemplateItem } from '../lib/templates'
import { norm } from '../lib/text'
import type { PlanItem } from '../lib/types'
import { MEALS } from '../data/meals'
import type { Undo } from '../lib/plan'
import { Empty, Modal, btnGhost, btnPrimary, btnSm, input } from '../components/ui'

/**
 * Menús semanales tipo: guardar la semana que se ve como plantilla con nombre,
 * y aplicar una plantilla guardada a esa semana (reemplazando o añadiendo).
 */
export function MenuTemplates({ monday, weekLabel, items, onClose, onApplied }: { monday: string; weekLabel: string; items: PlanItem[]; onClose: () => void; onApplied: (msg: string, undo: Undo) => void }) {
  const { L } = useData()
  const [list, setList] = useState<MenuTemplate[] | null>(null)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [applying, setApplying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const load = useCallback(
    () =>
      db.list<MenuTemplate>('menu_templates').then(
        (r) => setList(r.sort((a, b) => a.name.localeCompare(b.name, 'es'))),
        (e) => {
          setError(friendly(e))
          setList([])
        },
      ),
    [],
  )
  useEffect(() => {
    void load()
    return db.subscribe('menu_templates', () => void load())
  }, [load])

  const weekItems = fromWeek(items, monday)
  const same = list?.find((t) => norm(t.name.trim()) === norm(name.trim()) && name.trim())

  async function run(f: () => Promise<void>) {
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      await f()
    } catch (e) {
      setError(friendly(e))
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    run(async () => {
      const n = name.trim()
      if (same) await db.update('menu_templates', same.id, { name: n, items: weekItems })
      else await db.insert<MenuTemplate>('menu_templates', [{ name: n, items: weekItems }])
      setMsg(same ? `«${n}» actualizado con esta semana.` : `Guardado «${n}».`)
      setName('')
      await load()
    })

  const apply = (t: MenuTemplate, mode: 'reemplazar' | 'añadir') =>
    run(async () => {
      const keep = mode === 'añadir' ? items : []
      const { rows, skipped } = toWeek(t.items, monday, (id) => L.recipes.has(id), keep)
      const removed = mode === 'reemplazar' ? items : []
      if (removed.length) await db.remove('meal_plan_items', removed.map((i) => i.id))
      const added = rows.length ? await db.insert<PlanItem>('meal_plan_items', rows) : []
      const extra = skipped ? ` (${skipped} ${skipped === 1 ? 'plato no se puso porque su receta' : 'platos no se pusieron porque su receta'} ya no existe)` : ''
      onApplied(`Aplicado «${t.name}»: ${rows.length} ${rows.length === 1 ? 'plato' : 'platos'}${mode === 'añadir' && items.length ? ', además de los que ya había' : ''}${extra}.`, { added: added.map((a) => a.id), removed })
    })

  const remove = (t: MenuTemplate) =>
    run(async () => {
      await db.remove('menu_templates', [t.id])
      setDeleting(null)
      setMsg(`Borrado «${t.name}».`)
      await load()
    })

  return (
    <Modal title="Menús tipo" onClose={onClose}>
      <p className="mb-4 text-sm text-muted">Guarda una semana que os guste y vuelve a ponerla cuando queráis. Se guardan los platos, quién come y las raciones.</p>

      <h3 className="mb-1 text-base">Guardar {weekLabel.toLowerCase()}</h3>
      {weekItems.length ? (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim() && !busy) void save()
          }}
        >
          <input className={input} placeholder="Nombre, p. ej. «Semana de invierno»" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Nombre del menú tipo" />
          <button className={`${btnPrimary} shrink-0`} disabled={!name.trim() || busy}>
            {same ? 'Sustituir' : 'Guardar'}
          </button>
        </form>
      ) : (
        <Empty>Esta semana está vacía. Pon platos en el menú para poder guardarla.</Empty>
      )}
      {same && <p className="mt-1 text-xs text-muted">Ya hay un menú tipo con ese nombre: se sustituirá por esta semana.</p>}
      {weekItems.length > 0 && <p className="mt-1 text-xs text-muted">Esta semana tiene {templateSummary(weekItems)}. Las sobras del almacén se guardan como su receta.</p>}

      {msg && <p className="mt-3 rounded-xl bg-ok-soft px-3 py-2 text-sm text-ok">{msg}</p>}
      {error && <p className="mt-3 rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}

      <h3 className="mt-5 mb-2 text-base">Vuestros menús tipo</h3>
      {list === null ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : list.length === 0 ? (
        <Empty>Aún no hay ninguno guardado.</Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((t) => (
            <div key={t.id} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2">
                <button className="min-w-0 flex-1 text-left" onClick={() => setOpen(open === t.id ? null : t.id)} aria-expanded={open === t.id}>
                  <b className="block font-semibold">{t.name}</b>
                  <span className="block text-sm text-muted">
                    {templateSummary(t.items)} · {open === t.id ? 'ocultar platos' : 'ver platos'}
                  </span>
                </button>
                {applying !== t.id && deleting !== t.id && (
                  <>
                    <button
                      className={`${btnSm} bg-accent text-accent-ink`}
                      disabled={busy}
                      onClick={() => (items.length ? setApplying(t.id) : void apply(t, 'añadir'))}
                    >
                      Poner en esta semana
                    </button>
                    <button className={`${btnSm} text-muted`} disabled={busy} onClick={() => setDeleting(t.id)} aria-label={`Borrar ${t.name}`}>
                      Borrar
                    </button>
                  </>
                )}
              </div>
              {applying === t.id && (
                <div className="mt-2 flex flex-col gap-2 rounded-lg bg-surface-2 p-2">
                  <span className="text-sm">Esta semana ya tiene {items.length} {items.length === 1 ? 'plato' : 'platos'}. ¿Qué hacemos con ellos?</span>
                  <div className="flex flex-wrap gap-2">
                    <button className={`${btnSm} bg-accent text-accent-ink`} disabled={busy} onClick={() => void apply(t, 'reemplazar')}>
                      Reemplazarlos
                    </button>
                    <button className={`${btnSm} border border-line bg-surface`} disabled={busy} onClick={() => void apply(t, 'añadir')}>
                      Añadir sin quitar nada
                    </button>
                    <button className={`${btnSm} text-muted`} onClick={() => setApplying(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {deleting === t.id && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 p-2">
                  <span className="text-sm">¿Borrar «{t.name}»? El menú de las semanas donde ya lo pusiste no cambia.</span>
                  <button className={`${btnSm} border border-line bg-surface text-bad`} disabled={busy} onClick={() => void remove(t)}>
                    Sí, borrar
                  </button>
                  <button className={`${btnSm} text-muted`} onClick={() => setDeleting(null)}>
                    No
                  </button>
                </div>
              )}
              {open === t.id && <Preview items={t.items} />}
            </div>
          ))}
        </div>
      )}
      <button className={`${btnGhost} mt-5 w-full`} onClick={onClose}>
        Cerrar
      </button>
    </Modal>
  )
}

function Preview({ items }: { items: TemplateItem[] }) {
  const { L } = useData()
  const nameOf = (i: TemplateItem) => (i.recipe_id ? (L.recipes.get(i.recipe_id)?.name ?? 'Receta borrada') : i.eat_out ? `Fuera de casa · ${EAT_OUT[i.eat_out].name.toLowerCase()}` : (i.label ?? ''))
  return (
    <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2 text-sm">
      {DSHORT.map((d, dow) => {
        const meals = MEALS.map((m) => ({ m, its: items.filter((i) => i.dow === dow && i.meal === m.id).sort((a, b) => a.position - b.position) })).filter((x) => x.its.length)
        if (!meals.length) return null
        return (
          <div key={d} className="flex gap-2">
            <b className="w-9 shrink-0 font-semibold">{d}</b>
            <span className="min-w-0 text-muted">
              {meals.map(({ m, its }, k) => (
                <span key={m.id}>
                  {k > 0 && ' · '}
                  <span className="text-ink">{m.name}:</span> {its.map(nameOf).join(', ')}
                </span>
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function friendly(e: unknown) {
  const m = (e as Error).message ?? String(e)
  if (/menu_templates/.test(m) && /(does not exist|not find|schema cache)/i.test(m)) return 'Falta preparar la base de datos para los menús tipo: hay que ejecutar supabase/migrations/0005_plantillas.sql en Supabase.'
  return m
}
