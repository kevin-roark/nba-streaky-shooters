import * as React from 'react'
import { observer } from 'mobx-react'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryBar, VictoryTooltip } from 'victory'
import { ShotType } from 'nba-netdata/dist/types'
import { EnhancedShootingStats } from 'nba-netdata/dist/calc'
import { getShotTypeTitle } from '../util/shooting'
import { pctWhole } from '../util/format'
import { GameDataProps } from '../models/gameData'
import { BaseChartContainer, monospace } from '../layout'
import { theme, shotResultColorMap } from '../theme'

interface GameShotPercentBarChartProps extends GameDataProps {
  width?: number,
  height?: number
}

const GameShotPercentBarChart = observer((props: GameShotPercentBarChartProps) => {
  const { width = 960, height = 320 } = props
  const stats = props.data.currentStats
  const yPad = 0.01

  const rawData = !stats ? [] : [
    { x: ShotType.FreeThrow, made: stats.freeThrowsMade, attempted: stats.freeThrowsAttempted },
    { x: ShotType.Rim, made: stats.rimMade, attempted: stats.rimAttempted },
    { x: ShotType.ShortMidRange, made: stats.shortMidRangeMade, attempted: stats.shortMidRangeAttempted },
    { x: ShotType.LongMidRange, made: stats.longMidRangeMade, attempted: stats.longMidRangeAttempted },
    { x: ShotType.GenericTwoPt, made: stats.twoPointersMade, attempted: stats.twoPointersAttempted },
    { x: ShotType.ThreePt, made: stats.threePointersMade, attempted: stats.threePointersAttempted },
    { x: 'fieldGoal', made: stats.fieldGoalsMade, attempted: stats.fieldGoalsAttempted }
  ]

  const data = rawData
    .filter(d => d.attempted > 0)
    .map(({ x, made, attempted }) => {
      const missed = (attempted - made)
      const missedY = yPad + (missed / attempted)
      const madelabel = `Made ${made} / ${attempted}`
      const missedlabel = `Missed ${missed} / ${attempted}`
      const strokeWidth = (d, active) => active ? 2 : 0
      const stroke = '#000'
      return [
        { x, label: missedlabel, y0: yPad, y: missedY, fill: shotResultColorMap.miss, strokeWidth, stroke },
        { x, label: madelabel, y0: missedY, y: 1 + yPad, fill: shotResultColorMap.make, strokeWidth, stroke },
      ]
    })
    .reduce((all, d) => all.concat(d), [])

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
    padding: { left: 100, top: 10, bottom: 30, right: 10 },
    domainPadding: { x: 30, y: 30 }
  }

  const content = (
    <VictoryChart {...chartProps}>
      <VictoryAxis
        style={theme.independentAxis.style}
        tickFormat={getShotTypeTitle}
      />
      <VictoryAxis
        dependentAxis={true}
        style={theme.dependentAxis.style}
        tickValues={[0.25, 0.5, 0.75, 1].map(v => v + yPad)}
        tickFormat={v => pctWhole(v - yPad)}
      />

      <VictoryBar
        data={data}
        style={theme.bar}
        labelComponent={tooltipComponent}
      />
    </VictoryChart>
  )

  return <BaseChartContainer>{content}</BaseChartContainer>
})

export default observer(GameShotPercentBarChart)
