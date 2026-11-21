import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DataCtx, type Data } from './data-context'
import { db, type Table } from './db'
import { loadBedca, type BedcaFood } from './nutrition'
import type { Food, Member, PantryItem, Recipe, RecipeIngredient, WeightEntry } from './types'

const TABLES = ['members', 'weight_log', 'foods', 'recipes', 'recipe_ingredients', 'pantry_items'] as const

/** Carga una vez los datos del hogar (son pocos) y los mantiene al día con los cambios del otro móvil. */
export function DataProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<Record<string, unknown[]>>({})
  const [bedca, setBedca] = useState<Map<number, BedcaFood>>(new Map())
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (t: Table) => {
    try {
      const r = await db.list(t)
      setRows((s) => ({ ...s, [t]: r }))
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    void Promise.all([...TABLES.map((t) => reload(t)), loadBedca().then(setBedca)]).then(() => setReady(true))
    const offs = TABLES.map((t) => db.subscribe(t, () => void reload(t)))
    return () => offs.forEach((f) => f())
  }, [reload])

  const value = useMemo<Data>(() => {
    const members = ((rows.members ?? []) as Member[]).slice().sort((a, b) => a.position - b.position)
    const recipes = ((rows.recipes ?? []) as Recipe[]).slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
    const ingredients = (rows.recipe_ingredients ?? []) as RecipeIngredient[]
    const foods = (rows.foods ?? []) as Food[]
    const pantry = (rows.pantry_items ?? []) as PantryItem[]
    const byRecipe = new Map<string, RecipeIngredient[]>()
    for (const i of ingredients) byRecipe.set(i.recipe_id, [...(byRecipe.get(i.recipe_id) ?? []), i])
    for (const l of byRecipe.values()) l.sort((a, b) => a.position - b.position)
    return {
      ready,
      error,
      members,
      weights: (rows.weight_log ?? []) as WeightEntry[],
      foods,
      recipes,
      ingredients,
      pantry,
      bedca,
      L: {
        bedca,
        foods: new Map(foods.map((f) => [f.id, f])),
        ingredients: byRecipe,
        recipes: new Map(recipes.map((r) => [r.id, r])),
        pantry: new Map(pantry.map((p) => [p.id, p])),
      },
      reload,
    }
  }, [rows, bedca, ready, error, reload])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
