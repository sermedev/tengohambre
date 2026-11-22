// Menús semanales tipo: guardar una semana por día de la semana y ponerla en otra.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fromWeek, toWeek, templateSummary } from '../src/lib/templates.ts'

const monday = '2026-11-23'
const week = [
  { id: 'a', day: '2026-11-23', meal: 'com', position: 0, recipe_id: 'r1', pantry_item_id: null, eat_out: null, label: null, portions: { kid: 1 } },
  { id: 'b', day: '2026-11-23', meal: 'com', position: 1, recipe_id: 'r2', pantry_item_id: null, eat_out: null, label: null, portions: {} },
  { id: 'c', day: '2026-11-25', meal: 'cen', position: 0, recipe_id: 'r1', pantry_item_id: 'p1', eat_out: null, label: 'Lentejas (sobras)', portions: { mama: 0 } },
  { id: 'd', day: '2026-11-28', meal: 'com', position: 0, recipe_id: null, pantry_item_id: null, eat_out: 'normal', label: null, portions: {} },
  { id: 'e', day: '2026-11-29', meal: 'mer', position: 0, recipe_id: null, pantry_item_id: 'p2', eat_out: null, label: 'Bizcocho casero', portions: {} },
  { id: 'x', day: '2026-11-30', meal: 'des', position: 0, recipe_id: 'r1', pantry_item_id: null, eat_out: null, label: null, portions: {} },
]

test('guardar: día de la semana, sin fechas ni almacén', () => {
  const t = fromWeek(week, monday)
  assert.equal(t.length, 5) // el lunes siguiente no entra
  assert.deepEqual(t.map((i) => i.dow), [0, 0, 2, 5, 6])
  assert.deepEqual(t[0].portions, { kid: 1 })
  // Sobras con receta → la receta; sin receta → su nombre
  assert.equal(t[2].recipe_id, 'r1')
  assert.equal(t[2].label, null)
  assert.deepEqual(t[2].portions, { mama: 0 })
  assert.equal(t[4].recipe_id, null)
  assert.equal(t[4].label, 'Bizcocho casero')
  assert.ok(t.every((i) => !('pantry_item_id' in i) && !('day' in i)))
  assert.equal(templateSummary(t), '5 platos · 4 días')
})

test('aplicar a otra semana (cruza de mes) reemplazando', () => {
  const t = fromWeek(week, monday)
  const { rows, skipped } = toWeek(t, '2026-12-28', () => true)
  assert.equal(skipped, 0)
  assert.deepEqual(rows.map((r) => r.day), ['2026-12-28', '2026-12-28', '2026-12-30', '2027-01-02', '2027-01-03'])
  assert.deepEqual(rows.map((r) => r.position), [0, 1, 0, 0, 0])
  assert.ok(rows.every((r) => r.pantry_item_id === null))
  assert.equal(rows[3].eat_out, 'normal')
})

test('aplicar añadiendo: va detrás de lo que ya hay', () => {
  const t = fromWeek(week, monday)
  const existing = [{ id: 'z', day: '2026-11-30', meal: 'com', position: 3 }]
  const { rows } = toWeek(t, '2026-11-30', () => true, existing)
  assert.deepEqual(rows.filter((r) => r.day === '2026-11-30' && r.meal === 'com').map((r) => r.position), [4, 5])
})

test('se saltan las recetas borradas', () => {
  const t = fromWeek(week, monday)
  const { rows, skipped } = toWeek(t, monday, (id) => id !== 'r1')
  assert.equal(skipped, 2)
  assert.equal(rows.length, 3)
})
