import { ageOn } from './dates'
import type { Member, WeightEntry } from './types'

/*
 * Objetivos orientativos con base científica (mismos cálculos que el prototipo aprobado):
 * - Adultos: gasto en reposo con Mifflin-St Jeor (PMID 2305711) × nivel de actividad (PAL de EFSA)
 *   + deporte con valores MET del Compendio de Actividades Físicas 2024 (PMID 38242596): (MET − 1) × kg × horas.
 *   Perder grasa: déficit ~20 % con un máximo de 500 kcal. Ganar músculo: superávit ~10 %.
 * - Niños: sin dietas de pérdida o ganancia; referencia de energía de EFSA por edad (PAL 1,6) ajustada a su actividad.
 */

export const GOALS_ADULT = [
  { k: 'mantener', n: 'Mantener peso', d: 'Comer lo que se gasta. Proteína 0,8–1 g por kg.', adj: 0, prot: 1.0 },
  { k: 'perder', n: 'Perder grasa', d: 'Déficit moderado (~20 %, máx. 500 kcal) y proteína alta (1,2–1,6 g/kg) para conservar músculo.', adj: -0.2, prot: 1.4 },
  { k: 'musculo', n: 'Ganar masa muscular', d: 'Superávit pequeño (~10 %) y proteína 1,6–2,2 g/kg. Necesita entrenamiento de fuerza.', adj: 0.1, prot: 1.8 },
  { k: 'recomp', n: 'Recomposición', d: 'Calorías de mantenimiento con proteína alta (1,6–2 g/kg) y fuerza: perder grasa y ganar músculo despacio.', adj: 0, prot: 1.8 },
] as const
export const GOAL_KID = {
  k: 'crecer',
  n: 'Crecimiento saludable',
  d: 'En niños no se recomiendan dietas para perder o ganar peso sin indicación del pediatra. El objetivo es variedad, energía suficiente y buenos hábitos.',
}

export const ACTS_ADULT = [
  { k: 'baja', n: 'Sentado', d: 'Trabajo de oficina y poco movimiento', pal: 1.4 },
  { k: 'media', n: 'De pie', d: 'Te mueves bastante: de pie, caminas a menudo', pal: 1.55 },
  { k: 'alta', n: 'Físico', d: 'Trabajo físico la mayor parte del día', pal: 1.75 },
]
export const ACTS_KID = [
  { k: 'baja', n: 'Tranquilo', d: 'Poco juego activo fuera del deporte', pal: 1.4 },
  { k: 'media', n: 'Normal', d: 'Recreo, parque y juego activo a diario', pal: 1.5 },
  { k: 'alta', n: 'Muy movido', d: 'Bici, parque y juego intenso a diario', pal: 1.6 },
]

/** Deportes con su intensidad (MET) según el Compendio de Actividades Físicas. vigorous = cuenta doble para la OMS. */
export const SPORTS = [
  { k: 'crossfit', n: 'CrossFit / entrenamiento funcional', met: 8, vigorous: true, strength: true },
  { k: 'pachanga', n: 'Pachanga de fútbol en el parque', met: 5, metKid: 7.5 },
  { k: 'padel', n: 'Pádel', met: 6 },
  { k: 'futbol', n: 'Fútbol', met: 7, vigorous: true },
  { k: 'correr', n: 'Correr (ritmo suave)', met: 8.3, vigorous: true },
  { k: 'pesas', n: 'Gimnasio (pesas)', met: 5, strength: true },
  { k: 'bici', n: 'Bicicleta', met: 7, vigorous: true },
  { k: 'natacion', n: 'Natación', met: 5.8 },
  { k: 'baloncesto', n: 'Baloncesto', met: 6.5, vigorous: true },
  { k: 'tenis', n: 'Tenis', met: 7.3, vigorous: true },
  { k: 'caminar', n: 'Caminar rápido', met: 4.3 },
  { k: 'paseo', n: 'Paseo por el campo', met: 4 },
  { k: 'yoga', n: 'Yoga / pilates', met: 2.8 },
  { k: 'baile', n: 'Baile', met: 5 },
] as { k: string; n: string; met: number; metKid?: number; vigorous?: boolean; strength?: boolean }[]

export const isKid = (m: Pick<Member, 'sex'>) => m.sex === 'nino' || m.sex === 'nina'

export function latestWeight(memberId: string, log: WeightEntry[]) {
  return log
    .filter((w) => w.member_id === memberId && w.weight_kg != null)
    .sort((a, b) => b.day.localeCompare(a.day))[0]?.weight_kg as number | undefined
}

export function sportKcalPerDay(m: Member, kg: number) {
  const kid = isKid(m)
  const week = (m.sports ?? []).reduce((a, x) => {
    const sp = SPORTS.find((s) => s.k === x.sport)
    if (!sp) return a
    const met = kid && sp.metKid ? sp.metKid : sp.met
    return a + (met - 1) * kg * (x.minutes / 60) * x.days
  }, 0)
  return week / 7
}

/** Referencia orientativa de energía para niños (PAL 1,6) por edad, interpolada de los valores de EFSA. */
const kidRef = (age: number) => 1520 + (age - 6) * 115

export type Target = { kcal: number; prot: number; goalName: string; tdee?: number; sport: number; bmr?: number }

export function targetOf(m: Member, log: WeightEntry[]): Target | null {
  const kg = latestWeight(m.id, log)
  const age = ageOn(m.birth_date)
  if (!kg) return null
  const sport = sportKcalPerDay(m, kg)
  if (isKid(m)) {
    const pal = ACTS_KID.find((a) => a.k === m.activity)?.pal ?? 1.5
    return { kcal: Math.round((kidRef(age) * (pal / 1.6) + sport) / 10) * 10, prot: Math.round(kg * 0.95), goalName: GOAL_KID.n, sport: Math.round(sport) }
  }
  if (!m.height_cm) return null
  const pal = ACTS_ADULT.find((a) => a.k === m.activity)?.pal ?? 1.4
  const bmr = 10 * kg + 6.25 * Number(m.height_cm) - 5 * age + (m.sex === 'mujer' ? -161 : 5)
  const tdee = bmr * pal + sport
  const g = GOALS_ADULT.find((x) => x.k === m.goal) ?? GOALS_ADULT[0]
  let kcal = tdee * (1 + g.adj)
  if (g.adj < 0) kcal = Math.max(kcal, tdee - 500)
  return { kcal: Math.round(kcal / 10) * 10, prot: Math.round(kg * g.prot), goalName: g.n, tdee: Math.round(tdee / 10) * 10, sport: Math.round(sport), bmr: Math.round(bmr) }
}

/** Minutos semanales de actividad para comparar con la OMS (la vigorosa cuenta doble en adultos). */
export function whoActivity(m: Member) {
  let mod = 0
  let strengthDays = 0
  for (const x of m.sports ?? []) {
    const sp = SPORTS.find((s) => s.k === x.sport)
    if (!sp) continue
    mod += x.days * x.minutes * (sp.vigorous && !isKid(m) ? 2 : 1)
    if (sp.strength) strengthDays += x.days
  }
  return { modMinutes: mod, strengthDays }
}

export function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { n: 'Bajo peso', tone: 'warn' as const }
  if (bmi < 25) return { n: 'Normal', tone: 'ok' as const }
  if (bmi < 30) return { n: 'Sobrepeso', tone: 'warn' as const }
  return { n: 'Obesidad', tone: 'bad' as const }
}
