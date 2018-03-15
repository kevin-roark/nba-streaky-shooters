import * as React from 'react'
import { observer } from 'mobx-react'
import { ShootingStat } from 'nba-netdata/dist/calc'
import { ShootingFilterData } from '../models/shootingFilterData'
import { shootingColorMap } from '../theme'
import { getStatAbbr } from '../util/shooting'
import Legend from './Legend'

const defaultVisibleKeys: ShootingStat[] = [
  'effectiveFieldGoalPercentage',
  'trueShootingPercentage',
  'fieldGoalPercentage',
  'twoPointPercentage',
  'threePointPercentage',
  'freeThrowPercentage'
]

interface ShootingDataLegendProps {
  filterData: ShootingFilterData,
  visibleKeys?: ShootingStat[]
}

const ShootingDataLegend = ({ filterData, visibleKeys = defaultVisibleKeys }: ShootingDataLegendProps) => {
  const legendItems = visibleKeys
    .map(key => {
      const color = shootingColorMap[key]
      const label = getStatAbbr(key) + '%'
      const disabled = !filterData.getStatEnabled(key)
      const onClick = () => filterData.toggleStatEnabled(key)
      return { color, label, disabled, onClick }
    })

  const description = 'Toggle visible stats.'

  return <Legend items={legendItems} description={description} />
}

export default observer(ShootingDataLegend)
