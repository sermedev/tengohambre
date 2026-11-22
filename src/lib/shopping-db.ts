import { db } from './db'
import { norm } from './text'
import { pendingMatch } from './shopping'
import type { SavedProduct, ShoppingItem } from './types'
import { CATALOG, SECTIONS } from '../data/catalog'

export const CAT_NAMES = new Set(SECTIONS.flatMap((s) => CATALOG[s].map(norm)))

/** Añade un producto a la lista (o nada si ya está pendiente). Lo que no está en el catálogo se guarda en «Mis productos». */
export async function addProduct(name: string, section: string, shopping: ShoppingItem[], saved: SavedProduct[]) {
  if (pendingMatch(shopping, name)) return false
  await db.insert<ShoppingItem>('shopping_items', [{ name, section }])
  const n = norm(name)
  if (!CAT_NAMES.has(n) && !saved.some((p) => norm(p.name) === n)) {
    try {
      await db.insert<SavedProduct>('saved_products', [{ name, section }])
    } catch {
      /* ya estaba guardado desde el otro móvil */
    }
  }
  return true
}

