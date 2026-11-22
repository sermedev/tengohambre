// Búsqueda tolerante de alimentos: cómo habla la gente frente a cómo nombra BEDCA.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { searchByName, matchesName, stem } from '../src/lib/search.ts'

const foods = JSON.parse(fs.readFileSync(new URL('../public/data/bedca.json', import.meta.url))).foods
const top = (q, n = 3) => searchByName(foods, q, (f) => f.name, n)
const names = (q, n) => top(q, n).items.map((f) => f.name)

test('plural y singular', () => {
  assert.equal(stem('espinacas'), 'espinaca')
  assert.equal(stem('melones'), 'melon')
  assert.equal(stem('nueces'), 'nuez')
  assert.match(names('espinacas')[0], /^Espinaca/)
  assert.match(names('champiñones')[0], /^Champi/)
})

test('palabras en cualquier orden y sin relleno', () => {
  assert.match(names('pechuga de pollo')[0], /^Pollo, pechuga/)
  assert.match(names('pan de molde')[0], /de molde/)
  assert.match(names('nata para cocinar')[0], /^Nata, líquida, para cocinar/)
  assert.equal(names('leche entera')[0], 'Leche de vaca, entera')
})

test('sinónimos coloquiales', () => {
  assert.match(names('mahonesa')[0], /^Mayonesa/)
  assert.match(names('brócoli')[0], /^Brécol/)
  assert.match(names('jamón york')[0], /^Jamón cocido/)
  assert.match(names('macarrones')[0], /^Pasta alimenticia/)
  assert.match(names('huevo cocido')[0], /^Huevo de gallina, hervido/)
  assert.match(names('garbanzos cocidos')[0], /^Garbanzo, hervido/)
  assert.equal(names('maicena')[0], 'Almidón de maíz')
})

test('una errata', () => {
  assert.match(names('merlza')[0], /^Merluza/)
  // sin errata no se cuela «pimienta» al buscar «pimientos»
  assert.ok(names('pimientos', 10).every((n) => n.startsWith('Pimiento')))
})

test('si no está tal cual, enseña lo parecido y lo marca', () => {
  const r = top('pimiento verde', 10)
  assert.equal(r.partial, true)
  assert.ok(r.items.length > 0 && r.items.every((f) => f.name.startsWith('Pimiento')))
  assert.equal(top('mayonesa').partial, false)
})

test('matchesName para filtros', () => {
  assert.equal(matchesName('', 'Lo que sea'), true)
  assert.equal(matchesName('lentejas verduras', 'Lentejas con verduras'), true)
  assert.equal(matchesName('pollo', 'Lentejas con verduras'), false)
})
