import { useState } from 'react'
import { PageTitle, Soon, Tabs } from '../components/ui'

export function Compra() {
  const [tab, setTab] = useState<'lista' | 'catalogo'>('lista')
  return (
    <>
      <PageTitle>Compra</PageTitle>
      <Tabs tabs={[['lista', 'Lista'], ['catalogo', 'Catálogo']]} value={tab} onChange={setTab} />
      <Soon what="La lista de la compra compartida" step={4} />
    </>
  )
}
