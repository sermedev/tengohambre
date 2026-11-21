import { useState } from 'react'
import { db } from '../lib/db'
import { useData } from '../lib/data-context'
import type { PantryItem, Place, Unit } from '../lib/types'
import { STEP, UNITS, ageInfo, pantryIcon, qtyText, today } from '../lib/pantry'
import { Card, Empty, Field, PageTitle, Tabs, btnPrimary, btnSm, input } from '../components/ui'

export function Almacen() {
  const { pantry, recipes, L, reload, ready } = useData()
  const [tab, setTab] = useState<'despensa' | 'frio'>('frio')
  const [name, setName] = useState('')
  const [recipeId, setRecipeId] = useState('')
  const [place, setPlace] = useState<Place>('Nevera')
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState<Unit>('raciones')
  const [err, setErr] = useState<string | null>(null)

  const list = pantry
    .filter((p) => (tab === 'despensa' ? p.place === 'Despensa' : p.place !== 'Despensa'))
    .sort((a, b) => a.place.localeCompare(b.place) || a.added_on.localeCompare(b.added_on))

  async function add() {
    const r = recipeId ? L.recipes.get(recipeId) : undefined
    const n = name.trim() || r?.name
    if (!n) return setErr('Escribe qué es o elige un plato.')
    setErr(null)
    try {
      await db.insert<PantryItem>('pantry_items', [{ name: n, place, qty, unit, recipe_id: recipeId || null, added_on: today() }])
      setName('')
      setRecipeId('')
      setQty(1)
      await reload('pantry_items')
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  async function setQ(p: PantryItem, v: number) {
    await db.update('pantry_items', p.id, { qty: Math.max(0, Math.round(v * 100) / 100) })
    await reload('pantry_items')
  }

  return (
    <>
      <PageTitle sub="Lo que hay en casa. Lo apuntáis a mano; los platos cocinados se pueden poner en el menú desde aquí.">Almacén</PageTitle>
      <Tabs
        tabs={[
          ['frio', 'Nevera y congelador'],
          ['despensa', 'Despensa'],
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t)
          setPlace(t === 'despensa' ? 'Despensa' : 'Nevera')
          setUnit(t === 'despensa' ? 'ud' : 'raciones')
        }}
      />

      <Card className="mb-4">
        <h2 className="mb-3 text-lg">Añadir</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_2fr_9rem_6rem_8rem_auto] lg:items-end">
          <Field label="Qué es">
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder={recipeId ? L.recipes.get(recipeId)?.name : 'Carne picada, lentejas cocidas…'} />
          </Field>
          <Field label="¿Es un plato de tus recetas?">
            <select
              className={input}
              value={recipeId}
              onChange={(e) => {
                setRecipeId(e.target.value)
                if (e.target.value) setUnit('raciones')
              }}
            >
              <option value="">No, es un producto</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dónde">
            <select className={input} value={place} onChange={(e) => setPlace(e.target.value as Place)}>
              <option>Nevera</option>
              <option>Congelador</option>
              <option>Despensa</option>
            </select>
          </Field>
          <Field label="Cantidad">
            <input className={input} type="number" min={0} step={STEP[unit]} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </Field>
          <Field label="Unidad">
            <select className={input} value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
          <button className={btnPrimary} onClick={add}>
            Añadir
          </button>
        </div>
        {err && <p className="mt-2 text-bad">{err}</p>}
        {recipeId && <p className="mt-2 text-sm text-muted">Al ser un plato de tus recetas, la app sabe sus nutrientes cuando lo pongas en el menú.</p>}
      </Card>

      {!ready ? (
        <p className="text-muted">Cargando…</p>
      ) : list.length === 0 ? (
        <Empty>{tab === 'frio' ? 'No hay nada apuntado en la nevera ni en el congelador.' : 'No hay nada apuntado en la despensa.'}</Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((p) => {
            const a = ageInfo(p)
            const r = p.recipe_id ? L.recipes.get(p.recipe_id) : undefined
            return (
              <Card key={p.id} className={`flex flex-wrap items-center gap-3 py-3 ${p.qty <= 0 ? 'opacity-60' : ''}`}>
                <span className="text-2xl" aria-hidden="true">
                  {pantryIcon(p, r?.icon)}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="font-semibold">{p.name}</b>
                  <div className="text-sm text-muted">
                    {p.place} ·{' '}
                    <span className={a.tone === 'bad' ? 'font-semibold text-bad' : a.tone === 'warn' ? 'font-semibold text-warn' : ''}>{a.text}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className={`${btnSm} border border-line`} aria-label="Menos" onClick={() => setQ(p, Number(p.qty) - STEP[p.unit])}>
                    −
                  </button>
                  <span className="num min-w-24 text-center font-semibold">{qtyText(p)}</span>
                  <button className={`${btnSm} border border-line`} aria-label="Más" onClick={() => setQ(p, Number(p.qty) + STEP[p.unit])}>
                    +
                  </button>
                </div>
                <button
                  className={`${btnSm} text-muted`}
                  aria-label={`Borrar ${p.name}`}
                  onClick={async () => {
                    await db.remove('pantry_items', [p.id])
                    await reload('pantry_items')
                  }}
                >
                  ✕
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
