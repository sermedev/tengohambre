export type Household = { id: string; name: string; invite_code: string }

export type Member = {
  id: string
  household_id: string
  name: string
  color: string
  icon: string | null
  sex: 'hombre' | 'mujer' | 'nino' | 'nina'
  birth_date: string
  is_kid: boolean
  default_portion: number
  goal: string
  activity: string
  height_cm: number | null
  waist_cm: number | null
  sports: { sport: string; days: number; minutes: number }[]
  position: number
}

export type MealId = 'des' | 'mm' | 'com' | 'mer' | 'cen'
export type EatOut = 'ligero' | 'normal' | 'copioso'

/** Producto con datos de la etiqueta (por 100 g). Se usa para los precocinados. */
export type Food = {
  id: string
  household_id: string
  name: string
  brand: string | null
  store: string | null
  barcode: string | null
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  sugars_g: number | null
  fat_g: number | null
  sat_fat_g: number | null
  fiber_g: number | null
  salt_g: number | null
  source: 'etiqueta' | 'open_food_facts'
}

export type Recipe = {
  id: string
  household_id: string
  name: string
  kind: 'receta' | 'precocinado'
  food_id: string | null
  servings: number
  minutes: number | null
  meals: MealId[]
  groups: string[]
  steps: string | null
  icon: string
  note: string | null
  kid_friendly: boolean
  portion_g: number | null
  pack_portions: number | null
  suggested_key: string | null
}

export type RecipeIngredient = {
  id: string
  household_id: string
  recipe_id: string
  food_ref: string // 'bedca:<id>' o 'food:<uuid>'
  name: string
  grams: number
  position: number
}

export type Place = 'Despensa' | 'Nevera' | 'Congelador'
export type Unit = 'raciones' | 'g' | 'kg' | 'ud' | 'L' | 'paquetes'

export type PantryItem = {
  id: string
  household_id: string
  name: string
  place: Place
  qty: number
  unit: Unit
  recipe_id: string | null
  expires_on: string | null
  added_on: string
}

export type PlanItem = {
  id: string
  household_id: string
  day: string
  meal: MealId
  position: number
  recipe_id: string | null
  pantry_item_id: string | null
  eat_out: EatOut | null
  label: string | null
  portions: Record<string, number>
}

export type WeightEntry = {
  id: string
  household_id: string
  member_id: string
  day: string
  weight_kg: number | null
  waist_cm: number | null
}

export type ShoppingItem = {
  id: string
  household_id: string
  name: string
  section: string
  qty: number | null
  unit: string | null
  checked: boolean
  from_menu: boolean
  note: string | null
  updated_at: string
}

/** Producto que la familia ha añadido al catálogo («Mis productos»). */
export type SavedProduct = { id: string; household_id: string; name: string; section: string }
