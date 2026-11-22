import type { EatOut, Food, Member, PantryItem, PlanItem, Recipe, RecipeIngredient } from './types'

/** Nutrientes que la app suma. Todo en gramos salvo kcal. */
export type Nut = { kcal: number; protein_g: number; carbs_g: number; sugars_g: number; fat_g: number; sat_fat_g: number; fiber_g: number; salt_g: number }
export const NUT_KEYS = ['kcal', 'protein_g', 'carbs_g', 'sugars_g', 'fat_g', 'sat_fat_g', 'fiber_g', 'salt_g'] as const
/**
 * "Rica en proteína": al menos el 20 % de la energía procede de la proteína
 * (criterio de "alto contenido de proteínas" del Reglamento (CE) 1924/2006, 4 kcal/g)
 * y, para que el plato aporte de verdad, al menos 15 g por ración de adulto.
 */
export const highProtein = (n: Pick<Nut, 'kcal' | 'protein_g'>) => n.kcal > 0 && n.protein_g * 4 >= 0.2 * n.kcal && n.protein_g >= 15
export const zero = (): Nut => ({ kcal: 0, protein_g: 0, carbs_g: 0, sugars_g: 0, fat_g: 0, sat_fat_g: 0, fiber_g: 0, salt_g: 0 })

export function addTo(a: Nut, b: Partial<Nut>, f = 1) {
  for (const k of NUT_KEYS) a[k] += (b[k] ?? 0) * f
  return a
}

// ───────── BEDCA (archivo estático) ─────────
export type BedcaFood = {
  id: number
  name: string
  group?: string
  edible?: number
  kcal?: number
  protein_g?: number
  carbs_g?: number
  sugars_g?: number
  fat_g?: number
  sat_fat_g?: number
  fiber_g?: number
  sodium_mg?: number
}

let bedcaPromise: Promise<Map<number, BedcaFood>> | null = null
export function loadBedca() {
  bedcaPromise ??= fetch('/data/bedca.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Sin BEDCA'))))
    .then((d: { foods: BedcaFood[] }) => new Map(d.foods.map((f) => [f.id, f])))
    .catch(() => new Map())
  return bedcaPromise
}

/** Nutrientes por 100 g de un alimento de BEDCA. La sal sale del sodio (sal = sodio × 2,5, Reglamento UE 1169/2011). */
export function bedcaPer100(f: BedcaFood): Partial<Nut> {
  return {
    kcal: f.kcal,
    protein_g: f.protein_g,
    carbs_g: f.carbs_g,
    sugars_g: f.sugars_g,
    fat_g: f.fat_g,
    sat_fat_g: f.sat_fat_g,
    fiber_g: f.fiber_g,
    salt_g: f.sodium_mg == null ? undefined : (f.sodium_mg * 2.5) / 1000,
  }
}

export function foodPer100(f: Food): Partial<Nut> {
  const o: Partial<Nut> = {}
  for (const k of NUT_KEYS) if (f[k] != null) o[k] = Number(f[k])
  return o
}

export type Lookup = {
  bedca: Map<number, BedcaFood>
  foods: Map<string, Food>
  ingredients: Map<string, RecipeIngredient[]> // por receta
  recipes: Map<string, Recipe>
  pantry: Map<string, PantryItem>
}

export function per100OfRef(ref: string, L: Pick<Lookup, 'bedca' | 'foods'>): Partial<Nut> | null {
  const [src, id] = ref.split(':')
  if (src === 'bedca') {
    const f = L.bedca.get(Number(id))
    return f ? bedcaPer100(f) : null
  }
  const f = L.foods.get(id)
  return f ? foodPer100(f) : null
}

/** Nutrientes de UNA ración de adulto de la receta. */
export function recipeServing(r: Recipe, L: Lookup): Nut {
  const t = zero()
  if (r.kind === 'precocinado') {
    const f = r.food_id ? L.foods.get(r.food_id) : undefined
    if (f && r.portion_g) addTo(t, foodPer100(f), Number(r.portion_g) / 100)
    return t
  }
  return ingredientsServing(L.ingredients.get(r.id) ?? [], Number(r.servings), L)
}

/** Suma los ingredientes (gramos de toda la receta) y lo reparte entre las raciones. */
export function ingredientsServing(ings: { food_ref: string; grams: number }[], servings: number, L: Pick<Lookup, 'bedca' | 'foods'>): Nut {
  const t = zero()
  for (const ing of ings) {
    const p = per100OfRef(ing.food_ref, L)
    if (p) addTo(t, p, Number(ing.grams) / 100)
  }
  const s = servings || 1
  for (const k of NUT_KEYS) t[k] /= s
  return t
}

/**
 * Comer fuera: estimación para una ración de adulto.
 * Son valores orientativos (no hay datos del plato real), por eso la app los marca como estimación.
 */
export const EAT_OUT: Record<EatOut, { name: string; desc: string; nut: Partial<Nut> }> = {
  ligero: { name: 'Ligero', desc: 'Ensalada, plancha, pescado o menú sencillo', nut: { kcal: 650, protein_g: 30, carbs_g: 70, fat_g: 25, fiber_g: 7 } },
  normal: { name: 'Normal', desc: 'Menú del día, primero y segundo, o pizza para compartir', nut: { kcal: 950, protein_g: 40, carbs_g: 100, fat_g: 40, fiber_g: 8 } },
  copioso: { name: 'Copioso', desc: 'Raciones, fritos, hamburguesa con patatas, postre y bebida', nut: { kcal: 1350, protein_g: 55, carbs_g: 130, fat_g: 65, fiber_g: 9 } },
}

/** Nutrientes de una ración de adulto del plato del menú. */
export function planItemServing(it: PlanItem, L: Lookup): Nut {
  if (it.eat_out) return addTo(zero(), EAT_OUT[it.eat_out].nut)
  const rid = it.recipe_id ?? (it.pantry_item_id ? L.pantry.get(it.pantry_item_id)?.recipe_id : null)
  const r = rid ? L.recipes.get(rid) : undefined
  return r ? recipeServing(r, L) : zero()
}

export function planItemName(it: PlanItem, L: Lookup) {
  if (it.eat_out) return `Fuera de casa · ${EAT_OUT[it.eat_out].name.toLowerCase()}`
  const r = it.recipe_id ? L.recipes.get(it.recipe_id) : undefined
  return r?.name ?? it.label ?? (it.pantry_item_id ? L.pantry.get(it.pantry_item_id)?.name : undefined) ?? 'Plato'
}
export function planItemIcon(it: PlanItem, L: Lookup) {
  if (it.eat_out) return '🍽️'
  const r = it.recipe_id ? L.recipes.get(it.recipe_id) : undefined
  return r?.icon ?? '🍱'
}

/** Cuánto come cada persona de un plato: 0 = no come; si no se ha tocado, su ración habitual. */
export const factorOf = (it: PlanItem, m: Member) => {
  const v = it.portions?.[m.id]
  return v == null ? Number(m.default_portion) : Number(v)
}

export const PORTION_STEPS = [0.25, 0.5, 0.6, 0.7, 0.75, 0.8, 1, 1.25, 1.5, 2]
const FR: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾', '1': '1', '1.25': '1¼', '1.5': '1½', '2': '2' }
export const fmtPortion = (f: number) => FR[String(f)] ?? f.toLocaleString('es-ES', { maximumFractionDigits: 2 })

export const fmt = (n: number, d = 0) => (Number.isFinite(n) ? n : 0).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d })
