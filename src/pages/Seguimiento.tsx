import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Member } from '../lib/types'
import { Card, PageTitle } from '../components/ui'
import { ageOn } from '../lib/dates'

export function Seguimiento() {
  const [members, setMembers] = useState<Member[] | null>(null)

  useEffect(() => {
    supabase
      .from('members')
      .select('*')
      .order('position')
      .then(({ data }) => setMembers((data as Member[]) ?? []))
  }, [])

  return (
    <>
      <PageTitle sub="Perfil, objetivo, actividad y evolución de cada persona. El cálculo completo llega en el paso 3.">Seguimiento</PageTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {members === null && <p className="text-muted">Cargando…</p>}
        {members?.map((m) => (
          <Card key={m.id} className="flex items-center gap-3">
            <span
              className="grid size-11 place-items-center rounded-full font-display text-lg font-bold text-white"
              style={{ background: `var(${m.color})` }}
              aria-hidden="true"
            >
              {m.icon || m.name[0]?.toUpperCase()}
            </span>
            <div>
              <h2 className="text-lg">{m.name}</h2>
              <p className="text-sm text-muted">
                {ageOn(m.birth_date)} años · ración {Number(m.default_portion).toLocaleString('es-ES')}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
