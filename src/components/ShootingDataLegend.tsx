import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { ShootingStat } from 'nba-netdata/dist/calc'
import { ShootingFilterData } from '../models/shootingFilterData'
import { DescriptionExplanation, secondaryContainerStyles } from '../layout'
import { shootingColorMap } from '../theme'
import { getStatAbbr } from '../util/shooting'

const Container = styled('div')`
  ${secondaryContainerStyles};
  width: 200px;
`

const Legend = styled('ul')``

const LegendItem = styled('li')`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  opacity: 0.2;
  transition: opacity 0.2s;

  &.enabled {
    opacity: 1;
  }
`

const LegendSquare = styled('span')`
  width: 15px;
  height: 15px;
  margin-right: 8px;
`

const LegendText = styled('span')`
  font-weight: 500;
  font-size: 16px;
  color: #333;
`

const defaultVisibleKeys: ShootingStat[] = [
  'trueShootingPercentage',
  'effectiveFieldGoalPercentage',
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
      const enabled = filterData.getStatEnabled(key)
      const onClick = () => filterData.toggleStatEnabled(key)
      return { key, color, label, enabled, onClick }
    })

  return (
    <Container>
      <Legend>
        {legendItems.map(({ key, label, enabled, color, onClick }) => (
          <LegendItem key={key} onClick={onClick} className={cx({ enabled })}>
            <LegendSquare style={{backgroundColor: color}} />
            <LegendText>{label}</LegendText>
          </LegendItem>
        ))}
      </Legend>
      <DescriptionExplanation>Click any legend item to toggle its visibility.</DescriptionExplanation>
    </Container>
  )
}

export default observer(ShootingDataLegend)
