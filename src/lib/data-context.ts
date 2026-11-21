import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { db, type Table } from './db'
import type { BedcaFood, Lookup } from './nutrition'
import type { Food, Member, PantryItem, PlanItem, Recipe, RecipeIngredient, WeightEntry } from './types'

export type Data = {
  ready: boolean
  error: string | null
  members: Member[]
  weights: WeightEntry[]
  foods: Food[]
  recipes: Recipe[]
  ingredients: RecipeIngredient[]
  pantry: PantryItem[]
  bedca: Map<number, BedcaFood>
  L: Lookup
  reload: (t: Table) => Promise<void>
}

export const DataCtx = createContext<Data | null>(null)

export function useData() {
  const c = useContext(DataCtx)
  if (!c) throw new Error('useData fuera de DataProvider')
  return c
}

/** Platos del menú entre dos fechas (incluidas), al día en directo. */
export function usePlan(from: string, to: string) {
  const [state, setState] = useState<{ key: string; items: PlanItem[] } | null>(null)
  const key = `${from}|${to}`
  const fetchItems = useCallback(() => db.list<PlanItem>('meal_plan_items', { col: 'day', from, to }).then((r) => r.sort((a, b) => a.position - b.position)), [from, to])
  const reload = useCallback(async () => {
    const items = await fetchItems()
    setState({ key, items })
  }, [fetchItems, key])
  useEffect(() => {
    fetchItems().then((items) => setState({ key, items }), () => setState({ key, items: [] }))
    return db.subscribe('meal_plan_items', () => void reload())
  }, [fetchItems, reload, key])
  // Al cambiar de semana no se muestran los platos de la anterior mientras carga
  const fresh = state?.key === key
  return { items: fresh ? state.items : [], loading: !fresh, reload }
}
