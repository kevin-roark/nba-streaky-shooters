import * as React from 'react'
import { shotResultColorMap } from '../theme'
import Legend from './Legend'

const MadeMissedLegend = () => (
  <Legend
    items={[
      { label: 'Shot Made', color: shotResultColorMap.make },
      { label: 'Shot Missed', color: shotResultColorMap.miss }
    ]}
  />
)

export default MadeMissedLegend
