import { useEffect, useMemo, useState } from 'react'
import { useSession } from '../lib/session-context'
import { applyTheme, getTheme, type ThemeChoice } from '../lib/theme'
import { SOURCES } from '../data/sources'
import { Icon } from '../components/Icon'
import { Card, PageTitle, Tabs, btnGhost, input } from '../components/ui'

type BedcaFood = { id: number; name: string; group?: string; kcal?: number; protein_g?: number; carbs_g?: number; fat_g?: number; fiber_g?: number }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const n1 = (v?: number) => (v == null ? '–' : v.toLocaleString('es-ES', { maximumFractionDigits: 1 }))

function Alimentos() {
  const [foods, setFoods] = useState<BedcaFood[] | null>(null)
  const [missing, setMissing] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/data/bedca.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { foods: BedcaFood[] }) => setFoods(d.foods))
      .catch(() => setMissing(true))
  }, [])

  const list = useMemo(() => {
    if (!foods) return []
    const k = norm(q.trim())
    return (k ? foods.filter((f) => norm(f.name).includes(k)) : foods).slice(0, 60)
  }, [foods, q])

  if (missing)
    return (
      <Card>
        <p className="text-muted">Aún no se han importado los alimentos de BEDCA. Se cargan con la acción «Importar BEDCA» del repositorio.</p>
      </Card>
    )

  return (
    <Card>
      <input className={`${input} mb-3`} placeholder="Buscar alimento…" value={q} onChange={(e) => setQ(e.target.value)} />
      <p className="mb-2 text-sm text-muted">Valores por 100 g de parte comestible · Fuente: BEDCA (AESAN)</p>
      <div className="overflow-x-auto">
        <table className="num w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-1 pr-2">Alimento</th>
              <th className="px-2">kcal</th>
              <th className="px-2">Prot.</th>
              <th className="px-2">HC</th>
              <th className="px-2">Grasa</th>
              <th className="px-2">Fibra</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="border-t border-line">
                <td className="py-1.5 pr-2">{f.name}</td>
                <td className="px-2">{n1(f.kcal)}</td>
                <td className="px-2">{n1(f.protein_g)}</td>
                <td className="px-2">{n1(f.carbs_g)}</td>
                <td className="px-2">{n1(f.fat_g)}</td>
                <td className="px-2">{n1(f.fiber_g)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Fuentes() {
  return (
    <Card>
      <h2 className="text-lg">Organismos y estudios de referencia</h2>
      <p className="mt-1 mb-3 text-sm text-muted">La app solo usa referencias de estos organismos oficiales y los estudios de los métodos de cálculo. Se abren en una pestaña nueva.</p>
      {SOURCES.map((g) => (
        <div key={g.org} className="mt-4">
          <div className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">{g.org}</div>
          {g.items.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border-t border-line py-2.5 hover:text-accent">
              <span className="flex flex-col">
                <b className="font-semibold">{s.title}</b>
                <span className="text-sm text-muted">
                  {new URL(s.url).hostname.replace('www.', '')} · {s.use}
                </span>
              </span>
              <Icon name="external" size={16} />
            </a>
          ))}
        </div>
      ))}
    </Card>
  )
}

function Ajustes() {
  const { household, session, signOut } = useSession()
  const [theme, setTheme] = useState<ThemeChoice>(getTheme())
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="mb-1 text-lg">Hogar: {household?.name}</h2>
        <p className="mb-3 text-muted">Para que tu pareja vea lo mismo, que entre con su Google y escriba este código:</p>
        <div className="flex items-center gap-3">
          <code className="rounded-lg bg-surface-2 px-3 py-2 font-mono text-lg tracking-widest">{household?.invite_code}</code>
          <button
            className={btnGhost}
            onClick={() => {
              void navigator.clipboard?.writeText(household?.invite_code ?? '')
              setCopied(true)
            }}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg">Apariencia</h2>
        <Tabs
          tabs={[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']]}
          value={theme}
          onChange={(t) => {
            setTheme(t)
            applyTheme(t)
          }}
        />
      </Card>
      <Card>
        <h2 className="mb-1 text-lg">Cuenta</h2>
        <p className="mb-3 text-muted">{session?.user.email}</p>
        <button className={btnGhost} onClick={signOut}>
          Cerrar sesión
        </button>
      </Card>
    </div>
  )
}

export function Mas() {
  const [tab, setTab] = useState<'alimentos' | 'fuentes' | 'ajustes'>('alimentos')
  return (
    <>
      <PageTitle>Más</PageTitle>
      <Tabs tabs={[['alimentos', 'Alimentos'], ['fuentes', 'Fuentes científicas'], ['ajustes', 'Ajustes']]} value={tab} onChange={setTab} />
      {tab === 'alimentos' && <Alimentos />}
      {tab === 'fuentes' && <Fuentes />}
      {tab === 'ajustes' && <Ajustes />}
    </>
  )
}
