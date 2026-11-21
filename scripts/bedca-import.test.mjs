import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDetail, parseList } from './bedca-import.mjs'

const fv = (name, unit, v) => `<foodvalue><c_id>1</c_id><c_eng_name>${name}</c_eng_name><best_location>${v}</best_location><v_unit>${unit}</v_unit></foodvalue>`

test('lista', () => {
  const xml = '<foodresponse><food><f_id>12</f_id><f_ori_name>Lentejas, secas</f_ori_name></food><food><f_id>34</f_id><f_ori_name>Arroz &amp; cosas</f_ori_name></food></foodresponse>'
  assert.deepEqual(parseList(xml), [{ id: 12, name: 'Lentejas, secas' }, { id: 34, name: 'Arroz & cosas' }])
})

test('detalle: macros, trazas y kJ→kcal', () => {
  const xml = `<foodresponse><food><f_id>12</f_id><f_ori_name>Lentejas, secas</f_ori_name><f_eng_name>Lentils, dry</f_eng_name><edible_portion>1</edible_portion><namelevel1>Legumbres</namelevel1>
    ${fv('energy, total', 'kJ', '1310')}${fv('protein, total', 'g', '23.8')}${fv('fat, total (total lipid)', 'g', '1.7')}${fv('carbohydrate', 'g', '48.8')}
    ${fv('fibre, total dietary', 'g', '11.2')}${fv('sugars, total', 'g', 'tr')}${fv('sodium', 'mg', '7')}${fv('iron, total', 'mg', '7.1')}${fv('vitamin C', 'mg', '')}</food></foodresponse>`
  const d = parseDetail(xml)
  assert.equal(d.name, 'Lentejas, secas')
  assert.equal(d.group, 'Legumbres')
  assert.equal(d.kcal, 313)
  assert.equal(d.protein_g, 23.8)
  assert.equal(d.sugars_g, 0)
  assert.equal(d.iron_mg, 7)
  assert.equal(d.fiber_g, 11.2)
})

test('detalle: prefiere kcal si viene', () => {
  const xml = `<foodresponse><food><f_id>1</f_id><f_ori_name>X</f_ori_name>${fv('energy, total', 'kJ', '418.4')}${fv('energy, total', 'kcal', '99')}</food></foodresponse>`
  assert.equal(parseDetail(xml).kcal, 99)
})
