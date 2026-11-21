export function ageOn(birth: string, at = new Date()) {
  const b = new Date(birth + 'T12:00:00')
  let a = at.getFullYear() - b.getFullYear()
  if (at.getMonth() < b.getMonth() || (at.getMonth() === b.getMonth() && at.getDate() < b.getDate())) a--
  return a
}
