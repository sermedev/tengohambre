import { fmt, type Nut } from '../lib/nutrition'

const ROWS: [keyof Nut, string, number][] = [
  ['kcal', 'Energía (kcal)', 0],
  ['protein_g', 'Proteína', 1],
  ['carbs_g', 'Hidratos de carbono', 1],
  ['sugars_g', '  de los cuales azúcares', 1],
  ['fat_g', 'Grasa', 1],
  ['sat_fat_g', '  de la cual saturada', 1],
  ['fiber_g', 'Fibra', 1],
  ['salt_g', 'Sal', 2],
]

export function NutTable({ n, caption }: { n: Nut; caption: string }) {
  return (
    <table className="num w-full text-sm">
      <caption className="mb-1 text-left text-xs font-semibold tracking-wider text-muted uppercase">{caption}</caption>
      <tbody>
        {ROWS.map(([k, label, d]) => (
          <tr key={k} className="border-t border-line">
            <td className={`py-1 ${label.startsWith('  ') ? 'pl-4 text-muted' : ''}`}>{label.trim()}</td>
            <td className="py-1 text-right font-semibold">
              {fmt(n[k], d)}
              {k === 'kcal' ? '' : ' g'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function MacroLine({ n, protein = true }: { n: Nut; protein?: boolean }) {
  return (
    <span className="num">
      {protein ? `Prot. ${fmt(n.protein_g)} g · ` : ''}HC {fmt(n.carbs_g)} g · Grasa {fmt(n.fat_g)} g · Fibra {fmt(n.fiber_g)} g
    </span>
  )
}
