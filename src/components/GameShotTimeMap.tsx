import * as React from 'react'
import { observer } from 'mobx-react'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryScatter, VictoryTooltip, VictoryArea } from 'victory'
import { getParentShotType, isShotTypeFieldGoal } from 'nba-netdata/dist/calc'
import { PlayByPlayShotDataPoint } from 'nba-netdata/dist/play-by-play'
import { allShotTypes, getShotTypeTitle } from '../util/shooting'
import { formatSeconds } from '../util/format'
import { GameDataProps } from '../models/gameData'
import { BaseChartContainer, monospace } from '../layout'
import { theme, shotResultColorMap } from '../theme'

const OvertimePeriod = 5 * 60

interface GameShotTimeMapProps extends GameDataProps {
  width?: number,
  height?: number
}

const GameShotTimeMap = observer((props: GameShotTimeMapProps) => {
  const { width = 960, height = 384 } = props
  const plays = props.data.currentPlays

  const xPad = 15
  const yPad = 0.5

  const orderedShotTypes = ['fieldGoal'].concat(allShotTypes)
  const getYValue = (s: string) => orderedShotTypes.indexOf(s) + yPad
  const yTicks = orderedShotTypes.map(getYValue)
  const formatY = i => getShotTypeTitle(orderedShotTypes[i - yPad] as any)

  const dataPoints: { play: PlayByPlayShotDataPoint, x: number, y: number, miss: boolean, label: string }[] = []
  plays.forEach(play => {
    const { secondsIntoGame, shotType, miss, eventDescription, period, periodSecondsRemaining } = play
    const x = secondsIntoGame + xPad
    const label = `Q${period} ${formatSeconds(periodSecondsRemaining)} - ${eventDescription}`

    dataPoints.push({ play, x, y: getYValue(shotType), miss, label })
    const parentType = getParentShotType(shotType)
    if (parentType) {
      dataPoints.push({ play, x, y: getYValue(shotType), miss, label })
    }
    if (isShotTypeFieldGoal(shotType)) {
      dataPoints.push({ play, x, y: getYValue('fieldGoal'), miss, label })
    }
  })

  const data = dataPoints
    .map(p => {
      const color = p.miss ? shotResultColorMap.miss : shotResultColorMap.make
      const colorer = (d, active) => active ? '#FDD835' : color
      return { ...p, fill: colorer, stroke: colorer }
    })
    .sort((a, b) => yTicks.indexOf(a.y) - yTicks.indexOf(b.y))

  // get ticks for even breaks of quarters / OT periods
  const xTicks = [0, 12 * 60, 24 * 60, 36 * 60, 48 * 60].map(x => x + xPad)
  const maxX = data.length > 0 ? data[data.length - 1].x : 0
  if (xTicks[xTicks.length - 1] < maxX) {
    const lastX = xTicks[xTicks.length - 1]
    const lastTick = lastX + Math.ceil(((maxX - lastX) / OvertimePeriod)) * OvertimePeriod
    xTicks.push(lastTick)
  }

  const formatX = x => {
    const seconds = x - xPad
    return formatSeconds(seconds)
  }

  const quadrants = xTicks.slice(1).map((x1, i) => {
    let x0 = xTicks[i]
    if (i === 0) {
      x0 -= xPad
    }

    const y = yTicks.length
    return {
      data: [{ x: x0, y }, { x: x1, y }],
      style: {
        fill: '#000',
        fillOpacity: 0.05 + 0.03 * i,
        strokeWidth: 0
      }
    }
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
    padding: { left: 100, top: 10, bottom: 50, right: 10 },
    domainPadding: { x: 5, y: yPad }
  }

  const content = (
    <VictoryChart {...chartProps}>
      <VictoryAxis
        label="Game Time"
        style={theme.independentAxis.style}
        tickValues={xTicks}
        tickFormat={formatX}
      />

      {quadrants.map((q, i) => (
        <VictoryArea key={i} data={q.data} style={{ data: q.style }} />
      ))}

      <VictoryAxis
        dependentAxis={true}
        style={{ ...theme.dependentAxis.style, grid: { ...theme.dependentAxis.style.grid, stroke: '#666' }}}
        tickValues={yTicks}
        tickFormat={formatY}
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
