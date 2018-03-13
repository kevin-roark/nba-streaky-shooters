
export const pct = (n: number, showP = true) => {
  const p = n * 100
  if (p === 100) {
    return p
  }

  return p.toFixed(1) + (showP ? '%' : '')
}
