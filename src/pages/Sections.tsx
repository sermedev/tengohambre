import { useState } from 'react'
import { PageTitle, Soon, Tabs } from '../components/ui'

export function Menu() {
  const [tab, setTab] = useState<'hoy' | 'semana'>('hoy')
  return (
    <>
      <PageTitle>Menú</PageTitle>
      <Tabs tabs={[['hoy', 'Hoy'], ['semana', 'Semana']]} value={tab} onChange={setTab} />
      <Soon what={tab === 'hoy' ? 'El menú de hoy' : 'La semana con recetas arrastrables'} step={3} />
    </>
  )
}

export function Recetas() {
  const [tab, setTab] = useState<'mias' | 'sugeridas' | 'precocinados'>('mias')
  return (
    <>
      <PageTitle>Recetas</PageTitle>
      <Tabs tabs={[['mias', 'Mis recetas'], ['sugeridas', 'Sugeridas'], ['precocinados', 'Precocinados']]} value={tab} onChange={setTab} />
      <Soon what="El recetario" step={3} />
    </>
  )
}

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

export function Almacen() {
  const [tab, setTab] = useState<'despensa' | 'frio'>('despensa')
  return (
    <>
      <PageTitle>Almacén</PageTitle>
      <Tabs tabs={[['despensa', 'Despensa'], ['frio', 'Nevera y congelador']]} value={tab} onChange={setTab} />
      <Soon what="El inventario de casa" step={4} />
    </>
  )
}
