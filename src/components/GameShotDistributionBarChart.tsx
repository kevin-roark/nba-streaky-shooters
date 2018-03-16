import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryBar, VictoryTooltip, VictoryStack } from 'victory'
import { ShotType } from 'nba-netdata/dist/types'
import { EnhancedShootingStats } from 'nba-netdata/dist/calc'
import { getShotTypeTitleAlt } from '../util/shooting'
import { baseChartContainerStyles, monospace } from '../layout'
import { theme, shotTypeColorMap } from '../theme'
import Legend from './Legend'
import Pane from './Pane'

const missedOpacity = 0.5
const madeOpacity = 0.9

const Container = styled('div')`
  ${baseChartContainerStyles};
  display: flex;
  justify-content: center;
`

const ChartContainer = styled('div')`
  &:not(:first-child) {
    margin-left: 20px;
  }
`

interface GameShotDistributionBarChartProps {
  stats: EnhancedShootingStats | null
}

interface GameShotTypeGroupChartProps {
  width?: number,
  height?: number,
  title: string,
  data: { type: ShotType, made: number, attempted: number }[]
}

const GameShotTypeGroupChart = (props: GameShotTypeGroupChartProps) => {
  const { title, data, width = 300, height = 375 } = props

  const barData: { x: string, y: number, label: string, fill: string, fillOpacity: number, stroke: any, strokeWidth: any }[][] = []
  data.forEach(({ made, attempted, type }) => {
    const missed = attempted - made
    const percent = made / attempted
    const name = getShotTypeTitleAlt(type)
    const fill = shotTypeColorMap[type]
    const stroke = '#000'
    const strokeWidth = (d, active) => active ? 2 : 0
    barData.push([{
      fill, stroke, strokeWidth,
      x: title,
      y: 1 - percent,
      fillOpacity: missedOpacity,
      label: `Missed ${missed} / ${attempted} ${name}`
    }])
    barData.push([{
      fill, stroke, strokeWidth,
      x: title,
      y: percent,
      fillOpacity: madeOpacity,
      label: `Made ${made} / ${attempted} ${name}`
    }])
  })

  const tooltipComponent = (
    <VictoryTooltip
      cornerRadius={0}
      flyoutStyle={{ fill: 'rgba(240, 240, 240, 0.9)' }}
      style={{ fontSize: 10, fontFamily: monospace, padding: 20 }}
      activateData={true}
    />
  )

  const containerComponent = <VictoryContainer responsive={true} />

  const chartProps = {
    width, height, containerComponent,
    padding: { left: 0, top: 0, bottom: 22, right: 0 },
    domainPadding: { x: 0, y: 0 }
  }

  return (
    <ChartContainer>
      <VictoryChart {...chartProps}>
        <VictoryAxis
          style={theme.independentAxis.style}
          tickValues={[title]}
        />

        <VictoryStack style={{ data: { width: width - 10 }}}>
          {barData.map((item, i) => (
            <VictoryBar key={i} data={item} labelComponent={tooltipComponent} />
          ))}
        </VictoryStack>
      </VictoryChart>
    </ChartContainer>
  )
}

const GameShotDistributionBarChart = observer((props: GameShotDistributionBarChartProps) => {
  const { stats } = props

  const twoPointData = {
    title: 'Two Pointer Distribution',
    data: !stats ? [] : [
      { type: ShotType.Rim, made: stats.rimMade, attempted: stats.rimAttempted },
      { type: ShotType.ShortMidRange, made: stats.shortMidRangeMade, attempted: stats.shortMidRangeAttempted },
      { type: ShotType.LongMidRange, made: stats.longMidRangeMade, attempted: stats.longMidRangeAttempted },
    ]
  }

  const fieldGoalData = {
    title: 'Field Goal Distribution',
    data: !stats ? [] : [
      { type: ShotType.GenericTwoPt, made: stats.twoPointersMade, attempted: stats.twoPointersAttempted },
      { type: ShotType.ThreePt, made: stats.threePointersMade, attempted: stats.threePointersAttempted },
    ]
  }

  const allShotsData = {
    title: 'Total Distribution',
    data: !stats ? [] : [
      { type: ShotType.FreeThrow, made: stats.freeThrowsMade, attempted: stats.freeThrowsAttempted },
      ...fieldGoalData.data,
    ]
  }

  const legendItems: { label: string, color: string, squareStyle: React.CSSProperties }[] = []
  const allData = [...twoPointData.data, ...fieldGoalData.data, ...allShotsData.data]
  allData.forEach(d => {
    const label = getShotTypeTitleAlt(d.type)
    if (!legendItems.find(i => i.label === label)) {
      legendItems.push({ label: label, color: shotTypeColorMap[d.type], squareStyle: { opacity: madeOpacity } })
    }
  })

  const legend = (
    <Legend
      items={legendItems}
      small={true}
      description="Darker / lighter colors are makes / misses of the same type."
    />
  )

  const charts = (
    <Container>
      <GameShotTypeGroupChart {...twoPointData} />
      <GameShotTypeGroupChart {...fieldGoalData} />
      <GameShotTypeGroupChart {...allShotsData} />
    </Container>
  )

  return (
    <Pane
      sideWidth={200}
      marginBottom={20}
      mainContent={charts}
      sideContent={legend}
    />
  )
})

export default observer(GameShotDistributionBarChart)
