// Comprueba que cada ingrediente de las recetas Sugeridas apunta a un alimento que existe en BEDCA
// y que el nombre del comentario coincide con el de BEDCA (para no enlazar un alimento equivocado).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/sugeridas.ts', import.meta.url), 'utf8')
const bedca = JSON.parse(readFileSync(new URL('../public/data/bedca.json', import.meta.url), 'utf8'))
const byId = new Map(bedca.foods.map((f) => [f.id, f]))
const consts = [...src.matchAll(/^const ([A-Z_]+) = (\d+) \/\/ (.+)$/gm)]

test('hay alimentos BEDCA declarados', () => assert.ok(consts.length > 20))

for (const [, name, id, comment] of consts) {
  test(`${name} (${id}) existe en BEDCA y es «${comment.trim()}»`, () => {
    const f = byId.get(Number(id))
    assert.ok(f, `No existe el id ${id}`)
    assert.equal(f.name, comment.trim())
    assert.ok(typeof f.kcal === 'number' && f.kcal >= 0, 'sin kcal')
  })
}
