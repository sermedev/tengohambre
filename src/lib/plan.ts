import { db } from './db'
import { addTo, factorOf, planItemServing, zero, type Lookup, type Nut } from './nutrition'
import type { EatOut, MealId, Member, PlanItem } from './types'

/** Lo que se puede poner en un hueco del menú. */
export type Source = { kind: 'r'; id: string } | { kind: 's'; id: string } | { kind: 'o'; id: EatOut }

export const sourceKey = (s: Source) => `${s.kind}:${s.id}`
export function parseSource(k: string): Source | null {
  const [kind, id] = [k.slice(0, 1), k.slice(2)]
  if (kind === 'r' || kind === 's') return { kind, id }
  if (kind === 'o' && (id === 'ligero' || id === 'normal' || id === 'copioso')) return { kind, id }
  return null
}

export async function addToSlot(src: Source, day: string, meal: MealId, slotItems: PlanItem[], L: Lookup) {
  const position = slotItems.length ? Math.max(...slotItems.map((i) => i.position)) + 1 : 0
  const row: Partial<PlanItem> = { day, meal, position, portions: {} }
  if (src.kind === 'r') row.recipe_id = src.id
  else if (src.kind === 'o') row.eat_out = src.id
  else {
    const p = L.pantry.get(src.id)
    row.pantry_item_id = src.id
    row.recipe_id = p?.recipe_id ?? null
    row.label = p?.name ?? 'Sobras'
  }
  // Si en el hueco alguien ya está marcado como que no come, el plato nuevo lo respeta
  const first = slotItems[0]
  if (first) for (const [mid, f] of Object.entries(first.portions ?? {})) if (Number(f) === 0) row.portions![mid] = 0
  await db.insert<PlanItem>('meal_plan_items', [row])
}

export async function moveItem(it: PlanItem, day: string, meal: MealId, slotItems: PlanItem[]) {
  if (it.day === day && it.meal === meal) return
  const position = slotItems.length ? Math.max(...slotItems.map((i) => i.position)) + 1 : 0
  await db.update('meal_plan_items', it.id, { day, meal, position })
}

/** Lo que come una persona en un día según el menú. */
export function personDay(items: PlanItem[], m: Member, L: Lookup): Nut {
  const t = zero()
  for (const it of items) {
    const f = factorOf(it, m)
    if (f > 0) addTo(t, planItemServing(it, L), f)
  }
  return t
}

/** ¿Come esta persona en esta comida? (si come de algún plato) */
export const eatsInSlot = (items: PlanItem[], m: Member) => items.some((it) => factorOf(it, m) > 0)

/** Marca para todo el hueco que una persona come (con su ración habitual) o no come. */
export async function toggleEater(items: PlanItem[], m: Member) {
  const eats = eatsInSlot(items, m)
  await Promise.all(
    items.map((it) => {
      const portions = { ...(it.portions ?? {}) }
      if (eats) portions[m.id] = 0
      else delete portions[m.id]
      return db.update('meal_plan_items', it.id, { portions })
    }),
  )
}

export async function setPortion(it: PlanItem, m: Member, f: number) {
  const portions = { ...(it.portions ?? {}) }
  if (f === Number(m.default_portion)) delete portions[m.id]
  else portions[m.id] = f
  await db.update('meal_plan_items', it.id, { portions })
}
