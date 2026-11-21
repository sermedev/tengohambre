import { fmt } from './nutrition'
import type { PantryItem, Unit } from './types'
import { todayIso } from './dates'

export const UNITS: Unit[] = ['raciones', 'g', 'kg', 'ud', 'L', 'paquetes']
export const STEP: Record<Unit, number> = { raciones: 1, g: 50, kg: 0.5, ud: 1, L: 0.5, paquetes: 1 }
export const today = todayIso
const daysSince = (d: string) => Math.round((Date.parse(today()) - Date.parse(d)) / 86400000)

export const qtyText = (p: Pick<PantryItem, 'qty' | 'unit'>) =>
  `${fmt(Number(p.qty), Number(p.qty) % 1 ? 1 : 0)} ${p.unit === 'raciones' ? (Number(p.qty) === 1 ? 'ración' : 'raciones') : p.unit}`

/** Avisos de lo que lleva tiempo guardado (orientativo: sobras ≤ 3–4 días en nevera; congelado mejor < 3 meses). */
export function ageInfo(p: PantryItem) {
  const age = daysSince(p.added_on)
  const when = age <= 0 ? 'hoy' : age === 1 ? 'ayer' : age > 60 ? `hace ${Math.round(age / 30)} meses` : `hace ${age} días`
  if (p.expires_on && p.expires_on < today()) return { text: `caducó el ${new Date(p.expires_on + 'T12:00').toLocaleDateString('es-ES')}`, tone: 'bad' as const }
  if (p.place === 'Nevera' && p.unit === 'raciones' && age > 3) return { text: `${when} · consumir ya`, tone: 'bad' as const }
  if (p.place === 'Congelador' && age > 90) return { text: `${when} · consumir pronto`, tone: 'warn' as const }
  return { text: when, tone: 'muted' as const }
}

export const pantryIcon = (p: PantryItem, recipeIcon?: string) => recipeIcon ?? (p.unit === 'raciones' ? '🍱' : p.place === 'Congelador' ? '🧊' : p.place === 'Nevera' ? '🥶' : '🥫')

