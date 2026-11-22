import type { EatOut, MealId, PlanItem } from './types'
import { addDays } from './dates.ts'

/*
 * Menús semanales tipo (plantillas): una semana entera de menú guardada con un nombre.
 * Cada plato se guarda por día de la semana (lunes = 0) en vez de por fecha, así se puede poner en cualquier semana.
 * - Recetas, precocinados y comidas fuera de casa se guardan tal cual, con quién come y su ración.
 * - Las sobras del almacén se guardan como su receta (la semana que se aplique habrá que cocinarla),
 *   o solo con su nombre si no venían de una receta. Así no dependen de lo que haya hoy en el almacén.
 */

export type TemplateItem = {
  dow: number
  meal: MealId
  position: number
  recipe_id: string | null
  eat_out: EatOut | null
  label: string | null
  portions: Record<string, number>
}

export type MenuTemplate = {
  id: string
  household_id: string
  name: string
  items: TemplateItem[]
  created_at: string
  updated_at: string
}

const DAY_MS = 86_400_000
const dayIndex = (monday: string, day: string) => Math.round((Date.parse(day + 'T12:00:00Z') - Date.parse(monday + 'T12:00:00Z')) / DAY_MS)

/** Platos de una semana del menú → platos de la plantilla. */
export function fromWeek(items: PlanItem[], monday: string): TemplateItem[] {
  const out: TemplateItem[] = []
  for (const it of items) {
    const dow = dayIndex(monday, it.day)
    if (dow < 0 || dow > 6) continue
    const recipe_id = it.recipe_id ?? null
    const eat_out = it.eat_out ?? null
    const label = recipe_id || eat_out ? null : (it.label ?? null)
    if (!recipe_id && !eat_out && !label) continue
    out.push({ dow, meal: it.meal, position: it.position, recipe_id, eat_out, label, portions: { ...(it.portions ?? {}) } })
  }
  return out.sort((a, b) => a.dow - b.dow || a.meal.localeCompare(b.meal) || a.position - b.position)
}

/**
 * Platos de la plantilla → filas nuevas del menú para la semana que empieza en `monday`.
 * `existing` son los platos que se quedan en esa semana (vacío si se reemplaza): los nuevos van detrás de ellos.
 * Se saltan los platos cuya receta ya no existe.
 */
export function toWeek(tpl: TemplateItem[], monday: string, recipeExists: (id: string) => boolean, existing: PlanItem[] = []) {
  const next = new Map<string, number>()
  for (const e of existing) {
    const k = `${e.day}|${e.meal}`
    next.set(k, Math.max(next.get(k) ?? 0, e.position + 1))
  }
  const rows: Partial<PlanItem>[] = []
  let skipped = 0
  for (const t of [...tpl].sort((a, b) => a.dow - b.dow || a.position - b.position)) {
    if (t.recipe_id && !recipeExists(t.recipe_id)) {
      skipped++
      continue
    }
    const day = addDays(monday, t.dow)
    const k = `${day}|${t.meal}`
    const position = next.get(k) ?? 0
    next.set(k, position + 1)
    rows.push({ day, meal: t.meal, position, recipe_id: t.recipe_id, pantry_item_id: null, eat_out: t.eat_out, label: t.label, portions: { ...t.portions } })
  }
  return { rows, skipped }
}

/** «12 platos · 5 días» */
export function templateSummary(items: TemplateItem[]) {
  const days = new Set(items.map((i) => i.dow)).size
  return `${items.length} ${items.length === 1 ? 'plato' : 'platos'} · ${days} ${days === 1 ? 'día' : 'días'}`
}
