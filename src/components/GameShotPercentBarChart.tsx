import * as React from 'react'
import { observer } from 'mobx-react'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryBar, VictoryTooltip } from 'victory'
import { ShotType } from 'nba-netdata/dist/types'
import { EnhancedShootingStats } from 'nba-netdata/dist/calc'
import { getShotTypeTitle } from '../util/shooting'
import { pctWhole } from '../util/format'
import { BaseChartContainer, monospace } from '../layout'
import { theme, shotResultColorMap } from '../theme'

interface GameShotPercentBarChartProps {
  stats: EnhancedShootingStats | null,
  width?: number,
  height?: number
}

const GameShotPercentBarChart = observer((props: GameShotPercentBarChartProps) => {
  const { stats, width = 960, height = 320 } = props

  const rawData = !stats ? [] : [
    { x: ShotType.FreeThrow, made: stats.freeThrowsMade, attempted: stats.freeThrowsAttempted },
    { x: ShotType.Rim, made: stats.rimMade, attempted: stats.rimAttempted },
    { x: ShotType.ShortMidRange, made: stats.shortMidRangeMade, attempted: stats.shortMidRangeAttempted },
    { x: ShotType.LongMidRange, made: stats.longMidRangeMade, attempted: stats.longMidRangeAttempted },
    { x: ShotType.GenericTwoPt, made: stats.twoPointersMade, attempted: stats.twoPointersAttempted },
    { x: ShotType.ThreePt, made: stats.threePointersMade, attempted: stats.threePointersAttempted },
    { x: 'fieldGoal', made: stats.fieldGoalsMade, attempted: stats.fieldGoalsAttempted }
  ]

  const yPad = 0.01

  const data = rawData
    .filter(d => d.attempted > 0)
    .map(({ x, made, attempted }) => {
      const missed = (attempted - made)
      const total = made + attempted
      const missedY = yPad + (missed / total)
      const madeY = missedY + (made / total)
      const madelabel = `Made ${made} / ${attempted}`
      const missedlabel = `Missed ${missed} / ${attempted}`

      return [
        { x, label: missedlabel, y0: yPad, y: missedY, fill: shotResultColorMap.miss },
        { x, label: madelabel, y0: missedY, y: madeY, fill: shotResultColorMap.make },
      ]
    })
    .reduce((all, d) => all.concat(d), [])

  // const data = dataPoints
  //   .map(p => {
  //     const color = p.miss ? shotResultColorMap.miss : shotResultColorMap.make
  //     const colorer = (d, active) => active ? '#FDD835' : color
  //     return { ...p, fill: colorer, stroke: colorer }
  //   })
  //   .sort((a, b) => yTicks.indexOf(a.y) - yTicks.indexOf(b.y))

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
        // tickValues={xTicks}
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

// TODO: include big percent chart of all possible shots
