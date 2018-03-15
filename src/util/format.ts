
export const pct = (n: number, showP = true) => {
  const p = n * 100
  if (p === 100) {
    return p
  }

  return p.toFixed(1) + (showP ? '%' : '')
}

export const zpad = (n: number, len = 2) => {
  let ns = n + ''
  while (ns.length < len) {
    ns = '0' + ns
  }
  return ns
}
