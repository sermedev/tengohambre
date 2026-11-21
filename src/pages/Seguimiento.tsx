import { useMemo, useState } from 'react'
import { db } from '../lib/db'
import { useData, usePlan } from '../lib/data-context'
import { DSHORT, addDays, ageOn, mondayOf, todayIso } from '../lib/dates'
import { fmt } from '../lib/nutrition'
import { personDay } from '../lib/plan'
import { ACTS_ADULT, ACTS_KID, GOALS_ADULT, GOAL_KID, SPORTS, bmiCategory, isKid, latestWeight, targetOf, whoActivity } from '../lib/targets'
import type { Member, WeightEntry } from '../lib/types'
import { Avatar } from '../components/Avatar'
import { Bar, Card, Field, Modal, PageTitle, btnGhost, btnPrimary, btnSm, input } from '../components/ui'

const COLORS = ['--p1', '--p2', '--p3', '--p4', '--p5', '--p6', '--p7', '--p8']
const ICONS = ['', '👨', '👩', '👦', '🧒', '👧', '🧔', '👱', '🦸', '⚽', '🎾', '🏋️']

export function Seguimiento() {
  const { members, weights, ready } = useData()
  const [sel, setSel] = useState<string | null>(null)
  const m = members.find((x) => x.id === sel) ?? members[0]

  if (!ready) return <p className="text-muted">Cargando…</p>
  if (!m) return <p className="text-muted">No hay personas en el hogar.</p>

  return (
    <>
      <PageTitle sub="Perfil, objetivo, actividad y evolución de cada persona.">Seguimiento</PageTitle>
      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {members.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === m.id}
            onClick={() => setSel(x.id)}
            className={`inline-flex items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 font-semibold ${x.id === m.id ? 'border-accent bg-accent-soft' : 'border-line bg-surface text-muted'}`}
          >
            <Avatar m={x} />
            {x.name}
          </button>
        ))}
      </div>
      <Person key={m.id} m={m} weights={weights} />
    </>
  )
}

function Person({ m, weights }: { m: Member; weights: WeightEntry[] }) {
  const [editing, setEditing] = useState(false)
  const kid = isKid(m)
  const tg = targetOf(m, weights)
  const kg = latestWeight(m.id, weights)
  const age = ageOn(m.birth_date)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="mb-3 flex items-center gap-3">
          <Avatar m={m} size={44} />
          <div className="flex-1">
            <h2 className="text-xl">{m.name}</h2>
            <p className="text-sm text-muted">
              {age} años{kg ? ` · ${fmt(kg, 1)} kg` : ''}
              {m.height_cm ? ` · ${fmt(Number(m.height_cm))} cm` : ''} · ración habitual {fmt(Number(m.default_portion), 2)}
            </p>
          </div>
          <button className={btnGhost} onClick={() => setEditing(true)}>
            Editar
          </button>
        </div>
        {tg ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Objetivo diario" value={`${fmt(tg.kcal)} kcal`} />
            <Stat label="Proteína" value={`${tg.prot} g`} />
            {tg.tdee != null && <Stat label="Gasto estimado" value={`${fmt(tg.tdee)} kcal`} />}
            <Stat label="Deporte (media/día)" value={`${fmt(tg.sport)} kcal`} />
          </div>
        ) : (
          <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">Para calcular su objetivo hace falta su peso{kid ? '' : ' y su altura'}. Añade el peso abajo y la altura en «Editar».</p>
        )}
        <p className="mt-3 text-sm">
          <b>{kid ? GOAL_KID.n : (GOALS_ADULT.find((g) => g.k === m.goal) ?? GOALS_ADULT[0]).n}.</b> <span className="text-muted">{kid ? GOAL_KID.d : (GOALS_ADULT.find((g) => g.k === m.goal) ?? GOALS_ADULT[0]).d}</span>
        </p>
        <p className="mt-2 text-xs text-muted">
          {kid
            ? 'Niños: referencia de energía de EFSA para su edad, ajustada a su actividad, más el gasto de su deporte (Compendio de Actividades Físicas).'
            : 'Adultos: gasto en reposo con la ecuación de Mifflin-St Jeor × nivel de actividad (EFSA) + deporte (Compendio de Actividades Físicas). Es una estimación orientativa.'}
        </p>
      </Card>

      <Evaluation m={m} kg={kg} />
      <WeekIntake m={m} />
      <WeightLog m={m} weights={weights} />
      {editing && <EditMember m={m} onClose={() => setEditing(false)} />}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2.5">
      <div className="text-xs text-muted">{label}</div>
      <div className="num font-bold">{value}</div>
    </div>
  )
}

function Evaluation({ m, kg }: { m: Member; kg?: number }) {
  const kid = isKid(m)
  const h = m.height_cm ? Number(m.height_cm) / 100 : null
  const bmi = kg && h ? kg / (h * h) : null
  const whtr = m.waist_cm && m.height_cm ? Number(m.waist_cm) / Number(m.height_cm) : null
  const act = whoActivity(m)
  const waistLimits = m.sex === 'mujer' ? [80, 88] : [94, 102]
  const rows: { k: string; v: string; s: string; tone: 'ok' | 'warn' | 'bad' | 'muted' }[] = []
  if (bmi) {
    if (kid) rows.push({ k: 'IMC', v: fmt(bmi, 1), s: 'En niños se interpreta con las tablas de percentiles de la OMS por edad y sexo; lo valora el pediatra.', tone: 'muted' })
    else {
      const c = bmiCategory(bmi)
      rows.push({ k: 'IMC', v: fmt(bmi, 1), s: `${c.n} (OMS). Peso saludable para tu altura: ${fmt(18.5 * h! * h!, 0)}–${fmt(24.9 * h! * h!, 0)} kg. En personas con mucho músculo el IMC sobrestima la grasa.`, tone: c.tone })
    }
  }
  if (m.waist_cm && !kid) {
    const w = Number(m.waist_cm)
    rows.push({ k: 'Cintura', v: `${fmt(w)} cm`, s: w >= waistLimits[1] ? 'Riesgo alto (OMS)' : w >= waistLimits[0] ? 'Riesgo aumentado (OMS)' : `Bien: por debajo de ${waistLimits[0]} cm (OMS)`, tone: w >= waistLimits[1] ? 'bad' : w >= waistLimits[0] ? 'warn' : 'ok' })
  }
  if (whtr) rows.push({ k: 'Cintura / altura', v: fmt(whtr, 2), s: whtr < 0.5 ? 'Bien: por debajo de 0,5' : 'Por encima de 0,5: conviene vigilarlo', tone: whtr < 0.5 ? 'ok' : 'warn' })
  if (kid) {
    const perDay = act.modMinutes / 7
    rows.push({ k: 'Actividad', v: `${fmt(perDay)} min/día`, s: perDay >= 60 ? 'Cumple la OMS: 60 min al día de media (sin contar el recreo y el juego).' : 'La OMS recomienda 60 min al día de media; el recreo y el juego también suman.', tone: perDay >= 60 ? 'ok' : 'warn' })
  } else {
    const ok = act.modMinutes >= 150 && act.strengthDays >= 2
    rows.push({ k: 'Actividad', v: `${fmt(act.modMinutes)} min/sem`, s: `OMS: 150–300 min de actividad moderada (la vigorosa cuenta doble) y fuerza 2 días o más. Fuerza: ${act.strengthDays} días.`, tone: ok ? 'ok' : 'warn' })
  }
  return (
    <Card>
      <h2 className="mb-2 text-lg">Evaluación</h2>
      {rows.length ? (
        <div className="flex flex-col">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[7.5rem_5.5rem_1fr] gap-2 border-t border-line py-2 text-sm first:border-t-0">
              <b>{r.k}</b>
              <span className={`num font-bold ${r.tone === 'muted' ? '' : `text-${r.tone}`}`}>{r.v}</span>
              <span className="text-muted">{r.s}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Añade peso, altura y cintura para ver la evaluación.</p>
      )}
    </Card>
  )
}

function WeekIntake({ m }: { m: Member }) {
  const { L, weights } = useData()
  const monday = mondayOf(todayIso())
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday])
  const { items } = usePlan(monday, days[6])
  const tg = targetOf(m, weights)
  return (
    <Card>
      <h2 className="mb-1 text-lg">Esta semana según el menú</h2>
      <p className="mb-3 text-sm text-muted">Calorías planificadas cada día frente a su objetivo.</p>
      <div className="flex flex-col gap-2">
        {days.map((d, i) => {
          const n = personDay(
            items.filter((x) => x.day === d),
            m,
            L,
          )
          return (
            <div key={d} className="grid grid-cols-[2.5rem_1fr_6.5rem] items-center gap-2 text-sm">
              <b className={d === todayIso() ? 'text-accent' : ''}>{DSHORT[i]}</b>
              <Bar value={n.kcal} target={tg?.kcal ?? 0} color={`var(${m.color})`} />
              <span className="num text-right">
                {fmt(n.kcal)} <span className="text-muted">kcal</span>
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function WeightLog({ m, weights }: { m: Member; weights: WeightEntry[] }) {
  const { reload } = useData()
  const [day, setDay] = useState(todayIso())
  const [w, setW] = useState<number | ''>('')
  const [waist, setWaist] = useState<number | ''>('')
  const [err, setErr] = useState<string | null>(null)
  const log = weights.filter((x) => x.member_id === m.id).sort((a, b) => b.day.localeCompare(a.day))

  async function add() {
    if (w === '') return
    setErr(null)
    try {
      const same = log.find((x) => x.day === day)
      const row = { weight_kg: w, waist_cm: waist === '' ? null : waist }
      if (same) await db.update('weight_log', same.id, row)
      else await db.insert<WeightEntry>('weight_log', [{ member_id: m.id, day, ...row }])
      if (waist !== '') await db.update('members', m.id, { waist_cm: waist })
      setW('')
      setWaist('')
      await Promise.all([reload('weight_log'), reload('members')])
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <Card>
      <h2 className="mb-3 text-lg">Registro de peso</h2>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
        <Field label="Fecha">
          <input className={input} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        </Field>
        <Field label="Peso (kg)">
          <input className={input} type="number" step="0.1" min={0} value={w} onChange={(e) => setW(e.target.value === '' ? '' : Number(e.target.value))} />
        </Field>
        <Field label="Cintura (cm)">
          <input className={input} type="number" step="0.5" min={0} value={waist} onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))} />
        </Field>
        <button className={btnPrimary} onClick={add} disabled={w === ''}>
          Guardar
        </button>
      </div>
      {err && <p className="mt-2 text-bad">{err}</p>}
      <ul className="mt-3 text-sm">
        {log.slice(0, 12).map((x, i) => {
          const prev = log[i + 1]?.weight_kg
          const diff = prev != null && x.weight_kg != null ? Number(x.weight_kg) - Number(prev) : null
          return (
            <li key={x.id} className="flex items-center gap-3 border-t border-line py-1.5">
              <span className="w-24 text-muted">{new Date(x.day + 'T12:00').toLocaleDateString('es-ES')}</span>
              <b className="num">{x.weight_kg != null ? `${fmt(Number(x.weight_kg), 1)} kg` : '—'}</b>
              {diff != null && diff !== 0 && <span className={`num text-xs ${diff < 0 ? 'text-ok' : 'text-warn'}`}>{diff > 0 ? '+' : ''}{fmt(diff, 1)}</span>}
              {x.waist_cm != null && <span className="text-muted">cintura {fmt(Number(x.waist_cm))} cm</span>}
              <span className="flex-1" />
              <button
                className={`${btnSm} text-muted`}
                aria-label="Borrar registro"
                onClick={async () => {
                  await db.remove('weight_log', [x.id])
                  await reload('weight_log')
                }}
              >
                ✕
              </button>
            </li>
          )
        })}
        {!log.length && <li className="text-muted">Sin registros todavía.</li>}
      </ul>
    </Card>
  )
}

function EditMember({ m, onClose }: { m: Member; onClose: () => void }) {
  const { reload } = useData()
  const [d, setD] = useState<Member>({ ...m, sports: [...(m.sports ?? [])] })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const kid = isKid(d)
  const set = (p: Partial<Member>) => setD({ ...d, ...p })

  async function save() {
    if (!d.name.trim()) return setErr('Falta el nombre.')
    setBusy(true)
    try {
      await db.update('members', m.id, {
        name: d.name.trim(),
        color: d.color,
        icon: d.icon || null,
        sex: d.sex,
        birth_date: d.birth_date,
        is_kid: isKid(d),
        default_portion: d.default_portion,
        goal: isKid(d) ? 'crecer' : d.goal === 'crecer' ? 'mantener' : d.goal,
        activity: d.activity,
        height_cm: d.height_cm || null,
        waist_cm: d.waist_cm || null,
        sports: d.sports.filter((s) => s.days > 0 && s.minutes > 0),
      })
      await reload('members')
      onClose()
    } catch (e) {
      setErr((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Modal title={`Editar a ${m.name}`} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Nombre">
            <input className={input} value={d.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Sexo">
            <select className={input} value={d.sex} onChange={(e) => set({ sex: e.target.value as Member['sex'] })}>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="nino">Niño</option>
              <option value="nina">Niña</option>
            </select>
          </Field>
          <Field label="Fecha de nacimiento">
            <input className={input} type="date" value={d.birth_date} onChange={(e) => set({ birth_date: e.target.value })} />
          </Field>
          <Field label="Altura (cm)">
            <input className={input} type="number" min={50} max={230} value={d.height_cm ?? ''} onChange={(e) => set({ height_cm: e.target.value === '' ? null : Number(e.target.value) })} />
          </Field>
          <Field label="Cintura (cm)">
            <input className={input} type="number" min={30} max={200} value={d.waist_cm ?? ''} onChange={(e) => set({ waist_cm: e.target.value === '' ? null : Number(e.target.value) })} />
          </Field>
          <Field label="Ración habitual" hint="1 = ración de adulto">
            <select className={input} value={String(d.default_portion)} onChange={(e) => set({ default_portion: Number(e.target.value) })}>
              {[0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5].map((x) => (
                <option key={x} value={String(x)}>
                  {fmt(x, 2)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Color" group>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={d.color === c} onClick={() => set({ color: c })} className={`size-8 rounded-full ${d.color === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`} style={{ background: `var(${c})` }} />
            ))}
          </div>
        </Field>
        <Field label="Icono" group>
          <div className="flex flex-wrap gap-1">
            {ICONS.map((ic) => (
              <button key={ic || 'ini'} type="button" aria-pressed={(d.icon ?? '') === ic} onClick={() => set({ icon: ic || null })} className={`grid size-9 place-items-center rounded-lg text-lg ${(d.icon ?? '') === ic ? 'bg-accent-soft ring-2 ring-accent' : 'hover:bg-surface-2'}`}>
                {ic || d.name[0]?.toUpperCase()}
              </button>
            ))}
          </div>
        </Field>

        {!kid && (
          <Field label="Objetivo" group>
            <div className="grid gap-2 sm:grid-cols-2">
              {GOALS_ADULT.map((g) => (
                <button key={g.k} type="button" aria-pressed={d.goal === g.k} onClick={() => set({ goal: g.k })} className={`rounded-xl border p-2.5 text-left text-sm ${d.goal === g.k ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                  <b className="block">{g.n}</b>
                  <span className="text-muted">{g.d}</span>
                </button>
              ))}
            </div>
          </Field>
        )}
        {kid && <p className="rounded-xl bg-surface-2 p-3 text-sm">{GOAL_KID.d}</p>}

        <Field label="Día a día (sin contar el deporte)" group>
          <div className="grid gap-2 sm:grid-cols-3">
            {(kid ? ACTS_KID : ACTS_ADULT).map((a) => (
              <button key={a.k} type="button" aria-pressed={d.activity === a.k} onClick={() => set({ activity: a.k })} className={`rounded-xl border p-2.5 text-left text-sm ${d.activity === a.k ? 'border-accent bg-accent-soft' : 'border-line'}`}>
                <b className="block">{a.n}</b>
                <span className="text-muted">{a.d}</span>
              </button>
            ))}
          </div>
        </Field>

        <div>
          <span className="text-sm font-semibold text-muted">Deportes</span>
          <div className="mt-1 flex flex-col gap-2">
            {d.sports.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_5rem_5.5rem_auto] items-center gap-2">
                <select className={input} aria-label="Deporte" value={s.sport} onChange={(e) => set({ sports: d.sports.map((x, j) => (j === i ? { ...x, sport: e.target.value } : x)) })}>
                  {SPORTS.map((sp) => (
                    <option key={sp.k} value={sp.k}>
                      {sp.n}
                    </option>
                  ))}
                </select>
                <input className={input} type="number" min={0} max={7} aria-label="Días por semana" value={s.days} onChange={(e) => set({ sports: d.sports.map((x, j) => (j === i ? { ...x, days: Number(e.target.value) } : x)) })} />
                <input className={input} type="number" min={0} step={5} aria-label="Minutos por sesión" value={s.minutes} onChange={(e) => set({ sports: d.sports.map((x, j) => (j === i ? { ...x, minutes: Number(e.target.value) } : x)) })} />
                <button type="button" className={`${btnSm} text-muted`} aria-label="Quitar deporte" onClick={() => set({ sports: d.sports.filter((_, j) => j !== i) })}>
                  ✕
                </button>
              </div>
            ))}
            {d.sports.length > 0 && <p className="text-xs text-muted">Deporte · días por semana · minutos por sesión</p>}
            <button type="button" className={`${btnGhost} self-start`} onClick={() => set({ sports: [...d.sports, { sport: kid ? 'futbol' : 'crossfit', days: 2, minutes: 60 }] })}>
              + Añadir deporte
            </button>
          </div>
        </div>

        {err && <p className="text-bad">{err}</p>}
        <div className="flex gap-2">
          <button className={btnPrimary} onClick={save} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
          <button className={btnGhost} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  )
}
