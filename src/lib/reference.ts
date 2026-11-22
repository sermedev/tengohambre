import { ageOn } from './dates'
import type { Nut } from './nutrition'
import { isKid, type Target } from './targets'
import type { Member } from './types'

/*
 * Valores de referencia para el resumen de lo que come cada persona. Solo EFSA y OMS:
 * - Hidratos de carbono 45–60 % y grasa 20–35 % de la energía: ingestas de referencia de EFSA (2010), adultos y niños desde 4 años.
 * - Grasa saturada < 10 % de la energía: OMS (directriz sobre ácidos grasos saturados, 2023).
 * - Fibra, ingesta adecuada de EFSA (2010): adultos 25 g; niños 2 g por MJ → 4–6 años 14 g, 7–10 años 16 g, 11–14 años 19 g, 15–17 años 21 g.
 * - Sal: ingesta segura y adecuada de sodio de EFSA (2019): adultos y 11–17 años 2,0 g; 7–10 años 1,7 g; 4–6 años 1,3 g; 1–3 años 1,1 g
 *   (sal = sodio × 2,5). Coincide con el máximo de 5 g de sal al día de la OMS para adultos.
 * - Azúcares: la OMS limita los azúcares LIBRES (< 10 % de la energía). Las tablas solo dan azúcares totales, que incluyen
 *   los de la fruta y la leche, así que se muestran sin compararlos.
 */

export type Tone = 'ok' | 'warn' | 'bad' | 'muted'
export type RefRow = { k: string; label: string; value: string; ref: string; tone: Tone; pct?: number }

function fiberAI(age: number) {
  if (age >= 18) return 25
  if (age >= 15) return 21
  if (age >= 11) return 19
  if (age >= 7) return 16
  if (age >= 4) return 14
  return 10
}

function saltMax(age: number) {
  const na = age >= 11 ? 2.0 : age >= 7 ? 1.7 : age >= 4 ? 1.3 : 1.1
  return na * 2.5
}

const pctE = (g: number, kcalPerG: number, kcal: number) => (kcal > 0 ? (g * kcalPerG * 100) / kcal : 0)
const f0 = (n: number) => Math.round(n).toLocaleString('es-ES')
const f1 = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 1 })

/** Filas del resumen de un día (o de la media diaria de varios días). */
export function referenceRows(n: Nut, m: Member, tg: Target | null): RefRow[] {
  const age = ageOn(m.birth_date)
  const kid = isKid(m)
  const rows: RefRow[] = []
  if (tg) {
    const r = n.kcal / tg.kcal
    rows.push({ k: 'kcal', label: 'Energía', value: `${f0(n.kcal)} kcal`, ref: `objetivo ${f0(tg.kcal)} kcal`, pct: r, tone: r >= 0.9 && r <= 1.1 ? 'ok' : r >= 0.8 && r <= 1.2 ? 'warn' : 'bad' })
    const p = n.protein_g / tg.prot
    rows.push({ k: 'prot', label: 'Proteína', value: `${f0(n.protein_g)} g`, ref: `objetivo ${tg.prot} g`, pct: p, tone: p >= 0.9 ? 'ok' : p >= 0.75 ? 'warn' : 'bad' })
  } else {
    rows.push({ k: 'kcal', label: 'Energía', value: `${f0(n.kcal)} kcal`, ref: kid ? 'falta su peso en Seguimiento' : 'falta su peso y altura en Seguimiento', tone: 'muted' })
    rows.push({ k: 'prot', label: 'Proteína', value: `${f0(n.protein_g)} g`, ref: '', tone: 'muted' })
  }
  const range = (k: string, label: string, g: number, lo: number, hi: number) => {
    const v = pctE(g, k === 'fat' ? 9 : 4, n.kcal)
    rows.push({ k, label, value: `${f0(v)} %`, ref: `${lo}–${hi} % de la energía (EFSA) · ${f0(g)} g`, tone: v >= lo && v <= hi ? 'ok' : v >= lo - 5 && v <= hi + 5 ? 'warn' : 'bad' })
  }
  if (n.kcal > 0) {
    range('carbs', 'Hidratos', n.carbs_g, 45, 60)
    range('fat', 'Grasa', n.fat_g, 20, 35)
    const sat = pctE(n.sat_fat_g, 9, n.kcal)
    rows.push({ k: 'sat', label: 'Grasa saturada', value: `${f0(sat)} %`, ref: `menos del 10 % de la energía (OMS) · ${f1(n.sat_fat_g)} g`, tone: sat < 10 ? 'ok' : sat < 13 ? 'warn' : 'bad' })
  }
  const ai = fiberAI(age)
  rows.push({ k: 'fiber', label: 'Fibra', value: `${f0(n.fiber_g)} g`, ref: `al menos ${ai} g (EFSA, ${kid ? `${age} años` : 'adultos'})`, pct: n.fiber_g / ai, tone: n.fiber_g >= ai ? 'ok' : n.fiber_g >= ai * 0.7 ? 'warn' : 'bad' })
  const sm = saltMax(age)
  rows.push({ k: 'salt', label: 'Sal', value: `${f1(n.salt_g)} g`, ref: `como mucho ${f1(sm)} g (EFSA${kid ? '' : ' y OMS'})`, pct: n.salt_g / sm, tone: n.salt_g <= sm ? 'ok' : n.salt_g <= sm * 1.2 ? 'warn' : 'bad' })
  rows.push({ k: 'sugars', label: 'Azúcares', value: `${f0(n.sugars_g)} g`, ref: 'totales, incluida fruta y leche (la OMS limita solo los añadidos)', tone: 'muted' })
  return rows
}
