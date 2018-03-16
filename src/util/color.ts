import { scale } from 'chroma-js'

const heatScale = scale(['#faa', '#eee', '#aaf'])

export function getHeatColor(heat: number) {
  return heatScale(heat)
}
