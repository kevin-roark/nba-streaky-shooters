
export const pct = (n: number, showP = true) => {
  const p = n * 100
  if (p === 100) {
    return p
  }

  return p.toFixed(1) + (showP ? '%' : '')
}

export const pctWhole = (n: number) => `${Math.round(n * 100)}%`

export const zpad = (n: number, len = 2) => {
  let ns = n + ''
  while (ns.length < len) {
    ns = '0' + ns
  }
  return ns
}

export const formatSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  return `${zpad(m)}:${zpad(s)}`
}
