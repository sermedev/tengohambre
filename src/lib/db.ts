import { supabase } from './supabase'

/**
 * Acceso a datos. En la app real va a Supabase; con VITE_DEMO=1 todo se guarda en este navegador
 * (sirve para probar la app sin cuenta ni base de datos).
 */
export const demo = import.meta.env.VITE_DEMO === '1'

export type Table =
  | 'members'
  | 'weight_log'
  | 'foods'
  | 'recipes'
  | 'recipe_ingredients'
  | 'pantry_items'
  | 'meal_plan_items'
  | 'shopping_items'
  | 'saved_products'
  | 'menu_templates'

type Row = { id: string } & Record<string, unknown>
type Range = { col: string; from: string; to: string }

export type Db = {
  list<T>(table: Table, range?: Range): Promise<T[]>
  insert<T>(table: Table, rows: Partial<T>[]): Promise<T[]>
  update(table: Table, id: string, patch: Record<string, unknown>): Promise<void>
  remove(table: Table, ids: string[]): Promise<void>
  subscribe(table: Table, onChange: () => void): () => void
}

// Avisos dentro de la app: cada cambio refresca las pantallas que muestran esa tabla
const listeners = new Map<Table, Set<() => void>>()
function notify(table: Table) {
  listeners.get(table)?.forEach((f) => f())
}
function listen(table: Table, f: () => void) {
  if (!listeners.has(table)) listeners.set(table, new Set())
  listeners.get(table)!.add(f)
  return () => void listeners.get(table)!.delete(f)
}

// Hogar de la cuenta conectada: cada fila nueva se guarda en él (lo exigen las reglas de seguridad)
let householdId: string | null = null
export function setHouseholdId(id: string | null) {
  householdId = id
}

function fail(e: { message: string } | null) {
  if (e) throw new Error(e.message)
}

const remote: Db = {
  async list<T>(table: Table, range?: Range) {
    let q = supabase.from(table).select('*')
    if (range) q = q.gte(range.col, range.from).lte(range.col, range.to)
    const { data, error } = await q
    fail(error)
    return (data ?? []) as T[]
  },
  async insert<T>(table: Table, rows: Partial<T>[]) {
    if (!householdId) throw new Error('No hay hogar seleccionado. Vuelve a entrar en la app.')
    const withHousehold = rows.map((r) => ({ household_id: householdId, ...(r as object) }))
    const { data, error } = await supabase.from(table).insert(withHousehold as never).select()
    fail(error)
    notify(table)
    return (data ?? []) as T[]
  },
  async update(table, id, patch) {
    const { error } = await supabase.from(table).update(patch as never).eq('id', id)
    fail(error)
    notify(table)
  },
  async remove(table, ids) {
    if (!ids.length) return
    const { error } = await supabase.from(table).delete().in('id', ids)
    fail(error)
    notify(table)
    // La base de datos borra en cascada ingredientes y platos del menú de una receta
    if (table === 'recipes') {
      notify('recipe_ingredients')
      notify('meal_plan_items')
    }
  },
  subscribe(table, onChange) {
    const off = listen(table, onChange)
    // Cambios hechos desde el otro móvil (Supabase Realtime)
    const ch = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
      .subscribe()
    return () => {
      off()
      void supabase.removeChannel(ch)
    }
  },
}

// ───────── Modo demo: localStorage ─────────
const KEY = 'tengohambre-demo-db'
let mem: Record<string, Row[]> | null = null

function load(): Record<string, Row[]> {
  if (mem) return mem
  try {
    mem = JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    mem = {}
  }
  return mem!
}
function save(table: Table) {
  try {
    localStorage.setItem(KEY, JSON.stringify(mem))
  } catch {
    /* sin almacenamiento: los datos viven hasta recargar */
  }
  notify(table)
}
const uuid = () => crypto.randomUUID()

export const DEMO_HOUSEHOLD = { id: '00000000-0000-4000-8000-000000000001', name: 'Casa (demo)', invite_code: 'DEMO1234' }

const local: Db = {
  async list<T>(table: Table, range?: Range) {
    const rows = load()[table] ?? []
    return (range ? rows.filter((r) => String(r[range.col]) >= range.from && String(r[range.col]) <= range.to) : rows).map((r) => ({ ...r })) as T[]
  },
  async insert<T>(table: Table, rows: Partial<T>[]) {
    const db = load()
    const out = rows.map((r) => ({ id: uuid(), household_id: DEMO_HOUSEHOLD.id, ...defaults(table), ...(r as object) }) as Row)
    db[table] = [...(db[table] ?? []), ...out]
    save(table)
    return out as unknown as T[]
  },
  async update(table, id, patch) {
    const db = load()
    db[table] = (db[table] ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r))
    save(table)
  },
  async remove(table, ids) {
    const db = load()
    db[table] = (db[table] ?? []).filter((r) => !ids.includes(r.id))
    // Igual que en la base de datos: borrar una receta borra sus ingredientes y sus platos del menú
    if (table === 'recipes') {
      db.recipe_ingredients = (db.recipe_ingredients ?? []).filter((r) => !ids.includes(r.recipe_id as string))
      db.meal_plan_items = (db.meal_plan_items ?? []).filter((r) => !ids.includes(r.recipe_id as string))
      save('recipe_ingredients')
      save('meal_plan_items')
    }
    save(table)
  },
  subscribe: listen,
}

function defaults(table: Table): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10)
  if (table === 'recipes') return { kind: 'receta', servings: 4, meals: [], groups: [], icon: '🍽️', kid_friendly: true, food_id: null, minutes: null, steps: null, note: null, portion_g: null, pack_portions: null, suggested_key: null }
  if (table === 'pantry_items') return { added_on: today, recipe_id: null, expires_on: null, unit: 'ud', qty: 1 }
  if (table === 'meal_plan_items') return { position: 0, recipe_id: null, pantry_item_id: null, eat_out: null, label: null, portions: {} }
  if (table === 'shopping_items') return { section: 'Otros', qty: null, unit: null, checked: false, from_menu: false, note: null, updated_at: new Date().toISOString() }
  if (table === 'menu_templates') return { items: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  if (table === 'members') return { color: '--p1', icon: null, is_kid: false, default_portion: 1, goal: 'mantener', activity: 'baja', height_cm: null, waist_cm: null, sports: [], position: 0 }
  return {}
}

export const db: Db = demo ? local : remote

/** Datos de ejemplo para el modo demo (la familia, como en el prototipo). */
export async function seedDemo() {
  if ((load().members ?? []).length) return
  const ms = await db.insert<{ id: string }>('members', [
    { name: 'Papá', sex: 'hombre', birth_date: '1984-06-01', color: '--p1', default_portion: 1, goal: 'mantener', activity: 'baja', height_cm: 178, waist_cm: 88, position: 0, sports: [{ sport: 'crossfit', days: 3, minutes: 60 }, { sport: 'padel', days: 1, minutes: 90 }] },
    { name: 'Mamá', sex: 'mujer', birth_date: '1983-06-01', color: '--p2', default_portion: 0.8, goal: 'mantener', activity: 'baja', height_cm: 165, waist_cm: 76, position: 1, sports: [{ sport: 'crossfit', days: 3, minutes: 60 }, { sport: 'padel', days: 1, minutes: 90 }] },
    { name: 'Mayor', sex: 'nino', birth_date: '2018-06-01', color: '--p3', is_kid: true, default_portion: 0.7, goal: 'crecer', activity: 'media', height_cm: 130, waist_cm: 58, position: 2, sports: [{ sport: 'futbol', days: 3, minutes: 60 }] },
    { name: 'Peque', sex: 'nino', birth_date: '2020-06-01', color: '--p4', is_kid: true, default_portion: 0.6, goal: 'crecer', activity: 'media', height_cm: 117, waist_cm: 54, position: 3, sports: [{ sport: 'futbol', days: 2, minutes: 60 }] },
  ] as never)
  const today = new Date().toISOString().slice(0, 10)
  await db.insert('weight_log', ms.map((m, i) => ({ member_id: m.id, day: today, weight_kg: [80, 63, 27, 21][i] })) as never)
}
