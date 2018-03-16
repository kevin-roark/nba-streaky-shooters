import * as React from 'react'
import { observer } from 'mobx-react'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryTooltip, VictoryArea, VictoryScatter, VictoryGroup, VictoryPortal } from 'victory'
import { ShotType } from 'nba-netdata/dist/types'
import { getParentShotType, isShotTypeFieldGoal, getShotTypePointValue } from 'nba-netdata/dist/calc'
import { PlayByPlayShotDataPoint } from 'nba-netdata/dist/play-by-play'
import { allShotTypes, getShotTypeTitle } from '../util/shooting'
import { formatSeconds } from '../util/format'
import { GameDataProps } from '../models/gameData'
import { BaseChartContainer, monospace } from '../layout'
import { theme, shotResultColorMap, shotTypeColorMap } from '../theme'

const OvertimePeriod = 5 * 60

interface GamePointsOverTimeChartProps extends GameDataProps {
  width?: number,
  height?: number
}

interface GamePointsOverTimeDataPoint {
  x: number, y: number, label: string | null, miss: boolean
}

const GamePointsOverTimeChart = observer((props: GamePointsOverTimeChartProps) => {
  const { width = 960, height = 384 } = props
  const plays = props.data.currentPlays

  const dataByPointValue: { type: ShotType, shots: GamePointsOverTimeDataPoint[]}[] = [
    { type: ShotType.FreeThrow, shots: [{ x: 0, y: 0, label: null, miss: true }] },
    { type: ShotType.GenericTwoPt, shots: [{ x: 0, y: 0, label: null, miss: true }] },
    { type: ShotType.ThreePt, shots: [{ x: 0, y: 0, label: null, miss: true }] },
  ]
  let pointTotal = 0
  plays.forEach(play => {
    const { secondsIntoGame: x, shotType, miss, eventDescription, period, periodSecondsRemaining } = play
    const label = `Q${period} ${formatSeconds(periodSecondsRemaining)} - ${eventDescription}`

    const pointValue = getShotTypePointValue(shotType)
    dataByPointValue.forEach(({ shots, type }) => {
      const lastY = shots.length === 0 ? 0 : shots[shots.length - 1].y

      if (getShotTypePointValue(type) === pointValue) {
        const y = miss ? lastY : lastY + pointValue
        shots.push({ x, y, label, miss })
      } else {
        shots.push({ x, y: lastY, label: null, miss: true })
      }
    })

    pointTotal += miss ? 0 : pointValue
  })

  // get ticks for even breaks of quarters / OT periods
  const xTicks = [0, 12 * 60, 24 * 60, 36 * 60, 48 * 60].map(x => x)
  const maxX = plays.length > 0 ? plays[plays.length - 1].secondsIntoGame : 0
  if (xTicks[xTicks.length - 1] < maxX) {
    const lastX = xTicks[xTicks.length - 1]
    const lastTick = lastX + Math.ceil(((maxX - lastX) / OvertimePeriod)) * OvertimePeriod
    xTicks.push(lastTick)
  }
  const formatX = formatSeconds

  const yTicks = [Math.round(pointTotal * 0.25), Math.round(pointTotal * 0.5), Math.round(pointTotal * 0.75), pointTotal]

  // add data point for last possible time
  dataByPointValue.forEach(d => {
    const lastShot = d.shots[d.shots.length - 1]
    const lastTick = xTicks[xTicks.length - 1]
    if (lastShot.x < lastTick) {
      d.shots.push({ x: lastTick, y: lastShot.y, label: null, miss: true })
    }
  })

  const areaData = dataByPointValue.map(item => {
    const color = shotTypeColorMap[item.type]
    return {
      type: item.type,
      shots: item.shots.map(s => ({ x: s.x, y: s.y })),
      style: { data: { strokeWidth: 3, fillOpacity: 0.4, fill: color, stroke: color }}
    }
  })

  const scatterData = dataByPointValue.map(item => {
    const color = d => d.miss ? '#000' : shotTypeColorMap[item.type]
    return {
      type: item.type,
      shots: item.shots.filter(i => i.label),
      style: { data: { strokeWidth: 3, fill: color, stroke: color }},
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
    domainPadding: { x: 5, }
  }

  const content = (
    <VictoryChart {...chartProps}>
      <VictoryAxis
        label="Game Time"
        style={theme.independentAxis.style}
        tickValues={xTicks}
        tickFormat={formatX}
      />

      <VictoryAxis
        dependentAxis={true}
        style={theme.dependentAxis.style}
        // tickValues={yTicks}
      />

      {areaData.map(d => (
        <VictoryArea key={d.type} style={d.style} data={d.shots} />
      ))}

      {scatterData.map(d => (
        <VictoryScatter key={d.type} style={d.style} data={d.shots} labelComponent={tooltipComponent} />
      ))}
    </VictoryChart>
  )

  return <BaseChartContainer>{content}</BaseChartContainer>
})

export default observer(GamePointsOverTimeChart)
