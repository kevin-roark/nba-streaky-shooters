
export const pct = (n: number, showP = true) => {
  const p = n * 100
  const s = (p !== 100 && p !== 0) ? p.toFixed(1) : p
  return s + (showP ? '%' : '')
}

export const pctWhole = (n: number) => `${Math.round(n * 100)}%`

export const zpad = (n: number, len = 2) => {
  let ns = n + ''
  while (ns.length < len) {
    ns = '0' + ns
  }
  return ns
}

export const pctZpad = (n: number, showP = true) => {
  let p = pct(n, showP)
  if (n < 0.1) {
    p = '0' + p
  }
  return p
}

export const formatSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  return `${zpad(m)}:${zpad(s)}`
}
