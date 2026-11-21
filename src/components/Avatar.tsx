import type { Member } from '../lib/types'

export function Avatar({ m, size = 28, off = false }: { m: Pick<Member, 'name' | 'color' | 'icon'>; size?: number; off?: boolean }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full font-display font-bold text-white"
      style={{ background: off ? 'var(--line)' : `var(${m.color})`, width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {m.icon || m.name[0]?.toUpperCase()}
    </span>
  )
}
