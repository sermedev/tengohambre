import type { MealId } from '../lib/types'

export const MEALS: { id: MealId; name: string; hint?: string }[] = [
  { id: 'des', name: 'Desayuno' },
  { id: 'mm', name: 'Media mañana', hint: 'Lo que se llevan al cole: que aguante en la mochila' },
  { id: 'com', name: 'Comida' },
  { id: 'mer', name: 'Merienda' },
  { id: 'cen', name: 'Cena' },
]
export const mealName = (id: MealId) => MEALS.find((m) => m.id === id)?.name ?? id

/** Grupos de alimentos de un plato, para el equilibrio de la semana (frecuencias orientativas de AESAN). */
export const GROUPS = [
  { k: 'verdura', n: 'Verdura y hortaliza', min: 14, hint: '2 raciones al día' },
  { k: 'fruta', n: 'Fruta', min: 14, hint: '2 en el menú + fruta de postre' },
  { k: 'legumbre', n: 'Legumbre', min: 3, hint: '3–4 por semana' },
  { k: 'pescado', n: 'Pescado', min: 3, hint: '3–4 por semana' },
  { k: 'huevo', n: 'Huevos', min: 3, hint: '3–4 por semana' },
  { k: 'blanca', n: 'Carne blanca', hint: 'alternar con pescado y legumbre' },
  { k: 'roja', n: 'Carne roja y embutido', max: 2, hint: 'máximo 2 por semana' },
  { k: 'lacteo', n: 'Lácteos', hint: '2–3 al día' },
  { k: 'precocinado', n: 'Precocinados', max: 2, hint: 'mejor ocasional' },
] as { k: string; n: string; min?: number; max?: number; hint: string }[]

export const RECIPE_ICONS = ['🍲', '🥘', '🍝', '🍚', '🐟', '🍣', '🍗', '🥩', '🍳', '🥚', '🥣', '🥗', '🥬', '🥦', '🍅', '🎃', '🫘', '🫛', '🍔', '🧆', '🥪', '🥖', '🍞', '🥛', '🍎', '🍌', '🧀', '🍕', '🌯', '🥟', '🍛', '🍤', '🍽️']
