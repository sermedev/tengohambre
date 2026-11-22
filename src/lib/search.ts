/**
 * Búsqueda tolerante de alimentos (y de cualquier lista con nombre).
 *
 * BEDCA nombra los alimentos al estilo de una tabla («Pimiento rojo, crudo»,
 * «Pollo, pechuga, plancha», «Brécol, crudo»), y la gente busca como habla
 * («pechuga de pollo», «espinacas», «brócoli», «mahonesa»). Aquí se resuelve:
 *  - sin tildes, mayúsculas ni signos;
 *  - las palabras en cualquier orden y empezadas («pech poll»);
 *  - singular y plural («espinacas» → «Espinaca»);
 *  - palabras de relleno fuera («nata para cocinar» → nata + cocinar);
 *  - sinónimos coloquiales (SINONIMOS);
 *  - una errata en palabras de 5 letras o más («mahonesa» ≈ «mayonesa»).
 * Si nada coincide con todas las palabras, devuelve los más parecidos
 * marcados como `partial`, para no dejar la lista vacía.
 */

const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'con', 'y', 'e', 'en', 'a', 'al', 'para', 'sin', 'un', 'una'])

/** Minúsculas, sin tildes ni signos. La ñ queda como n (igual en búsqueda y nombre). */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Quita el plural: espinacas → espinaca, melones → melon, nueces → nuez. */
export function stem(w: string) {
  if (w.length <= 3) return w
  if (w.endsWith('ces')) return w.slice(0, -3) + 'z'
  if (w.endsWith('es') && /[lnrdjy]es$/.test(w) && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

const tokens = (s: string) => fold(s).split(' ').filter(Boolean).map(stem)

/**
 * Cómo se dice → cómo lo llama BEDCA. Solo equivalencias del mismo alimento
 * (no se cambia un alimento por otro parecido). Claves y valores sin tildes.
 */
const SINONIMOS: Record<string, string[]> = {
  mahonesa: ['mayonesa'],
  brocoli: ['brecol'],
  broculi: ['brecol'],
  brocol: ['brecol'],
  macarron: ['pasta alimenticia'],
  espagueti: ['pasta alimenticia'],
  spaghetti: ['pasta alimenticia'],
  tallarin: ['pasta alimenticia'],
  fideo: ['pasta alimenticia'],
  lacito: ['pasta alimenticia'],
  helice: ['pasta alimenticia'],
  york: ['jamon cocido'],
  maicena: ['almidon maiz'],
  alubia: ['judia'],
  judia: ['alubia'],
  habichuela: ['judia'],
  frijol: ['judia'],
  cocido: ['hervido'],
  hervido: ['cocido'],
  papa: ['patata'],
  banana: ['platano'],
  durazno: ['melocoton'],
  yogurt: ['yogur'],
  yoghurt: ['yogur'],
  catsup: ['ketchup'],
  zucchini: ['calabacin'],
  light: ['baja calorias', 'bajo calorias'],
  aove: ['aceite oliva virgen extra'],
  emperador: ['pez espada'],
  pez: ['emperador'],
  boniato: ['batata'],
  batata: ['boniato'],
}

/** Sinónimos indexados ya en raíz (singular, sin tildes). */
const SYN = new Map<string, string[][]>()
for (const [k, vs] of Object.entries(SINONIMOS)) {
  const key = tokens(k).join(' ')
  const alts = vs.map(tokens).filter((a) => a.join(' ') !== key)
  if (alts.length) SYN.set(key, [...(SYN.get(key) ?? []), ...alts])
}

/** Distancia de edición ≤ 1 (sustituir, quitar o añadir una letra). */
function oneEdit(a: string, b: string) {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1)
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1)
}

/** Lo bien que una palabra buscada encaja con una palabra del nombre: 3 igual, 2 empieza, 1 errata, 0 nada. */
function wordScore(q: string, w: string, fuzzy: boolean) {
  if (w === q) return 3
  if (w.startsWith(q)) return 2
  if (fuzzy && q.length >= 5) {
    if (oneEdit(q, w)) return 1
    // errata mientras aún se escribe: compara con el principio de la palabra
    if (w.length > q.length && oneEdit(q, w.slice(0, q.length))) return 1
  }
  return 0
}

type Query = { alts: string[][][]; first: string }

/** Prepara la búsqueda: por cada palabra, sus alternativas (ella misma o sus sinónimos). */
export function parseQuery(q: string): Query | null {
  const all = tokens(q)
  const ws = all.filter((w) => !STOP.has(w))
  const use = ws.length ? ws : all
  if (!use.length) return null
  // sinónimos de dos palabras («jamon york») y de una
  const alts: string[][][] = []
  for (let i = 0; i < use.length; i++) {
    const pair = i + 1 < use.length ? `${use[i]} ${use[i + 1]}` : ''
    if (pair && SYN.has(pair)) {
      alts.push([[use[i], use[i + 1]], ...SYN.get(pair)!])
      i++
      continue
    }
    alts.push([[use[i]], ...(SYN.get(use[i]) ?? [])])
  }
  return { alts, first: use[0] }
}

type Scored = { score: number; hits: number; first: boolean }

function scoreName(query: Query, name: string, fuzzy: boolean): Scored {
  const ws = tokens(name)
  let score = 0
  let hits = 0
  let first = false
  for (const [i, options] of query.alts.entries()) {
    let best = 0
    for (const opt of options) {
      let s = 0
      for (const q of opt) {
        const m = Math.max(0, ...ws.map((w) => wordScore(q, w, fuzzy)))
        if (!m) {
          s = 0
          break
        }
        s += m
      }
      // un sinónimo cuenta un poco menos que la palabra tal cual
      if (s && opt !== options[0]) s -= 0.5
      best = Math.max(best, s / opt.length)
    }
    if (best) hits++
    if (best && i === 0) first = true
    score += best
  }
  // el alimento «es» lo primero que se escribe: «Pimiento rojo» antes que «Paté de pimienta»
  if (ws.length && query.alts[0].some((o) => wordScore(o[0], ws[0], false) >= 2)) score += 2
  return { score, hits, first }
}

export type SearchResult<T> = { items: T[]; partial: boolean }

/**
 * Busca en una lista. Devuelve primero lo que coincide con todas las palabras,
 * de mejor a peor; si no hay nada, lo que coincide con alguna (`partial`).
 */
export function searchByName<T>(items: Iterable<T>, q: string, name: (x: T) => string, limit = 60): SearchResult<T> {
  const query = parseQuery(q)
  const arr = [...items]
  if (!query) return { items: arr.slice(0, limit), partial: false }
  const n = query.alts.length
  const run = (fuzzy: boolean) => arr.map((x) => ({ x, nm: name(x), ...scoreName(query, name(x), fuzzy) })).filter((s) => s.hits > 0)
  // las erratas solo se miran si sin ellas no sale nada completo
  const exact = run(false)
  let scored = exact
  let full = scored.filter((s) => s.hits === n)
  if (!full.length) {
    const fz = run(true)
    full = fz.filter((s) => s.hits === n)
    if (full.length || !exact.some((s) => s.first)) scored = fz
  }
  // sin coincidencia completa: lo que comparte la primera palabra (el alimento) va antes
  const withFirst = scored.filter((s) => s.first)
  const pool = full.length ? full : withFirst.length ? withFirst : scored
  pool.sort((a, b) => b.hits - a.hits || b.score - a.score || a.nm.length - b.nm.length || a.nm.localeCompare(b.nm, 'es'))
  return { items: pool.slice(0, limit).map((s) => s.x), partial: !full.length && pool.length > 0 }
}

/** ¿Encaja este nombre con la búsqueda? (todas las palabras). Para filtros simples. */
export function matchesName(q: string, name: string) {
  const query = parseQuery(q)
  if (!query) return true
  const n = query.alts.length
  return scoreName(query, name, false).hits === n || scoreName(query, name, true).hits === n
}
