import { useMemo, useState } from 'react'
import { db } from '../lib/db'
import { norm } from '../lib/text'
import { useData } from '../lib/data-context'
import { fmt, highProtein, ingredientsServing, recipeServing, type BedcaFood } from '../lib/nutrition'
import type { Food, MealId, Recipe, RecipeIngredient } from '../lib/types'
import { GROUPS, MEALS, RECIPE_ICONS } from '../data/meals'
import { SUGERIDAS, SUG_SERVINGS, type Sugerida } from '../data/sugeridas'
import { MacroLine, NutTable } from '../components/NutTable'
import { Card, Chip, Empty, Field, Modal, PageTitle, Tabs, btnDanger, btnGhost, btnPrimary, btnSm, input } from '../components/ui'

const count = (r: { groups: string[] }, g: string) => r.groups.filter((x) => x === g).length

const FILTERS: [string, string, (r: { groups: string[]; minutes: number | null; kid_friendly: boolean; meals: MealId[]; hp: boolean }) => boolean][] = [
  ['all', 'Todas', () => true],
  ['proteina', 'Ricas en proteína', (r) => r.hp],
  ['legumbre', 'Legumbre', (r) => count(r, 'legumbre') > 0],
  ['pescado', 'Pescado', (r) => count(r, 'pescado') > 0],
  ['huevo', 'Huevo', (r) => count(r, 'huevo') > 0],
  ['carne', 'Carne', (r) => count(r, 'roja') + count(r, 'blanca') > 0],
  ['verdura', 'Mucha verdura', (r) => count(r, 'verdura') >= 2],
  ['rapidas', 'Rápidas (≤30 min)', (r) => (r.minutes ?? 99) <= 30],
  ['kids', 'Gustan a los niños', (r) => r.kid_friendly],
  ['des', 'Desayuno y meriendas', (r) => r.meals.some((m) => m === 'des' || m === 'mm' || m === 'mer')],
]

type Tab = 'mias' | 'precocinados' | 'sugeridas'

export function Recetas() {
  const { recipes, L, ready } = useData()
  const [tab, setTab] = useState<Tab>('mias')
  const [q, setQ] = useState('')
  const [f, setF] = useState('all')
  const [open, setOpen] = useState<string | null>(null)
  const [openSug, setOpenSug] = useState<Sugerida | null>(null)
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null)
  const [editingPre, setEditingPre] = useState<Recipe | 'new' | null>(null)

  const added = new Set(recipes.map((r) => r.suggested_key).filter(Boolean))
  const sugs = SUGERIDAS.filter((s) => !added.has(s.key))
  const mine = recipes.filter((r) => r.kind === 'receta')
  const pres = recipes.filter((r) => r.kind === 'precocinado')
  const filt = FILTERS.find((x) => x[0] === f)![2]
  const k = norm(q.trim())

  const list = (tab === 'mias' ? mine : pres)
    .map((r) => ({ r, n: recipeServing(r, L) }))
    .filter(({ r, n }) => (!k || norm(r.name).includes(k)) && filt({ ...r, hp: highProtein(n) }))
  const sugList = sugs
    .map((s) => ({ s, n: ingredientsServing(s.ing.map(([id, , g]) => ({ food_ref: `bedca:${id}`, grams: g })), 1, L) }))
    .filter(({ s, n }) => (!k || norm(s.name).includes(k)) && filt({ groups: s.groups, minutes: s.minutes, kid_friendly: s.kids, meals: s.meals, hp: highProtein(n) }))
  const openRecipe = open ? L.recipes.get(open) : undefined

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageTitle>Recetas</PageTitle>
        {tab === 'precocinados' ? (
          <button className={btnPrimary} onClick={() => setEditingPre('new')}>
            + Nuevo precocinado
          </button>
        ) : (
          <button className={btnPrimary} onClick={() => setEditing('new')}>
            + Nueva receta
          </button>
        )}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Tabs
          tabs={[
            ['mias', `Mis recetas (${mine.length})`],
            ['precocinados', `Precocinados (${pres.length})`],
            ['sugeridas', `Sugeridas (${sugs.length})`],
          ]}
          value={tab}
          onChange={setTab}
        />
        <input className={`${input} mb-4 max-w-xs`} placeholder="Buscar receta…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar receta" />
      </div>
      {tab === 'precocinados' && <p className="mb-3 text-sm text-muted">Platos ya preparados del súper (lasaña, sushi, croquetas…). Se crean con los datos de la etiqueta y se usan en el menú como cualquier receta.</p>}
      {tab === 'sugeridas' && <p className="mb-3 text-sm text-muted">Recetas equilibradas y pensadas para niños, con ingredientes de BEDCA que encuentras en Mercadona. Filtra por «Ricas en proteína» para los días de entreno. Ábrelas y añade a tu recetario las que te gusten; luego puedes cambiarlas.</p>}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([key, n]) => (
          <Chip key={key} on={f === key} onClick={() => setF(key)}>
            {n}
          </Chip>
        ))}
      </div>

      {!ready ? (
        <p className="text-muted">Cargando…</p>
      ) : tab === 'sugeridas' ? (
        sugList.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
            {sugList.map(({ s, n }) => (
              <RecipeCard key={s.key} icon={s.icon} name={s.name} sub={`${fmt(n.kcal)} kcal · ${fmt(n.protein_g)} g prot. · ${s.minutes} min`} hp={highProtein(n)} groups={s.groups} note={s.why} onClick={() => setOpenSug(s)} />
            ))}
          </div>
        ) : (
          <Empty>{k || f !== 'all' ? 'No hay sugerencias con ese filtro.' : 'Ya has añadido todas las sugerencias.'}</Empty>
        )
      ) : list.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
          {list.map(({ r, n }) => (
            <RecipeCard
              key={r.id}
              icon={r.icon}
              name={r.name}
              hp={highProtein(n)}
              sub={`${fmt(n.kcal)} kcal · ${fmt(n.protein_g)} g prot.${r.kind === 'precocinado' ? ` · ${fmt(Number(r.portion_g ?? 0))} g` : r.minutes ? ` · ${r.minutes} min` : ''}`}
              groups={r.groups}
              onClick={() => setOpen(r.id)}
            />
          ))}
        </div>
      ) : (
        <Empty>
          {k || f !== 'all'
            ? 'No hay recetas con ese filtro.'
            : tab === 'mias'
              ? 'Aún no tienes recetas. Empieza por las Sugeridas o crea una nueva.'
              : 'Aún no hay precocinados. Créalos con los datos de su etiqueta.'}
        </Empty>
      )}

      {openRecipe && (
        <RecipeDetail
          r={openRecipe}
          onClose={() => setOpen(null)}
          onEdit={() => {
            setOpen(null)
            if (openRecipe.kind === 'precocinado') setEditingPre(openRecipe)
            else setEditing(openRecipe)
          }}
        />
      )}
      {openSug && <SugeridaDetail s={openSug} onClose={() => setOpenSug(null)} />}
      {editing && <RecipeEditor r={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {editingPre && <PreEditor r={editingPre === 'new' ? null : editingPre} onClose={() => setEditingPre(null)} />}
    </>
  )
}

function GroupBadges({ groups, hp }: { groups: string[]; hp?: boolean }) {
  const uniq = [...new Set(groups)].filter((g) => g !== 'lacteo' && g !== 'fruta')
  return (
    <span className="flex flex-wrap gap-1">
      {hp && <ProteinBadge />}
      {uniq.map((g) => (
        <span key={g} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${g === 'roja' || g === 'precocinado' ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok'}`}>
          {GROUPS.find((x) => x.k === g)?.n.split(' ')[0] ?? g}
        </span>
      ))}
    </span>
  )
}

function ProteinBadge() {
  return <span className="rounded-full bg-warm-soft px-2 py-0.5 text-xs font-semibold text-warm" title="Al menos el 20 % de la energía de proteína y 15 g por ración">💪 Proteína</span>
}

function RecipeCard({ icon, name, sub, groups, note, hp, onClick }: { icon: string; name: string; sub: string; groups: string[]; note?: string; hp?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-start gap-1.5 rounded-card border border-line bg-surface p-3 text-left shadow-card hover:border-accent">
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <b className="font-semibold">{name}</b>
      <span className="num text-sm text-muted">{sub}</span>
      <GroupBadges groups={groups} hp={hp} />
      {note && <span className="text-sm">{note}</span>}
    </button>
  )
}

function MealsLine({ meals }: { meals: MealId[] }) {
  return <span>{MEALS.filter((m) => meals.includes(m.id)).map((m) => m.name).join(', ') || 'Cualquier comida'}</span>
}

function RecipeDetail({ r, onClose, onEdit }: { r: Recipe; onClose: () => void; onEdit: () => void }) {
  const { L, reload } = useData()
  const n = recipeServing(r, L)
  const ings = L.ingredients.get(r.id) ?? []
  const food = r.food_id ? L.foods.get(r.food_id) : undefined
  const [confirm, setConfirm] = useState(false)

  async function del() {
    await db.remove('recipes', [r.id])
    if (r.food_id) await db.remove('foods', [r.food_id])
    await Promise.all([reload('recipes'), reload('recipe_ingredients'), reload('foods')])
    onClose()
  }

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <span aria-hidden="true">{r.icon}</span> {r.name}
        </span>
      }
      onClose={onClose}
      wide
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            <MealsLine meals={r.meals} />
            {r.minutes ? ` · ${r.minutes} min` : ''}
            {r.kind === 'receta' ? ` · ${fmt(Number(r.servings))} raciones de adulto` : ''}
          </p>
          <GroupBadges groups={r.groups} />
          {r.kind === 'precocinado' ? (
            <div className="text-sm">
              <p>
                {food?.brand && <b>{food.brand}</b>} {food?.store && <span className="text-muted">· {food.store}</span>}
              </p>
              <p className="text-muted">
                Ración: {fmt(Number(r.portion_g ?? 0))} g{r.pack_portions ? ` · ${fmt(Number(r.pack_portions), 1)} raciones por envase` : ''}. Datos de la etiqueta.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="mb-1 text-base">Ingredientes ({fmt(Number(r.servings))} raciones)</h3>
              {ings.length ? (
                <ul className="text-sm">
                  {ings.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3 border-t border-line py-1">
                      <span>{i.name}</span>
                      <span className="num text-muted">{fmt(Number(i.grams))} g</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Sin ingredientes: añádelos para calcular los nutrientes.</p>
              )}
            </div>
          )}
          {r.steps && (
            <div>
              <h3 className="mb-1 text-base">Preparación</h3>
              <ol className="list-decimal pl-5 text-sm">
                {r.steps
                  .split('\n')
                  .filter((s) => s.trim())
                  .map((s, i) => (
                    <li key={i} className="py-0.5">
                      {s}
                    </li>
                  ))}
              </ol>
            </div>
          )}
          {r.note && <p className="text-sm">{r.note}</p>}
        </div>
        <div>
          <NutTable n={n} caption="Por ración de adulto" />
          <p className="mt-2 text-xs text-muted">
            {r.kind === 'precocinado' ? 'Fuente: etiqueta del producto.' : 'Fuente: BEDCA (AESAN), por 100 g de parte comestible.'} Los niños comen una parte de esta ración, según su perfil en Seguimiento.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className={btnPrimary} onClick={onEdit}>
          Editar
        </button>
        {confirm ? (
          <button className={btnDanger} onClick={del}>
            Sí, borrar (también del menú)
          </button>
        ) : (
          <button className={btnGhost} onClick={() => setConfirm(true)}>
            Borrar
          </button>
        )}
      </div>
    </Modal>
  )
}

function SugeridaDetail({ s, onClose }: { s: Sugerida; onClose: () => void }) {
  const { L, reload, bedca } = useData()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const n = ingredientsServing(s.ing.map(([id, , g]) => ({ food_ref: `bedca:${id}`, grams: g })), 1, L)

  async function add() {
    setBusy(true)
    setErr(null)
    try {
      const [r] = await db.insert<Recipe>('recipes', [
        { name: s.name, icon: s.icon, kind: 'receta', servings: SUG_SERVINGS, minutes: s.minutes, meals: s.meals, groups: s.groups, steps: s.steps.join('\n'), note: s.why ?? null, kid_friendly: s.kids, suggested_key: s.key },
      ])
      await db.insert<RecipeIngredient>(
        'recipe_ingredients',
        s.ing.map(([id, name, g], i) => ({ recipe_id: r.id, food_ref: `bedca:${id}`, name, grams: g * SUG_SERVINGS, position: i })),
      )
      await Promise.all([reload('recipes'), reload('recipe_ingredients')])
      onClose()
    } catch (e) {
      setErr((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <span aria-hidden="true">{s.icon}</span> {s.name}
        </span>
      }
      onClose={onClose}
      wide
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            <MealsLine meals={s.meals} /> · {s.minutes} min
          </p>
          {s.why && <p className="text-sm">{s.why}</p>}
          <div>
            <h3 className="mb-1 text-base">Ingredientes por ración de adulto</h3>
            <ul className="text-sm">
              {s.ing.map(([id, name, g]) => (
                <li key={id + name} className="flex justify-between gap-3 border-t border-line py-1">
                  <span>
                    {name}
                    <span className="block text-xs text-muted">BEDCA: {bedca.get(id)?.name ?? '—'}</span>
                  </span>
                  <span className="num text-muted">{g} g</span>
                </li>
              ))}
            </ul>
          </div>
          <ol className="list-decimal pl-5 text-sm">
            {s.steps.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>
        </div>
        <NutTable n={n} caption="Por ración de adulto" />
      </div>
      <button className={`${btnPrimary} mt-5`} disabled={busy} onClick={add}>
        {busy ? 'Añadiendo…' : 'Añadir a mis recetas'}
      </button>
      {err && <p className="mt-2 text-bad">No se pudo añadir: {err}</p>}
    </Modal>
  )
}

// ───────── Editor de recetas ─────────
type IngDraft = { food_ref: string; name: string; grams: number }

function MealsPicker({ value, onChange }: { value: MealId[]; onChange: (v: MealId[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MEALS.map((m) => (
        <Chip key={m.id} on={value.includes(m.id)} onClick={() => onChange(value.includes(m.id) ? value.filter((x) => x !== m.id) : [...value, m.id])}>
          {m.name}
        </Chip>
      ))}
    </div>
  )
}

function GroupsPicker({ value, onChange, exclude = [] }: { value: string[]; onChange: (v: string[]) => void; exclude?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GROUPS.filter((g) => !exclude.includes(g.k)).map((g) => {
        const c = value.filter((x) => x === g.k).length
        const canDouble = g.k === 'verdura' || g.k === 'fruta'
        return (
          <Chip
            key={g.k}
            on={c > 0}
            title={canDouble ? 'Toca otra vez para 2 raciones' : undefined}
            onClick={() => {
              const rest = value.filter((x) => x !== g.k)
              if (c === 0) onChange([...rest, g.k])
              else if (c === 1 && canDouble) onChange([...rest, g.k, g.k])
              else onChange(rest)
            }}
          >
            {g.n}
            {c > 1 ? ' ×2' : ''}
          </Chip>
        )
      })}
    </div>
  )
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {RECIPE_ICONS.map((ic) => (
        <button key={ic} type="button" onClick={() => onChange(ic)} aria-pressed={value === ic} className={`grid size-9 place-items-center rounded-lg text-xl ${value === ic ? 'bg-accent-soft ring-2 ring-accent' : 'hover:bg-surface-2'}`}>
          {ic}
        </button>
      ))}
    </div>
  )
}

function FoodSearch({ onPick }: { onPick: (f: BedcaFood | Food, ref: string) => void }) {
  const { bedca, foods } = useData()
  const [q, setQ] = useState('')
  const res = useMemo(() => {
    const k = norm(q.trim())
    if (k.length < 2) return []
    const words = k.split(/\s+/)
    const match = (name: string) => words.every((w) => norm(name).includes(w))
    const own = foods.filter((f) => match(f.name)).map((f) => ({ ref: `food:${f.id}`, f, label: f.name, sub: `Etiqueta${f.brand ? ` · ${f.brand}` : ''} · ${fmt(Number(f.kcal ?? 0))} kcal/100 g` }))
    const bd = [...bedca.values()]
      .filter((f) => match(f.name))
      .sort((a, b) => (norm(a.name).startsWith(words[0]) ? 0 : 1) - (norm(b.name).startsWith(words[0]) ? 0 : 1) || a.name.length - b.name.length)
      .map((f) => ({ ref: `bedca:${f.id}`, f, label: f.name, sub: `BEDCA · ${fmt(f.kcal ?? 0)} kcal/100 g` }))
    return [...own, ...bd].slice(0, 12)
  }, [q, bedca, foods])

  return (
    <div>
      <input className={input} placeholder="Añadir ingrediente: busca en BEDCA (p. ej. «lenteja», «pollo pechuga»)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar ingrediente" />
      {res.length > 0 && (
        <div className="mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface shadow-card">
          {res.map((x) => (
            <button
              key={x.ref}
              type="button"
              className="flex w-full flex-col items-start border-t border-line px-3 py-2 text-left first:border-t-0 hover:bg-surface-2"
              onClick={() => {
                onPick(x.f, x.ref)
                setQ('')
              }}
            >
              <span>{x.label}</span>
              <span className="text-xs text-muted">{x.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Nombre corto para la lista: "Lenteja, seca, cruda" → "Lenteja". */
const shortName = (n: string) => n.split(',')[0]

function RecipeEditor({ r, onClose }: { r: Recipe | null; onClose: () => void }) {
  const { L, reload } = useData()
  const [name, setName] = useState(r?.name ?? '')
  const [icon, setIcon] = useState(r?.icon ?? '🍲')
  const [servings, setServings] = useState(Number(r?.servings ?? 4))
  const [minutes, setMinutes] = useState<number | ''>(r?.minutes ?? '')
  const [meals, setMeals] = useState<MealId[]>(r?.meals ?? ['com', 'cen'])
  const [groups, setGroups] = useState<string[]>(r?.groups ?? [])
  const [kids, setKids] = useState(r?.kid_friendly ?? true)
  const [steps, setSteps] = useState(r?.steps ?? '')
  const [ings, setIngs] = useState<IngDraft[]>((r ? (L.ingredients.get(r.id) ?? []) : []).map((i) => ({ food_ref: i.food_ref, name: i.name, grams: Number(i.grams) })))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const n = ingredientsServing(ings, servings, L)
  const refLabel = (ref: string) => {
    const [src, id] = ref.split(':')
    if (src === 'bedca') return `BEDCA: ${L.bedca.get(Number(id))?.name ?? 'alimento no encontrado'}`
    return `Etiqueta: ${L.foods.get(id)?.name ?? 'producto borrado'}`
  }

  async function save() {
    if (!name.trim()) return setErr('Ponle un nombre.')
    setBusy(true)
    setErr(null)
    try {
      const row = { name: name.trim(), icon, servings: servings || 1, minutes: minutes === '' ? null : minutes, meals, groups, kid_friendly: kids, steps: steps.trim() || null }
      let id = r?.id
      if (id) {
        await db.update('recipes', id, row)
        await db.remove('recipe_ingredients', (L.ingredients.get(id) ?? []).map((i) => i.id))
      } else {
        id = (await db.insert<Recipe>('recipes', [{ ...row, kind: 'receta' }]))[0].id
      }
      if (ings.length) await db.insert<RecipeIngredient>('recipe_ingredients', ings.map((i, position) => ({ recipe_id: id, food_ref: i.food_ref, name: i.name, grams: i.grams, position })))
      await Promise.all([reload('recipes'), reload('recipe_ingredients')])
      onClose()
    } catch (e) {
      setErr((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Modal title={r ? 'Editar receta' : 'Nueva receta'} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Lentejas de la abuela" />
        </Field>
        <Field label="Icono" group>
          <IconPicker value={icon} onChange={setIcon} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Raciones de adulto" hint="Las cantidades de abajo son para todas estas raciones">
            <input className={input} type="number" min={1} step={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} />
          </Field>
          <Field label="Minutos">
            <input className={input} type="number" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value === '' ? '' : Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Para qué comidas" group>
          <MealsPicker value={meals} onChange={setMeals} />
        </Field>
        <Field label="Qué lleva (para el equilibrio de la semana)" group>
          <GroupsPicker value={groups} onChange={setGroups} exclude={['precocinado']} />
        </Field>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={kids} onChange={(e) => setKids(e.target.checked)} /> Les gusta a los niños
        </label>

        <div>
          <h3 className="mb-1 text-base">Ingredientes</h3>
          <p className="mb-2 text-xs text-muted">Gramos de la parte que se come (limpio, sin piel ni hueso) y en crudo o seco, como en BEDCA.</p>
          <div className="flex flex-col gap-2">
            {ings.map((i, ix) => (
              <div key={ix} className="grid grid-cols-[1fr_6rem_auto] items-start gap-2">
                <div>
                  <input className={input} value={i.name} aria-label="Nombre del ingrediente" onChange={(e) => setIngs(ings.map((x, j) => (j === ix ? { ...x, name: e.target.value } : x)))} />
                  <span className="mt-0.5 block text-xs text-muted">{refLabel(i.food_ref)}</span>
                </div>
                <div className="relative">
                  <input className={`${input} pr-7 text-right`} type="number" min={0} aria-label="Gramos" value={i.grams} onChange={(e) => setIngs(ings.map((x, j) => (j === ix ? { ...x, grams: Number(e.target.value) } : x)))} />
                  <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted">g</span>
                </div>
                <button type="button" className={`${btnSm} mt-1.5 text-muted`} aria-label={`Quitar ${i.name}`} onClick={() => setIngs(ings.filter((_, j) => j !== ix))}>
                  ✕
                </button>
              </div>
            ))}
            <FoodSearch onPick={(f, ref) => setIngs([...ings, { food_ref: ref, name: shortName(f.name), grams: 100 }])} />
          </div>
          <p className="mt-2 text-sm">
            <b className="num">{fmt(n.kcal)} kcal</b> por ración · <MacroLine n={n} />
          </p>
        </div>

        <Field label="Preparación" hint="Un paso por línea">
          <textarea className={`${input} min-h-28`} value={steps} onChange={(e) => setSteps(e.target.value)} />
        </Field>
        {err && <p className="text-bad">{err}</p>}
        <div className="flex gap-2">
          <button className={btnPrimary} onClick={save} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
          <button className={btnGhost} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ───────── Editor de precocinados (datos de la etiqueta) ─────────
const LABEL_FIELDS: [keyof Food, string][] = [
  ['kcal', 'Energía (kcal)'],
  ['fat_g', 'Grasas (g)'],
  ['sat_fat_g', 'de las cuales saturadas (g)'],
  ['carbs_g', 'Hidratos de carbono (g)'],
  ['sugars_g', 'de los cuales azúcares (g)'],
  ['fiber_g', 'Fibra (g)'],
  ['protein_g', 'Proteínas (g)'],
  ['salt_g', 'Sal (g)'],
]

function PreEditor({ r, onClose }: { r: Recipe | null; onClose: () => void }) {
  const { L, reload } = useData()
  const food = r?.food_id ? L.foods.get(r.food_id) : undefined
  const [name, setName] = useState(r?.name ?? '')
  const [icon, setIcon] = useState(r?.icon ?? '🍝')
  const [brand, setBrand] = useState(food?.brand ?? '')
  const [store, setStore] = useState(food?.store ?? 'Mercadona')
  const [label, setLabel] = useState<Record<string, number | ''>>(Object.fromEntries(LABEL_FIELDS.map(([k]) => [k, food?.[k] == null ? '' : Number(food[k])])))
  const [portion, setPortion] = useState<number | ''>(r?.portion_g ?? '')
  const [pack, setPack] = useState<number | ''>(r?.pack_portions ?? '')
  const [meals, setMeals] = useState<MealId[]>(r?.meals ?? ['com', 'cen'])
  const [groups, setGroups] = useState<string[]>(r?.groups.filter((g) => g !== 'precocinado') ?? [])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    if (!name.trim()) return setErr('Ponle un nombre.')
    if (label.kcal === '' || !portion) return setErr('Faltan las kcal por 100 g o los gramos por ración.')
    setBusy(true)
    setErr(null)
    try {
      const f = { name: name.trim(), brand: brand.trim() || null, store: store.trim() || null, source: 'etiqueta', ...Object.fromEntries(LABEL_FIELDS.map(([k]) => [k, label[k] === '' ? null : label[k]])) }
      let foodId = food?.id
      if (foodId) await db.update('foods', foodId, f)
      else foodId = (await db.insert<Food>('foods', [f as Partial<Food>]))[0].id
      const row = { name: name.trim(), icon, kind: 'precocinado', food_id: foodId, servings: 1, portion_g: portion, pack_portions: pack === '' ? null : pack, meals, groups: ['precocinado', ...groups], minutes: null }
      if (r) await db.update('recipes', r.id, row)
      else await db.insert<Recipe>('recipes', [row as Partial<Recipe>])
      await Promise.all([reload('foods'), reload('recipes')])
      onClose()
    } catch (e) {
      setErr((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Modal title={r ? 'Editar precocinado' : 'Nuevo precocinado'} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Lasaña boloñesa" />
        </Field>
        <Field label="Icono" group>
          <IconPicker value={icon} onChange={setIcon} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca">
            <input className={input} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Hacendado" />
          </Field>
          <Field label="Tienda">
            <input className={input} value={store} onChange={(e) => setStore(e.target.value)} list="stores" />
            <datalist id="stores">
              <option value="Mercadona" />
              <option value="Aldi" />
              <option value="Carrefour" />
            </datalist>
          </Field>
        </div>
        <Card className="bg-surface-2">
          <h3 className="mb-2 text-base">Información nutricional por 100 g (de la etiqueta)</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LABEL_FIELDS.map(([k, l]) => (
              <Field key={k} label={l}>
                <input className={input} type="number" min={0} step="0.1" value={label[k]} onChange={(e) => setLabel({ ...label, [k]: e.target.value === '' ? '' : Number(e.target.value) })} />
              </Field>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gramos por ración de adulto" hint="Lo que pone la etiqueta o lo que coméis">
            <input className={input} type="number" min={1} value={portion} onChange={(e) => setPortion(e.target.value === '' ? '' : Number(e.target.value))} />
          </Field>
          <Field label="Raciones por envase">
            <input className={input} type="number" min={0} step="0.5" value={pack} onChange={(e) => setPack(e.target.value === '' ? '' : Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Para qué comidas" group>
          <MealsPicker value={meals} onChange={setMeals} />
        </Field>
        <Field label="Qué lleva (además de contar como precocinado)" group>
          <GroupsPicker value={groups} onChange={setGroups} exclude={['precocinado']} />
        </Field>
        {err && <p className="text-bad">{err}</p>}
        <div className="flex gap-2">
          <button className={btnPrimary} onClick={save} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
          <button className={btnGhost} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  )
}
