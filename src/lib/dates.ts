export function ageOn(birth: string, at = new Date()) {
  const b = new Date(birth + 'T12:00:00')
  let a = at.getFullYear() - b.getFullYear()
  if (at.getMonth() < b.getMonth() || (at.getMonth() === b.getMonth() && at.getDate() < b.getDate())) a--
  return a
}

/** Fecha local en formato AAAA-MM-DD (sin pasar por UTC, que cambia el día de madrugada). */
export function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const todayIso = () => iso(new Date())
export const parseIso = (s: string) => new Date(s + 'T12:00:00')
export function addDays(s: string, n: number) {
  const d = parseIso(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export function mondayOf(s: string) {
  const d = parseIso(s)
  return addDays(s, -((d.getDay() + 6) % 7))
}
export const DSHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
export const DLONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export function dayLabel(s: string) {
  const d = parseIso(s)
  return `${DLONG[(d.getDay() + 6) % 7]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}
