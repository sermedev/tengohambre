import type { Member, PantryItem, PlanItem, Recipe, RecipeIngredient, ShoppingItem } from './types'
import { CATALOG, SECTIONS, type Section } from '../data/catalog.ts'

/*
 * Lista de la compra a partir del menú.
 * - Recetas: gramos de toda la receta ÷ raciones de adulto × raciones que se comen (suma de la ración de cada persona).
 * - Precocinados: raciones que se comen → envases enteros.
 * - Sobras del almacén y comidas fuera de casa no suman.
 * - Se descuenta lo apuntado en Almacén con el mismo nombre (g, kg y L se restan; ud y paquetes solo se avisan,
 *   salvo los huevos y los platos/precocinados guardados por raciones).
 * - Las recetas llevan el peso de la parte comestible (como BEDCA); para comprar se pasa a peso con desperdicio
 *   (piel, espinas, hueso) usando la fracción comestible de BEDCA.
 */

/** Sin tildes ni mayúsculas (copia de lib/text para que este archivo no dependa de nada y se pueda probar solo). */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const STOP = new Set(['de', 'del', 'la', 'el', 'las', 'los', 'en', 'al', 'a', 'con', 'y', 'o', 'para', 'sin', 'fresco', 'fresca', 'frescos', 'frescas', 'natural', 'crudo', 'cruda', 'seco', 'seca', 'bote', 'lata', 'docena', 'paquete', 'kg', 'g', 'l'])

/** Una palabra en singular (suficiente para nombres de alimentos). */
function singular(w: string) {
  if (w.length > 4 && w.endsWith('ces')) return w.slice(0, -3) + 'z' // nueces → nuez
  if (w.length > 4 && w.endsWith('es') && /[rnldj]es$/.test(w)) return w.slice(0, -2) // macarrones → macarron
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1)
  return w
}

export function tokens(name: string) {
  return new Set(
    norm(name)
      .split(/[^a-z0-9ñ]+/)
      .filter((w) => w && !STOP.has(w) && !/^\d/.test(w))
      .map(singular),
  )
}

/** Dos nombres son el mismo producto si las palabras de uno están todas en el otro («Pollo» y «Pechuga de pollo»). */
export function sameProduct(a: string, b: string) {
  const A = tokens(a)
  const B = tokens(b)
  if (!A.size || !B.size) return false
  const [small, big] = A.size <= B.size ? [A, B] : [B, A]
  for (const w of small) if (!big.has(w)) return false
  return true
}

const CAT_LIST: [string, Section][] = SECTIONS.flatMap((s) => CATALOG[s].map((n) => [n, s] as [string, Section]))

/** Sección del supermercado para un nombre: la del producto del catálogo que coincide, o «Otros». */
export function sectionOf(name: string, saved: { name: string; section: string }[] = []): string {
  const exact = [...saved.map((p) => [p.name, p.section] as [string, string]), ...CAT_LIST].find(([n]) => norm(n) === norm(name))
  if (exact) return exact[1]
  const hit = [...saved.map((p) => [p.name, p.section] as [string, string]), ...CAT_LIST].find(([n]) => sameProduct(n, name))
  return hit?.[1] ?? 'Otros'
}

// Huevo talla M: 53–63 g con cáscara (Reglamento UE 589/2008); se toma el punto medio.
const EGG_M_G = 58
const isEgg = (name: string) => tokens(name).has('huevo')

export type Edible = (ref: string) => number | undefined

export type NeedLine = {
  key: string
  name: string
  section: string
  /** Lo que hay que comprar: gramos (peso de compra), unidades o envases. */
  qty: number
  unit: 'g' | 'ud' | 'envases'
  /** Gramos de parte comestible que pide el menú (antes de descontar). */
  needG?: number
  recipes: string[]
  /** Lo que se ha descontado del almacén, en texto. */
  fromPantry: string[]
  /** Hay algo en el almacén que no se puede restar solo (ud, paquetes): que lo revise la familia. */
  check: string[]
  covered: boolean
}

export type MenuNeeds = { lines: NeedLine[]; skippedOut: number; skippedLeftovers: number; missingRecipes: number }

type Ctx = {
  members: Member[]
  recipes: Map<string, Recipe>
  ingredients: Map<string, RecipeIngredient[]>
  pantry: PantryItem[]
  edible?: Edible
  saved?: { name: string; section: string }[]
}

const factorOf = (it: PlanItem, m: Member) => {
  const v = it.portions?.[m.id]
  return v == null ? Number(m.default_portion) : Number(v)
}

const round = (n: number, step: number) => Math.ceil(n / step - 1e-9) * step

export function menuNeeds(items: PlanItem[], c: Ctx): MenuNeeds {
  const ing = new Map<string, { name: string; grams: number; recipes: Set<string> }>()
  const packs = new Map<string, { r: Recipe; portions: number }>()
  let skippedOut = 0
  let skippedLeftovers = 0
  let missingRecipes = 0

  for (const it of items) {
    if (it.eat_out) {
      skippedOut++
      continue
    }
    if (it.pantry_item_id) {
      skippedLeftovers++
      continue
    }
    const r = it.recipe_id ? c.recipes.get(it.recipe_id) : undefined
    if (!r) {
      missingRecipes++
      continue
    }
    const eaten = c.members.reduce((a, m) => a + factorOf(it, m), 0)
    if (eaten <= 0) continue
    if (r.kind === 'precocinado') {
      const p = packs.get(r.id) ?? { r, portions: 0 }
      p.portions += eaten
      packs.set(r.id, p)
      continue
    }
    const servings = Number(r.servings) || 1
    for (const i of c.ingredients.get(r.id) ?? []) {
      const e = ing.get(i.food_ref) ?? { name: i.name, grams: 0, recipes: new Set<string>() }
      e.grams += (Number(i.grams) * eaten) / servings
      e.recipes.add(r.name)
      ing.set(i.food_ref, e)
    }
  }

  const stock = c.pantry.filter((p) => Number(p.qty) > 0)
  const lines: NeedLine[] = []

  for (const [ref, e] of ing) {
    if (e.grams <= 0) continue
    const egg = isEgg(e.name)
    let needG = e.grams
    const fromPantry: string[] = []
    const check: string[] = []
    for (const p of stock) {
      if (p.recipe_id || !sameProduct(p.name, e.name)) continue
      const q = Number(p.qty)
      let g: number | null = null
      if (p.unit === 'g') g = q
      else if (p.unit === 'kg' || p.unit === 'L') g = q * 1000
      else if (p.unit === 'ud' && egg) g = q * EGG_M_G * (c.edible?.(ref) ?? 1)
      if (g == null) {
        check.push(`${p.name}: ${fmtQty(q)} ${p.unit}`)
        continue
      }
      const used = Math.min(g, Math.max(needG, 0))
      if (used > 0) fromPantry.push(`${p.name} (${p.place.toLowerCase()})`)
      needG -= g
    }
    const covered = needG <= 0.5
    let qty: number
    let unit: NeedLine['unit']
    if (egg) {
      qty = covered ? 0 : Math.ceil(needG / (EGG_M_G * (c.edible?.(ref) ?? 1)) - 1e-9)
      unit = 'ud'
    } else {
      const ed = c.edible?.(ref)
      const gross = ed && ed >= 0.2 && ed < 1 ? needG / ed : needG
      qty = covered ? 0 : gross < 100 ? round(gross, 10) : round(gross, 50)
      unit = 'g'
    }
    lines.push({ key: ref, name: e.name, section: sectionOf(e.name, c.saved), qty, unit, needG: e.grams, recipes: [...e.recipes], fromPantry, check, covered })
  }

  for (const { r, portions } of packs.values()) {
    let left = portions
    const fromPantry: string[] = []
    const check: string[] = []
    const perPack = Number(r.pack_portions) || 1
    for (const p of stock) {
      if (p.recipe_id !== r.id && !(p.recipe_id == null && sameProduct(p.name, r.name))) continue
      const q = Number(p.qty)
      const have = p.unit === 'raciones' ? q : p.unit === 'paquetes' || p.unit === 'ud' ? q * perPack : null
      if (have == null) {
        check.push(`${p.name}: ${fmtQty(q)} ${p.unit}`)
        continue
      }
      if (left > 0) fromPantry.push(`${p.name} (${p.place.toLowerCase()})`)
      left -= have
    }
    const covered = left <= 0.01
    lines.push({
      key: `precocinado:${r.id}`,
      name: r.name,
      section: sectionOf(r.name, c.saved) === 'Otros' ? 'Platos preparados' : sectionOf(r.name, c.saved),
      qty: covered ? 0 : Math.ceil(left / perPack - 1e-9),
      unit: 'envases',
      recipes: [`${fmtQty(portions)} ${portions === 1 ? 'ración' : 'raciones'}`],
      fromPantry,
      check,
      covered,
    })
  }

  lines.sort((a, b) => SECTIONS.indexOf(a.section as Section) - SECTIONS.indexOf(b.section as Section) || a.name.localeCompare(b.name, 'es'))
  return { lines, skippedOut, skippedLeftovers, missingRecipes }
}

export const fmtQty = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 })

/** Cantidad para la lista: «450 g», «1,25 kg», «6 ud», «2 envases». */
export function qtyLabel(qty: number | null, unit: string | null) {
  if (qty == null || !unit) return ''
  if (unit === 'g') return qty >= 1000 ? `${fmtQty(Math.round(qty / 10) / 100)} kg` : `${fmtQty(qty)} g`
  if (unit === 'envases') return `${fmtQty(qty)} ${qty === 1 ? 'envase' : 'envases'}`
  if (unit === 'ud' && qty === 1) return '1 ud'
  return `${fmtQty(qty)} ${unit}`
}

/** Texto de la nota de una línea del menú. */
export function needNote(l: NeedLine) {
  const parts = [`Para ${l.recipes.join(', ')}`]
  if (l.fromPantry.length) parts.push(`descontado lo del almacén: ${l.fromPantry.join(', ')}`)
  if (l.check.length) parts.push(`revisa el almacén: ${l.check.join(', ')}`)
  return parts.join(' · ')
}

/** Mismo producto ya pendiente en la lista (para no repetirlo). */
export const pendingMatch = (list: ShoppingItem[], name: string) => list.find((s) => !s.checked && norm(s.name) === norm(name))
