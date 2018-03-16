import { scale } from 'chroma-js'

const heatScale = scale(['#aaf', '#eee', '#faa'])

export function getHeatColor(heat: number) {
  return heatScale(heat)
}
