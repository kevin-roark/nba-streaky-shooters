import * as React from 'react'
import { observer } from 'mobx-react'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryScatter, VictoryTooltip } from 'victory'
import { getParentShotType, isShotTypeFieldGoal } from 'nba-netdata/dist/calc'
import { PlayByPlayShotDataPoint } from 'nba-netdata/dist/play-by-play'
import { allShotTypes, getShotTypeTitle } from '../util/shooting'
import { zpad } from '../util/format'
import { Plays } from '../models/gameData'
import { BaseChartContainer, monospace } from '../layout'
import { theme, shotResultColorMap } from '../theme'

interface GameShotTimeMapProps extends Plays {
  width?: number,
  height?: number
}

const GameShotTimeMap = observer((props: GameShotTimeMapProps) => {
  const { plays, width = 960, height = 384 } = props

  const xTicks = [0, 12 * 60, 24 * 60, 36 * 60, 48 * 60]
  const formatX = seconds => {
    const m = Math.floor(seconds / 60)
    const s = seconds - m * 60
    return `${zpad(m)}:${zpad(s)}`
  }

  const yTicks = ['fieldGoal'].concat(allShotTypes)

  const dataPoints: { play: PlayByPlayShotDataPoint, x: number, y: string, miss: boolean, label: string }[] = []
  plays.forEach(play => {
    const { secondsIntoGame: x, shotType, miss, eventDescription } = play
    const time = formatX(x)
    const label = `${time} - ${eventDescription}`

    dataPoints.push({ play, x, y: shotType, miss, label })
    const parentType = getParentShotType(shotType)
    if (parentType) {
      dataPoints.push({ play, x, y: parentType, miss, label })
    }
    if (isShotTypeFieldGoal(shotType)) {
      dataPoints.push({ play, x, y: 'fieldGoal', miss, label })
    }
  })

  const data = dataPoints
    .map(p => {
      const color = p.miss ? shotResultColorMap.miss : shotResultColorMap.make
      const colorer = (d, active) => active ? '#FDD835' : color
      return { ...p, fill: colorer, stroke: colorer }
    })
    .sort((a, b) => yTicks.indexOf(a.y) - yTicks.indexOf(b.y))

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
    domainPadding: { x: [10, 10], y: [10, 10] }
  }

  const content = (
    <VictoryChart {...chartProps}>
      <VictoryAxis
        style={theme.independentAxis.style}
        tickValues={xTicks}
        tickFormat={formatX}
      />
      <VictoryAxis
        dependentAxis={true}
        style={theme.dependentAxis.style}
        tickValues={yTicks}
        tickFormat={getShotTypeTitle}
      />

      <VictoryScatter
        style={theme.scatter}
        symbol="circle"
        data={data}
        labelComponent={tooltipComponent}
      />
    </VictoryChart>
  )

  return <BaseChartContainer>{content}</BaseChartContainer>
})

export default observer(GameShotTimeMap)
