export type ThemeChoice = 'auto' | 'light' | 'dark'
const KEY = 'tengohambre-theme'

export function getTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

export function applyTheme(t: ThemeChoice) {
  const root = document.documentElement
  if (t === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', t)
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* sin almacenamiento: el tema vuelve a automático al recargar */
  }
}
