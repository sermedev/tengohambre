/** Para buscar sin tildes ni mayúsculas. */
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
