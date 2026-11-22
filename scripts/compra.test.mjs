// Lista de la compra desde el menú: raciones escaladas, precocinados por envases, almacén descontado.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { menuNeeds, sameProduct, sectionOf, qtyLabel } from '../src/lib/shopping.ts'

const members = [
  { id: 'p', default_portion: 1 },
  { id: 'm', default_portion: 0.8 },
  { id: 'a', default_portion: 0.7 },
  { id: 'b', default_portion: 0.6 },
]
const lentejas = { id: 'r1', name: 'Lentejas con verduras', kind: 'receta', servings: 4 }
const pizza = { id: 'r2', name: 'Pizza de jamón', kind: 'precocinado', servings: 1, pack_portions: 2 }
const tortilla = { id: 'r3', name: 'Tortilla', kind: 'receta', servings: 4 }
const recipes = new Map([lentejas, pizza, tortilla].map((r) => [r.id, r]))
const ingredients = new Map([
  ['r1', [{ food_ref: 'bedca:1065', name: 'Lentejas', grams: 320 }, { food_ref: 'bedca:2', name: 'Zanahoria', grams: 200 }]],
  ['r3', [{ food_ref: 'bedca:2127', name: 'Huevos', grams: 400 }]],
])
const item = (o) => ({ day: '2026-11-23', meal: 'com', portions: {}, recipe_id: null, pantry_item_id: null, eat_out: null, ...o })
const edible = (ref) => ({ 'bedca:2127': 0.88 })[ref]

test('mismo producto por palabras', () => {
  assert.ok(sameProduct('Pollo', 'Pechuga de pollo'))
  assert.ok(sameProduct('Lentejas pardinas', 'Lentejas'))
  assert.ok(sameProduct('Nueces', 'Nuez'))
  assert.ok(!sameProduct('Leche entera', 'Leche semidesnatada'))
  assert.ok(!sameProduct('Pechuga de pavo', 'Pechuga de pollo'))
})

test('sección según el catálogo', () => {
  assert.equal(sectionOf('Lentejas'), 'Despensa')
  assert.equal(sectionOf('Huevos'), 'Lácteos y huevos')
  assert.equal(sectionOf('Zanahoria'), 'Fruta y verdura')
  assert.equal(sectionOf('Cosa rara'), 'Otros')
  assert.equal(sectionOf('Cosa rara', [{ name: 'Cosa rara', section: 'Bebidas' }]), 'Bebidas')
})

test('raciones escaladas, fuera de casa y sobras no suman', () => {
  const items = [
    item({ recipe_id: 'r1' }), // 3,1 raciones
    item({ recipe_id: 'r1', portions: { b: 0 } }), // 2,5 raciones
    item({ eat_out: 'normal' }),
    item({ pantry_item_id: 'x', recipe_id: 'r1' }),
  ]
  const n = menuNeeds(items, { members, recipes, ingredients, pantry: [] })
  const l = n.lines.find((x) => x.name === 'Lentejas')
  assert.equal(Math.round(l.needG), Math.round((320 * 5.6) / 4)) // 448 g
  assert.equal(l.qty, 450)
  assert.equal(n.skippedOut, 1)
  assert.equal(n.skippedLeftovers, 1)
})

test('descuenta el almacén en g/kg y avisa de paquetes', () => {
  const pantry = [
    { id: 'p1', name: 'Lentejas pardinas', place: 'Despensa', qty: 0.3, unit: 'kg', recipe_id: null },
    { id: 'p2', name: 'Zanahorias', place: 'Nevera', qty: 1, unit: 'paquetes', recipe_id: null },
  ]
  const n = menuNeeds([item({ recipe_id: 'r1' })], { members, recipes, ingredients, pantry })
  const l = n.lines.find((x) => x.name === 'Lentejas')
  assert.ok(l.covered) // 248 g ≤ 300 g
  const z = n.lines.find((x) => x.name === 'Zanahoria')
  assert.ok(!z.covered)
  assert.equal(z.check.length, 1)
})

test('huevos en unidades con la fracción comestible', () => {
  const n = menuNeeds([item({ recipe_id: 'r3', portions: { m: 1, a: 1, b: 1 } })], { members, recipes, ingredients, pantry: [], edible })
  const h = n.lines[0]
  assert.equal(h.unit, 'ud')
  assert.equal(h.qty, Math.ceil(400 / (58 * 0.88))) // 8
})

test('precocinados por envases, descontando raciones guardadas', () => {
  const items = [item({ recipe_id: 'r2' }), item({ recipe_id: 'r2', day: '2026-11-24' })] // 3,1 × 2 = 6,2 raciones
  const pantry = [{ id: 'p3', name: 'Pizza', place: 'Congelador', qty: 1, unit: 'paquetes', recipe_id: 'r2' }]
  const n = menuNeeds(items, { members, recipes, ingredients, pantry })
  const p = n.lines[0]
  assert.equal(p.unit, 'envases')
  assert.equal(p.qty, Math.ceil((6.2 - 2) / 2)) // 3
  assert.equal(p.section, 'Platos preparados')
})

test('cantidades legibles', () => {
  assert.equal(qtyLabel(1250, 'g'), '1,25 kg')
  assert.equal(qtyLabel(450, 'g'), '450 g')
  assert.equal(qtyLabel(1, 'envases'), '1 envase')
})
