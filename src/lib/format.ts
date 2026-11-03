const full = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/** Abbreviated on the dashboard ($40.5M, $9.14M, $850K); full on deal detail. */
export function money(n: number, opts: { full?: boolean } = {}): string {
  if (opts.full) return full.format(n)
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a >= 10_000_000) return `${sign}$${trim(Math.round(a / 1e5) / 10)}M`
  if (a >= 1_000_000) return `${sign}$${trim(Math.round(a / 1e4) / 100)}M`
  if (a >= 1_000) return `${sign}$${Math.round(a / 1e3)}K`
  return `${sign}$${Math.round(a)}`
}

const trim = (n: number) => String(n) // 8.2 -> "8.2", 9.14 -> "9.14", 40.5 -> "40.5"

export function percent(ratio: number, digits = 0): string {
  return `${(ratio * 100).toFixed(digits)}%`
}

export function dateShort(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function monthShort(ym: string): string {
  return new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
