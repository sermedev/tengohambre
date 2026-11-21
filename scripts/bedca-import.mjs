#!/usr/bin/env node
// Descarga la composición de alimentos de BEDCA (Base de Datos Española de Composición de Alimentos, AESAN)
// y la guarda en public/data/bedca.json para que la app la use sin base de datos.
// Uso: node scripts/bedca-import.mjs [--limit 20]
// Se ejecuta desde la GitHub Action «Importar BEDCA» (botón Run workflow). Valores por 100 g de porción comestible.

import { writeFile, mkdir } from 'node:fs/promises'

const API = 'https://www.bedca.net/bdpub/procquery.php'
const OUT = new URL('../public/data/bedca.json', import.meta.url)
const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const LIST_QUERY = `<?xml version="1.0" encoding="utf-8"?><foodquery><type level="1"/><selection><atribute name="f_id"/><atribute name="f_ori_name"/><atribute name="f_eng_name"/><atribute name="f_origen"/><atribute name="edible_portion"/></selection><condition><cond1><atribute1 name="f_origen"/></cond1><relation type="EQUAL"/><cond3>BEDCA</cond3></condition><order ordtype="ASC"><atribute3 name="f_ori_name"/></order></foodquery>`

const detailQuery = (id) =>
  `<?xml version="1.0" encoding="utf-8"?><foodquery><type level="2"/><selection><atribute name="f_id"/><atribute name="f_ori_name"/><atribute name="f_eng_name"/><atribute name="edible_portion"/><atribute name="namelevel1"/><atribute name="c_id"/><atribute name="c_ori_name"/><atribute name="c_eng_name"/><atribute name="best_location"/><atribute name="v_unit"/></selection><condition><cond1><atribute1 name="f_id"/></cond1><relation type="EQUAL"/><cond3>${id}</cond3></condition></foodquery>`

// Componentes que guarda la app → patrón sobre el nombre inglés del componente en BEDCA
const COMPONENTS = {
  energy: /^energy, total/i,
  protein_g: /^protein, total/i,
  fat_g: /^fat, total/i,
  carbs_g: /^carbohydrate(s)?$|^carbohydrate, available/i,
  fiber_g: /^fibre, total dietary|^fiber, total dietary/i,
  sugars_g: /^sugars, total/i,
  sat_fat_g: /^fatty acids, total saturated/i,
  sodium_mg: /^sodium/i,
  calcium_mg: /^calcium/i,
  iron_mg: /^iron, total|^iron$/i,
  water_g: /^water/i,
}

async function post(xml, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/xml', 'User-Agent': 'tengohambre-importer' }, body: xml })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      if (i >= tries) throw e
      await sleep(1500 * i)
    }
  }
}

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return m ? decode(m[1].trim()) : ''
}
const blocks = (xml, name) => xml.match(new RegExp(`<${name}>[\\s\\S]*?</${name}>`, 'g')) ?? []
const decode = (s) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
const num = (s) => {
  if (s === '' || s == null) return null
  if (/^(tr|trazas?)$/i.test(s)) return 0
  const v = Number(String(s).replace(',', '.'))
  return Number.isFinite(v) ? v : null
}
const round = (v, d = 1) => (v == null ? undefined : Math.round(v * 10 ** d) / 10 ** d)

export function parseDetail(xml) {
  const food = blocks(xml, 'food')[0]
  if (!food) return null
  const out = {
    id: Number(tag(food, 'f_id')),
    name: tag(food, 'f_ori_name'),
    name_en: tag(food, 'f_eng_name') || undefined,
    group: tag(food, 'namelevel1') || undefined,
    edible: num(tag(food, 'edible_portion')) ?? undefined,
  }
  let kj = null
  for (const fv of blocks(food, 'foodvalue')) {
    const cname = tag(fv, 'c_eng_name')
    const unit = tag(fv, 'v_unit').toLowerCase()
    const val = num(tag(fv, 'best_location'))
    for (const [key, re] of Object.entries(COMPONENTS)) {
      if (!re.test(cname) || val == null) continue
      if (key === 'energy') {
        if (unit === 'kcal') out.kcal = round(val, 0)
        else if (unit === 'kj') kj = val
      } else if (out[key] === undefined) {
        out[key] = round(val, key.endsWith('_mg') ? 0 : 1)
      }
    }
  }
  if (out.kcal === undefined && kj != null) out.kcal = round(kj / 4.184, 0)
  return out
}

export function parseList(xml) {
  return blocks(xml, 'food').map((f) => ({ id: Number(tag(f, 'f_id')), name: tag(f, 'f_ori_name') })).filter((f) => f.id)
}

async function main() {
  console.log('Descargando la lista de alimentos de BEDCA…')
  const list = parseList(await post(LIST_QUERY)).slice(0, LIMIT)
  console.log(`${list.length} alimentos`)
  const foods = []
  for (const [i, f] of list.entries()) {
    try {
      const d = parseDetail(await post(detailQuery(f.id)))
      if (d) foods.push(d)
    } catch (e) {
      console.warn(`  ✗ ${f.id} ${f.name}: ${e.message}`)
    }
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${list.length}`)
    await sleep(250) // ser amables con el servidor de AESAN
  }
  if (foods.length < list.length * 0.9) throw new Error(`Solo se descargaron ${foods.length} de ${list.length}; no se guarda nada`)
  await mkdir(new URL('.', OUT), { recursive: true })
  await writeFile(
    OUT,
    JSON.stringify({ source: 'BEDCA · AESAN (www.bedca.net)', per: '100 g de porción comestible', imported: new Date().toISOString().slice(0, 10), foods }) + '\n',
  )
  console.log(`Guardados ${foods.length} alimentos en public/data/bedca.json`)
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => {
  console.error(e)
  process.exit(1)
})
