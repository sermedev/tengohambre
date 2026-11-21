import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/session-context'
import { Brand } from '../components/Brand'
import { Card, Tabs, btnPrimary, input } from '../components/ui'

type Row = { name: string; sex: 'hombre' | 'mujer' | 'nino' | 'nina'; birth_date: string; color: string; portion: number }

// Valores de partida (editables). Fechas aproximadas a partir de las edades; se pueden corregir después en Seguimiento.
const DEFAULT_FAMILY: Row[] = [
  { name: 'Papá', sex: 'hombre', birth_date: '1984-06-01', color: '--p1', portion: 1 },
  { name: 'Mamá', sex: 'mujer', birth_date: '1983-06-01', color: '--p2', portion: 0.8 },
  { name: 'Mayor', sex: 'nino', birth_date: '2018-06-01', color: '--p3', portion: 0.7 },
  { name: 'Peque', sex: 'nino', birth_date: '2020-06-01', color: '--p4', portion: 0.6 },
]

const isKid = (s: Row['sex']) => s === 'nino' || s === 'nina'

export function Hogar() {
  const { refreshHousehold } = useSession()
  const [mode, setMode] = useState<'crear' | 'unirse'>('crear')
  const [name, setName] = useState('Casa')
  const [family, setFamily] = useState<Row[]>(DEFAULT_FAMILY)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upd = (i: number, patch: Partial<Row>) => setFamily((f) => f.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  async function crear() {
    setBusy(true)
    setError(null)
    const { data: h, error } = await supabase.rpc('create_household', { p_name: name })
    if (error || !h) {
      setError(error?.message ?? 'No se pudo crear el hogar')
      setBusy(false)
      return
    }
    const rows = family
      .filter((r) => r.name.trim())
      .map((r, i) => ({
        household_id: h.id,
        name: r.name.trim(),
        sex: r.sex,
        birth_date: r.birth_date,
        color: r.color,
        is_kid: isKid(r.sex),
        default_portion: r.portion,
        goal: isKid(r.sex) ? 'crecer' : 'mantener',
        position: i,
      }))
    const { error: e2 } = await supabase.from('members').insert(rows)
    if (e2) setError(e2.message)
    await refreshHousehold()
    setBusy(false)
  }

  async function unirse() {
    setBusy(true)
    setError(null)
    const { error } = await supabase.rpc('join_household', { p_code: code })
    if (error) setError(error.message === 'Código no válido' ? 'Ese código no existe. Revísalo en Más → Ajustes del otro móvil.' : error.message)
    await refreshHousehold()
    setBusy(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4 py-8">
      <Brand />
      <Card>
        <h1 className="mb-3 text-xl">Vuestro hogar</h1>
        <Tabs tabs={[['crear', 'Crear hogar'], ['unirse', 'Tengo un código']]} value={mode} onChange={setMode} />
        {mode === 'crear' ? (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted">Nombre</span>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div>
              <p className="mb-2 text-sm font-semibold text-muted">Quién come en casa (se puede cambiar después)</p>
              <div className="flex flex-col gap-2">
                {family.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <input className={input} aria-label="Nombre" value={r.name} onChange={(e) => upd(i, { name: e.target.value })} />
                    <select className={input} aria-label="Sexo" value={r.sex} onChange={(e) => upd(i, { sex: e.target.value as Row['sex'] })}>
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="nino">Niño</option>
                      <option value="nina">Niña</option>
                    </select>
                    <input className={input} type="date" aria-label="Fecha de nacimiento" value={r.birth_date} onChange={(e) => upd(i, { birth_date: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
            <button className={btnPrimary} onClick={crear} disabled={busy}>
              {busy ? 'Creando…' : 'Crear hogar'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-muted">Pide el código a quien creó el hogar. Lo tiene en Más → Ajustes.</p>
            <input className={`${input} font-mono uppercase tracking-widest`} placeholder="ABCD1234" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className={btnPrimary} onClick={unirse} disabled={busy || code.trim().length < 6}>
              {busy ? 'Uniéndome…' : 'Unirme'}
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-bad">{error}</p>}
      </Card>
    </div>
  )
}
