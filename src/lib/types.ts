export type Household = { id: string; name: string; invite_code: string }

export type Member = {
  id: string
  household_id: string
  name: string
  color: string
  icon: string | null
  sex: 'hombre' | 'mujer' | 'nino' | 'nina'
  birth_date: string
  is_kid: boolean
  default_portion: number
  goal: string
  activity: string
  height_cm: number | null
  waist_cm: number | null
  sports: { sport: string; days: number; minutes: number }[]
  position: number
}
