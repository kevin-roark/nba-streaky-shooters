import * as React from 'react'
import { observer } from 'mobx-react'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryTooltip, VictoryArea, VictoryScatter, VictoryGroup, VictoryPortal } from 'victory'
import { ShotType } from 'nba-netdata/dist/types'
import { getParentShotType, isShotTypeFieldGoal, getShotTypePointValue } from 'nba-netdata/dist/calc'
import { PlayByPlayShotDataPoint } from 'nba-netdata/dist/play-by-play'
import { allShotTypes, getShotTypeTitleAlt } from '../util/shooting'
import { formatSeconds, pct } from '../util/format'
import { GameDataProps } from '../models/gameData'
import { BaseChartContainer, monospace, ComponentTitle } from '../layout'
import { theme, shotResultColorMap, shotTypeColorMap } from '../theme'
import ShotTypeLegend from './ShotTypeLegend'
import Pane from './Pane'

const OvertimePeriod = 5 * 60

interface GamePointsOverTimeChartProps extends GameDataProps {
  width?: number,
  height?: number
}

interface GamePointsOverTimeDataPoint {
  x: number, y: number, makes: number, attempts: number, label: string | null, miss: boolean
}

const GamePointsOverTimeChart = observer((props: GamePointsOverTimeChartProps) => {
  const { width = 960, height = 384 } = props
  const plays = props.data.currentPlays

  // get ticks for even breaks of quarters / OT periods
  const xTicks = [0, 12 * 60, 24 * 60, 36 * 60, 48 * 60].map(x => x)
  const maxX = plays.length > 0 ? plays[plays.length - 1].secondsIntoGame : 0
  if (xTicks[xTicks.length - 1] < maxX) {
    const lastX = xTicks[xTicks.length - 1]
    const lastTick = lastX + Math.ceil(((maxX - lastX) / OvertimePeriod)) * OvertimePeriod
    xTicks.push(lastTick)
  }
  const formatX = formatSeconds

  // we are plotting accuracy
  const yTicks = [0.25, 0.5, 0.75, 1]

  const dataByType: {[type: string]: GamePointsOverTimeDataPoint[]} = {}
  dataByType.fieldGoal = [{ x: 0, y: 0, makes: 0, attempts: 0, label: null, miss: false }]
  allShotTypes.forEach(t => {
    dataByType[t] = [{ x: 0, y: 0, makes: 0, attempts: 0, label: null, miss: false }]
  })

  const addPlayWithShotType = (play: PlayByPlayShotDataPoint, shotType: ShotType | 'fieldGoal') => {
    const { secondsIntoGame: x, miss, eventDescription, period, periodSecondsRemaining } = play

    const shots = dataByType[shotType]
    const lastShot = shots.length === 0 ? null : shots[shots.length - 1]
    let makes = lastShot ? lastShot.makes : 0
    let attempts = lastShot ? lastShot.attempts : 0
    attempts += 1
    if (!miss) {
      makes += 1
    }

    const y = attempts > 0 ? makes / attempts : 0
    const label = `Q${period} ${formatSeconds(periodSecondsRemaining)} - Made ${makes}/${attempts} ${getShotTypeTitleAlt(shotType)} (${pct(y)})`

    shots.push({ x, y, makes, attempts, miss, label })
  }

  plays.forEach(play => {
    addPlayWithShotType(play, play.shotType)

    const parentType = getParentShotType(play.shotType)
    if (parentType) {
      addPlayWithShotType(play, parentType)
    }

    if (isShotTypeFieldGoal(play.shotType)) {
      addPlayWithShotType(play, 'fieldGoal')
    }
  })

  const allData = ['fieldGoal'].concat(allShotTypes)
    .map(type => {
      return { type, shots: dataByType[type] }
    })
    .filter(item => item.shots.length > 0)

  // add data point for last possible time
  allData.forEach(d => {
    const lastShot = d.shots[d.shots.length - 1]
    const lastTick = xTicks[xTicks.length - 1]
    if (lastShot.x < lastTick) {
      d.shots.push({ x: lastTick, y: lastShot.y, makes: lastShot.makes, attempts: lastShot.attempts, label: null, miss: true })
    }
  })

  const areaData = allData.map(item => {
    const color = shotTypeColorMap[item.type]
    return {
      type: item.type,
      shots: item.shots.map(s => ({ x: s.x, y: s.y })),
      style: { data: { strokeWidth: 3, fillOpacity: 0.1, fill: color, stroke: color }}
    }
  })

  const scatterData = allData.map(item => {
    const fill = shotTypeColorMap[item.type]
    const stroke = d => d.miss ? '#000' : shotResultColorMap.make
    return {
      type: item.type,
      shots: item.shots.filter(i => i.label).map(s => ({ ...s, size: 6 })),
      style: { data: { strokeWidth: 2, fill, stroke }},
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
    padding: { left: 50, top: 10, bottom: 25, right: 20 },
  }

  const content = (
    <BaseChartContainer>
      <ComponentTitle>Shooting Accuracy Through Game</ComponentTitle>

      <VictoryChart {...chartProps}>
        <VictoryAxis
          style={{ ...theme.independentAxis.style, grid: { stroke: '#ccc', strokeDasharray: '10,10' }}}
          tickValues={xTicks}
          tickFormat={formatX}
        />

        <VictoryAxis
          dependentAxis={true}
          style={theme.dependentAxis.style}
          tickValues={[0.25, 0.5, 0.75, 1]}
          tickFormat={pct}
        />

        {areaData.map(d => (
          <VictoryArea key={d.type} style={d.style} data={d.shots} />
        ))}

        {scatterData.map(d => (
          <VictoryScatter key={d.type} style={d.style} data={d.shots} labelComponent={tooltipComponent} />
        ))}
      </VictoryChart>
    </BaseChartContainer>
  )

  const legend = <ShotTypeLegend fieldGoal={true} description="Blue bordered dots are makes, blacks are misses." />

  return (
    <Pane
      sideWidth={200}
      mainContent={content}
      sideContent={legend}
    />
  )
})

export default observer(GamePointsOverTimeChart)
