const parse = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb: number[]) => `#${rgb.map(n => Math.round(n).toString(16).padStart(2, '0')).join('')}`

/** Blend colour `a` toward `b` by `t` (0 to 1). Used to derive dark-theme brand colours. */
export function mix(a: string, b: string, t: number): string {
  const [x, y] = [parse(a), parse(b)]
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}
