import { useMemo, useState, type ReactNode } from 'react'
import { DndContext, DragOverlay, PointerSensor, pointerWithin, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { db } from '../lib/db'
import { useData, usePlan } from '../lib/data-context'
import { DSHORT, MONTHS, addDays, dayLabel, mondayOf, parseIso, todayIso } from '../lib/dates'
import { EAT_OUT, PORTION_STEPS, factorOf, fmt, fmtPortion, planItemIcon, planItemName, planItemServing, recipeServing } from '../lib/nutrition'
import { addToSlot, eatsInSlot, moveItem, parseSource, personDay, setPortion, sourceKey, toggleEater, type Source } from '../lib/plan'
import { targetOf } from '../lib/targets'
import type { EatOut, MealId, Member, PlanItem } from '../lib/types'
import { GROUPS, MEALS, mealName } from '../data/meals'
import { Avatar } from '../components/Avatar'
import { MacroLine } from '../components/NutTable'
import { Bar, Card, Empty, Modal, PageTitle, Tabs, btnGhost, btnPrimary, btnSm, input } from '../components/ui'
import { norm } from '../lib/text'
import { ageInfo, pantryIcon, qtyText } from '../lib/pantry'

const slotOf = (items: PlanItem[], day: string, meal: MealId) => items.filter((i) => i.day === day && i.meal === meal)

export function Menu() {
  const [tab, setTab] = useState<'hoy' | 'semana'>('hoy')
  return (
    <>
      <Tabs tabs={[['hoy', 'Hoy'], ['semana', 'Semana']]} value={tab} onChange={setTab} />
      {tab === 'hoy' ? <Hoy /> : <Semana />}
    </>
  )
}

// ───────── Hoy ─────────
function Hoy() {
  const day = todayIso()
  const { members, weights, L } = useData()
  const { items, loading } = usePlan(day, day)
  const [slot, setSlot] = useState<MealId | null>(null)

  return (
    <>
      <PageTitle sub={dayLabel(day)}>Hoy</PageTitle>
      <div className="mb-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {members.map((m) => {
          const t = personDay(items, m, L)
          const tg = targetOf(m, weights)
          return (
            <Card key={m.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Avatar m={m} />
                <b>{m.name}</b>
                <span className="flex-1" />
                {tg && <span className="text-xs font-semibold" style={{ color: `var(${m.color})` }}>{tg.goalName}</span>}
              </div>
              <div className="num text-xl font-bold">
                {fmt(t.kcal)} <span className="text-sm font-normal text-muted">/ {tg ? `${fmt(tg.kcal)} kcal` : 'sin objetivo'}</span>
              </div>
              <Bar value={t.kcal} target={tg?.kcal ?? 0} color={`var(${m.color})`} />
              <div className="text-sm text-muted">
                Proteína <b className="text-ink">{fmt(t.protein_g)}</b>
                {tg ? ` / ${tg.prot}` : ''} g · <MacroLine n={t} protein={false} />
              </div>
            </Card>
          )
        })}
      </div>
      <p className="mb-5 text-sm text-muted">
        Lo que come cada uno según el menú de hoy, quitando a quien no come. La raya marca su objetivo orientativo
        {members.some((m) => !targetOf(m, weights)) ? ' (para calcularlo, completa su peso y altura en Seguimiento)' : ''}.
      </p>

      <h2 className="mb-3 text-lg">Comidas de hoy</h2>
      {loading ? (
        <p className="text-muted">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {MEALS.map((meal) => {
            const its = slotOf(items, day, meal.id)
            return (
              <Card key={meal.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold tracking-wider text-muted uppercase">{meal.name}</span>
                  <button className="text-sm font-semibold text-accent" onClick={() => setSlot(meal.id)}>
                    {its.length ? 'Editar comida' : '+ Elegir plato'}
                  </button>
                </div>
                {its.length > 0 && (
                  <>
                    <div className="flex flex-col gap-1">
                      {its.map((it) => (
                        <div key={it.id} className="flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">
                            {planItemIcon(it, L)}
                          </span>
                          <span className="flex-1">
                            <b className="font-semibold">{planItemName(it, L)}</b>
                            <span className="block text-sm text-muted">
                              {fmt(planItemServing(it, L).kcal)} kcal por ración de adulto{it.pantry_item_id ? ' · del almacén' : ''}
                              {it.eat_out ? ' · estimación' : ''}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <Eaters items={its} members={members} />
                  </>
                )}
              </Card>
            )
          })}
        </div>
      )}
      {slot && <SlotEditor day={day} meal={slot} items={slotOf(items, day, slot)} onClose={() => setSlot(null)} />}
    </>
  )
}

/** Fila de personas: tocar una marca que no come (o que vuelve a comer) en toda la comida. */
function Eaters({ items, members }: { items: PlanItem[]; members: Member[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {members.map((m) => {
        const on = eatsInSlot(items, m)
        const f = items.length ? factorOf(items[0], m) : 0
        return (
          <button
            key={m.id}
            aria-pressed={on}
            onClick={() => void toggleEater(items, m)}
            className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-3 pl-0.5 text-sm font-medium ${on ? 'border-line bg-surface' : 'border-dashed border-line text-muted line-through'}`}
            title={on ? 'Toca si no come' : 'Toca si come'}
          >
            <Avatar m={m} size={24} off={!on} />
            {m.name}
            {on ? ` · ${fmtPortion(f)}` : ''}
          </button>
        )
      })}
    </div>
  )
}

// ───────── Semana ─────────
function Semana() {
  const { L, members, weights, recipes, pantry } = useData()
  const [monday, setMonday] = useState(mondayOf(todayIso()))
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday])
  const { items, reload } = usePlan(monday, days[6])
  const [slot, setSlot] = useState<{ day: string; meal: MealId } | null>(null)
  const [mDay, setMDay] = useState(() => {
    const t = todayIso()
    return days.includes(t) ? t : monday
  })
  const [drag, setDrag] = useState<{ label: string; icon: string } | null>(null)
  const [copyMsg, setCopyMsg] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }))
  const today = todayIso()
  const a = parseIso(days[0])
  const b = parseIso(days[6])

  function onStart(e: DragStartEvent) {
    setDrag((e.active.data.current as { label: string; icon: string }) ?? null)
  }
  async function onEnd(e: DragEndEvent) {
    setDrag(null)
    const over = e.over?.id as string | undefined
    const id = e.active.id as string
    if (!over) return
    if (over === 'trash') {
      if (id.startsWith('i:')) {
        await db.remove('meal_plan_items', [id.slice(2)])
        await reload()
      }
      return
    }
    const [, day, meal] = over.split('|') as [string, string, MealId]
    const slotItems = slotOf(items, day, meal)
    if (id.startsWith('i:')) {
      const it = items.find((x) => x.id === id.slice(2))
      if (it) await moveItem(it, day, meal, slotItems)
    } else {
      const src = parseSource(id)
      if (src) await addToSlot(src, day, meal, slotItems, L)
    }
    await reload()
  }

  async function copyPrev() {
    const prev = await db.list<PlanItem>('meal_plan_items', { col: 'day', from: addDays(monday, -7), to: addDays(monday, -1) })
    if (!prev.length) return setCopyMsg('La semana anterior está vacía.')
    await db.insert<PlanItem>(
      'meal_plan_items',
      prev.map((p) => ({ day: addDays(p.day, 7), meal: p.meal, position: p.position + 100, recipe_id: p.recipe_id, pantry_item_id: null, eat_out: p.eat_out, label: p.recipe_id || p.eat_out ? null : p.label, portions: p.portions })).filter((p) => p.recipe_id || p.eat_out || p.label),
    )
    setCopyMsg(`Copiados ${prev.length} platos de la semana anterior.`)
    await reload()
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onStart} onDragEnd={(e) => void onEnd(e)} onDragCancel={() => setDrag(null)}>
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <PageTitle>
              Del {a.getDate()}
              {a.getMonth() !== b.getMonth() ? ` de ${MONTHS[a.getMonth()]}` : ''} al {b.getDate()} de {MONTHS[b.getMonth()]}
            </PageTitle>
            <div className="mb-4 flex flex-wrap gap-2">
              <button className={btnGhost} aria-label="Semana anterior" onClick={() => setMonday(addDays(monday, -7))}>
                ‹
              </button>
              <button className={btnGhost} onClick={() => setMonday(mondayOf(today))}>
                Esta semana
              </button>
              <button className={btnGhost} aria-label="Semana siguiente" onClick={() => setMonday(addDays(monday, 7))}>
                ›
              </button>
              <button className={btnGhost} onClick={() => void copyPrev()}>
                Copiar semana anterior
              </button>
            </div>
          </div>
          {copyMsg && <p className="-mt-2 mb-3 text-sm text-muted">{copyMsg}</p>}

          {/* PC y tablet horizontal: cuadrícula de la semana */}
          <div className="hidden overflow-x-auto lg:block">
            <div className="grid min-w-[760px] grid-cols-[110px_repeat(7,minmax(0,1fr))] gap-1.5">
              <div />
              {days.map((d, i) => (
                <div key={d} className={`rounded-lg py-1 text-center text-sm font-semibold ${d === today ? 'bg-accent text-accent-ink' : 'text-muted'}`}>
                  {DSHORT[i]} <span className="num">{parseIso(d).getDate()}</span>
                </div>
              ))}
              {MEALS.map((m) => (
                <Row key={m.id} label={m.name}>
                  {days.map((d) => (
                    <Cell key={d} day={d} meal={m.id} items={slotOf(items, d, m.id)} onOpen={() => setSlot({ day: d, meal: m.id })} draggableItems />
                  ))}
                </Row>
              ))}
            </div>
          </div>

          {/* Móvil: un día cada vez */}
          <div className="lg:hidden">
            <div role="tablist" className="mb-3 grid grid-cols-7 gap-1">
              {days.map((d, i) => (
                <button
                  key={d}
                  role="tab"
                  aria-selected={mDay === d}
                  onClick={() => setMDay(d)}
                  className={`flex flex-col items-center rounded-xl py-1.5 text-xs font-semibold ${mDay === d ? 'bg-accent text-accent-ink' : d === today ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted'}`}
                >
                  {DSHORT[i]}
                  <b className="num text-base">{parseIso(d).getDate()}</b>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {MEALS.map((m) => (
                <div key={m.id}>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">{m.name}</div>
                  <Cell day={days.includes(mDay) ? mDay : days[0]} meal={m.id} items={slotOf(items, days.includes(mDay) ? mDay : days[0], m.id)} onOpen={() => setSlot({ day: days.includes(mDay) ? mDay : days[0], meal: m.id })} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">Toca una comida para elegir platos y quién come. En PC o tablet en horizontal puedes arrastrar recetas.</p>
          </div>

          <Balance items={items} days={days} members={members} weights={weights} />
        </div>

        <Panel recipes={recipes} pantry={pantry} />
      </div>

      <DragOverlay>
        {drag && (
          <div className="flex items-center gap-2 rounded-xl border border-accent bg-surface px-3 py-2 text-sm font-semibold shadow-card">
            <span aria-hidden="true">{drag.icon}</span>
            {drag.label}
          </div>
        )}
      </DragOverlay>
      {slot && <SlotEditor day={slot.day} meal={slot.meal} items={slotOf(items, slot.day, slot.meal)} onClose={() => setSlot(null)} onChange={reload} />}
    </DndContext>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div className="flex items-start pt-2 text-xs font-semibold tracking-wider text-muted uppercase">{label}</div>
      {children}
    </>
  )
}

function Cell({ day, meal, items, onOpen, draggableItems = false }: { day: string; meal: MealId; items: PlanItem[]; onOpen: () => void; draggableItems?: boolean }) {
  const { L } = useData()
  // En móvil no se arrastra: su copia del hueco no debe registrarse con el mismo id que la de PC
  const { setNodeRef, isOver } = useDroppable({ id: `${draggableItems ? 'cell' : 'mcell'}|${day}|${meal}`, disabled: !draggableItems })
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-16 flex-col gap-1 rounded-xl border p-1.5 ${isOver ? 'border-accent bg-accent-soft' : 'border-line bg-surface'}`}
    >
      {items.map((it) => (draggableItems ? <DragItem key={it.id} it={it} onOpen={onOpen} /> : <ItemChip key={it.id} icon={planItemIcon(it, L)} name={planItemName(it, L)} onClick={onOpen} />))}
      <button onClick={onOpen} className={`rounded-lg text-left text-xs font-semibold text-muted hover:text-accent ${items.length ? 'px-1.5 py-0.5' : 'flex-1 px-1.5 py-2'}`} aria-label={`Editar ${mealName(meal)} del ${dayLabel(day)}`}>
        {items.length ? '+ / editar' : '+ Añadir'}
      </button>
    </div>
  )
}

function ItemChip({ icon, name, onClick }: { icon: string; name: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-start gap-1.5 rounded-lg bg-surface-2 px-1.5 py-1 text-left text-xs leading-tight font-medium">
      <span aria-hidden="true">{icon}</span>
      <span className="min-w-0 break-words">{name}</span>
    </button>
  )
}

function DragItem({ it, onOpen }: { it: PlanItem; onOpen: () => void }) {
  const { L } = useData()
  const label = planItemName(it, L)
  const icon = planItemIcon(it, L)
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: `i:${it.id}`, data: { label, icon } })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`touch-none ${isDragging ? 'opacity-40' : ''}`}>
      <ItemChip icon={icon} name={label} onClick={onOpen} />
    </div>
  )
}

// ───────── Panel lateral con lo que se puede arrastrar (PC) ─────────
function Panel({ recipes, pantry }: { recipes: ReturnType<typeof useData>['recipes']; pantry: ReturnType<typeof useData>['pantry'] }) {
  const { L } = useData()
  const [tab, setTab] = useState<'r' | 's' | 'o'>('r')
  const [q, setQ] = useState('')
  const k = norm(q.trim())
  const { setNodeRef: trashRef, isOver: trashOver } = useDroppable({ id: 'trash' })
  return (
    <aside className="sticky top-4 hidden max-h-[calc(100dvh-2rem)] w-72 shrink-0 flex-col gap-3 self-start lg:flex" aria-label="Recetas para arrastrar">
      <Tabs tabs={[['r', 'Recetas'], ['s', 'Almacén'], ['o', 'Fuera']]} value={tab} onChange={setTab} />
      {tab !== 'o' && <input className={`${input} -mt-2`} placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en el panel" />}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {tab === 'r' &&
          (recipes.length ? (
            recipes
              .filter((r) => !k || norm(r.name).includes(k))
              .map((r) => <PanelItem key={r.id} src={{ kind: 'r', id: r.id }} icon={r.icon} label={r.name} sub={`${fmt(recipeServing(r, L).kcal)} kcal${r.kind === 'precocinado' ? ' · precocinado' : r.minutes ? ` · ${r.minutes} min` : ''}`} />)
          ) : (
            <Empty>Añade recetas en la sección Recetas.</Empty>
          ))}
        {tab === 's' &&
          (pantry.filter((p) => p.unit === 'raciones' && p.qty > 0).length ? (
            pantry
              .filter((p) => p.unit === 'raciones' && p.qty > 0 && (!k || norm(p.name).includes(k)))
              .map((p) => <PanelItem key={p.id} src={{ kind: 's', id: p.id }} icon={pantryIcon(p, p.recipe_id ? L.recipes.get(p.recipe_id)?.icon : undefined)} label={p.name} sub={`${qtyText(p)} · ${p.place} · ${ageInfo(p).text}`} />)
          ) : (
            <Empty>No hay platos cocinados en el almacén.</Empty>
          ))}
        {tab === 'o' && (Object.keys(EAT_OUT) as EatOut[]).map((o) => <PanelItem key={o} src={{ kind: 'o', id: o }} icon="🍽️" label={`Fuera · ${EAT_OUT[o].name.toLowerCase()}`} sub={`~${fmt(EAT_OUT[o].nut.kcal ?? 0)} kcal · ${EAT_OUT[o].desc}`} />)}
      </div>
      <div ref={trashRef} className={`rounded-xl border-2 border-dashed p-3 text-center text-sm ${trashOver ? 'border-bad bg-bad-soft text-bad' : 'border-line text-muted'}`}>
        Suelta aquí para quitar del menú
      </div>
      <p className="text-xs text-muted">Arrastra una receta a un hueco para añadirla (puedes poner varias). Arrastra un plato del menú a otro hueco para moverlo.</p>
    </aside>
  )
}

function PanelItem({ src, icon, label, sub }: { src: Source; icon: string; label: string; sub: string }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: sourceKey(src), data: { label, icon } })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`flex cursor-grab touch-none items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-2 ${isDragging ? 'opacity-40' : ''}`}>
      <span className="text-xl" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <b className="block truncate text-sm font-semibold">{label}</b>
        <span className="block truncate text-xs text-muted">{sub}</span>
      </span>
    </div>
  )
}

// ───────── Equilibrio de la semana ─────────
function Balance({ items, days, members, weights }: { items: PlanItem[]; days: string[]; members: Member[]; weights: ReturnType<typeof useData>['weights'] }) {
  const { L } = useData()
  const counts: Record<string, number> = {}
  for (const it of items) {
    const rid = it.recipe_id ?? (it.pantry_item_id ? L.pantry.get(it.pantry_item_id)?.recipe_id : null)
    const r = rid ? L.recipes.get(rid) : undefined
    for (const g of r?.groups ?? []) counts[g] = (counts[g] ?? 0) + 1
  }
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      <Card>
        <h2 className="text-lg">Equilibrio de la semana</h2>
        <p className="mb-3 text-sm text-muted">Veces que aparece cada grupo en el menú. Orientativo, con las frecuencias recomendadas por AESAN.</p>
        <div className="flex flex-col gap-2.5">
          {GROUPS.filter((g) => g.min || g.max).map((g) => {
            const v = counts[g.k] ?? 0
            const ok = g.max != null ? v <= g.max : v >= (g.min ?? 0)
            const close = g.min != null && v >= g.min * 0.6
            const tone = ok ? 'ok' : close ? 'warn' : 'bad'
            const ref = g.max != null ? g.max * 1.5 : g.min!
            return (
              <div key={g.k}>
                <div className="flex justify-between gap-2 text-sm">
                  <b className="font-semibold">{g.n}</b>
                  <span className={`text-${tone} font-semibold`}>{g.max != null ? (ok ? 'Bien' : 'Demasiado') : ok ? 'Bien' : `Faltan ${(g.min ?? 0) - v}`}</span>
                </div>
                <div className="my-1 h-1.5 rounded-full bg-surface-2">
                  <i className="block h-full rounded-full" style={{ width: `${Math.min(v / ref, 1) * 100}%`, background: `var(--${tone})` }} />
                </div>
                <div className="num text-xs text-muted">
                  {v} en el menú · {g.hint}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      <Card>
        <h2 className="text-lg">Media diaria por persona</h2>
        <p className="mb-3 text-sm text-muted">Calorías del menú de esta semana entre 7 días, frente a su objetivo.</p>
        <div className="flex flex-col gap-3">
          {members.map((m) => {
            const k = days.reduce((a, d) => a + personDay(items.filter((i) => i.day === d), m, L).kcal, 0) / 7
            const tg = targetOf(m, weights)
            return (
              <div key={m.id}>
                <div className="mb-1 flex items-center gap-2 text-sm">
                  <Avatar m={m} size={22} />
                  <b>{m.name}</b>
                  <span className="num ml-auto">
                    <b>{fmt(k)}</b> <span className="text-muted">/ {tg ? `${fmt(tg.kcal)} kcal` : '—'}</span>
                  </span>
                </div>
                <Bar value={k} target={tg?.kcal ?? 0} color={`var(${m.color})`} />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ───────── Editar un hueco del menú ─────────
function SlotEditor({ day, meal, items, onClose, onChange }: { day: string; meal: MealId; items: PlanItem[]; onClose: () => void; onChange?: () => Promise<void> }) {
  const { L, members } = useData()
  const [picking, setPicking] = useState(items.length === 0)
  const refresh = async () => {
    await onChange?.()
  }

  return (
    <Modal title={`${mealName(meal)} · ${dayLabel(day)}`} onClose={onClose} wide>
      {MEALS.find((m) => m.id === meal)?.hint && <p className="mb-3 text-sm text-muted">{MEALS.find((m) => m.id === meal)!.hint}</p>}
      {items.length > 0 && (
        <>
          <h3 className="mb-1 text-base">Quién come</h3>
          <Eaters items={items} members={members} />
          <div className="mt-4 flex flex-col gap-3">
            {items.map((it) => {
              const n = planItemServing(it, L)
              return (
                <Card key={it.id} className="flex flex-col gap-2 bg-surface-2">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl" aria-hidden="true">
                      {planItemIcon(it, L)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="font-semibold">{planItemName(it, L)}</b>
                      <div className="text-sm text-muted">
                        {fmt(n.kcal)} kcal por ración de adulto
                        {it.eat_out ? ' · estimación' : ''}
                        {it.pantry_item_id ? ' · del almacén' : ''}
                      </div>
                    </div>
                    <button
                      className={`${btnSm} text-muted`}
                      aria-label="Quitar del menú"
                      onClick={async () => {
                        await db.remove('meal_plan_items', [it.id])
                        await refresh()
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => {
                      const f = factorOf(it, m)
                      return (
                        <label key={m.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pr-1 pl-0.5 text-sm">
                          <Avatar m={m} size={22} off={f === 0} />
                          <span className="sr-only">Ración de {m.name}</span>
                          <select
                            className="rounded-full bg-transparent py-0.5 pr-1 font-medium"
                            value={String(f)}
                            onChange={async (e) => {
                              await setPortion(it, m, Number(e.target.value))
                              await refresh()
                            }}
                          >
                            <option value="0">{m.name}: no come</option>
                            {[...new Set([...PORTION_STEPS, f, Number(m.default_portion)])]
                              .filter((x) => x > 0)
                              .sort((a, b) => a - b)
                              .map((x) => (
                                <option key={x} value={String(x)}>
                                  {m.name}: {fmtPortion(x)}
                                  {x === Number(m.default_portion) ? ' (habitual)' : ''}
                                </option>
                              ))}
                          </select>
                        </label>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted">La ración «1» es la de un adulto. Cada uno tiene su ración habitual en Seguimiento; aquí la cambias solo para este plato.</p>
        </>
      )}
      {picking ? (
        <Picker
          onPick={async (src) => {
            await addToSlot(src, day, meal, items, L)
            await refresh()
            setPicking(false)
          }}
          meal={meal}
        />
      ) : (
        <button className={`${btnPrimary} mt-4`} onClick={() => setPicking(true)}>
          + Añadir otro plato
        </button>
      )}
    </Modal>
  )
}

function Picker({ onPick, meal }: { onPick: (s: Source) => void; meal: MealId }) {
  const { recipes, pantry, L } = useData()
  const [tab, setTab] = useState<'r' | 's' | 'o'>('r')
  const [q, setQ] = useState('')
  const [all, setAll] = useState(false)
  const k = norm(q.trim())
  const rs = recipes.filter((r) => (!k || norm(r.name).includes(k)) && (all || k || !r.meals.length || r.meals.includes(meal)))
  const ps = pantry.filter((p) => p.unit === 'raciones' && p.qty > 0 && (!k || norm(p.name).includes(k)))
  return (
    <div className="mt-5 border-t border-line pt-4">
      <h3 className="mb-2 text-base">Añadir plato</h3>
      <Tabs tabs={[['r', 'Recetas'], ['s', 'Almacén'], ['o', 'Fuera de casa']]} value={tab} onChange={setTab} />
      {tab !== 'o' && <input className={`${input} mb-3`} placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar plato" />}
      <div className="flex flex-col gap-1.5">
        {tab === 'r' && (
          <>
            {rs.map((r) => (
              <PickRow key={r.id} icon={r.icon} label={r.name} sub={`${fmt(recipeServing(r, L).kcal)} kcal/ración${r.kind === 'precocinado' ? ' · precocinado' : ''}`} onClick={() => onPick({ kind: 'r', id: r.id })} />
            ))}
            {!rs.length && <Empty>{recipes.length ? 'No hay recetas para esta comida con ese nombre.' : 'Aún no tienes recetas: añádelas en Recetas (las Sugeridas son un buen comienzo).'}</Empty>}
            {!all && !k && recipes.length > rs.length && (
              <button className="self-start text-sm font-semibold text-accent" onClick={() => setAll(true)}>
                Ver también recetas de otras comidas
              </button>
            )}
          </>
        )}
        {tab === 's' &&
          (ps.length ? (
            ps.map((p) => <PickRow key={p.id} icon={pantryIcon(p, p.recipe_id ? L.recipes.get(p.recipe_id)?.icon : undefined)} label={p.name} sub={`${qtyText(p)} · ${p.place} · ${ageInfo(p).text}`} onClick={() => onPick({ kind: 's', id: p.id })} />)
          ) : (
            <Empty>No hay platos cocinados en el almacén. Apúntalos en Almacén → Nevera y congelador.</Empty>
          ))}
        {tab === 'o' && (
          <>
            {(Object.keys(EAT_OUT) as EatOut[]).map((o) => (
              <PickRow key={o} icon="🍽️" label={`Fuera de casa · ${EAT_OUT[o].name.toLowerCase()}`} sub={`~${fmt(EAT_OUT[o].nut.kcal ?? 0)} kcal por adulto · ${EAT_OUT[o].desc}`} onClick={() => onPick({ kind: 'o', id: o })} />
            ))}
            <p className="text-xs text-muted">Es una estimación para llevar la cuenta del día. No se añade a la lista de la compra.</p>
          </>
        )}
      </div>
    </div>
  )
}

function PickRow({ icon, label, sub, onClick }: { icon: string; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-left hover:border-accent">
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <b className="block font-semibold">{label}</b>
        <span className="block text-sm text-muted">{sub}</span>
      </span>
    </button>
  )
}
