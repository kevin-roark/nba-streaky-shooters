import * as React from 'react'
import { allShotTypes, getShotTypeTitleAlt } from '../util/shooting'
import { shotTypeColorMap } from '../theme'
import Legend from './Legend'

export const ShotTypeLegend = (props: { description: string, fieldGoal?: boolean }) => {
  const items = (props.fieldGoal ? ['fieldGoal'] : []).concat(allShotTypes).map(t => ({
    label: getShotTypeTitleAlt(t as any),
    color: shotTypeColorMap[t]
  }))

  return (
    <Legend
      items={items}
      small={true}
      description={props.description}
    />
  )
}

export default ShotTypeLegend
