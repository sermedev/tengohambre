import { createContext, useContext } from 'react'
import type { Ctx } from './session'

export const SessionCtx = createContext<Ctx | null>(null)

export function useSession() {
  const c = useContext(SessionCtx)
  if (!c) throw new Error('useSession fuera de SessionProvider')
  return c
}
