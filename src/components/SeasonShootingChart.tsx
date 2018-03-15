import * as React from 'react'
import { observe } from 'mobx'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import * as moment from 'moment'
import { VictoryContainer, VictoryBrushContainer, VictoryChart, VictoryAxis, VictoryGroup, VictoryLine, VictoryScatter } from 'victory'
import { GameLog } from 'nba-netdata/dist/types'
import { ShootingStat, EnhancedShootingBoxScoreStats } from 'nba-netdata/dist/calc'
import { theme, shootingColorMap } from '../theme'
import { DescriptionExplanation, secondaryBorderStyles } from '../layout'
import { PlayerSeasonDataProps } from '../models/seasonData'
import inputDataStore, { InputData } from '../models/inputData'

const Container = styled('div')`
  ${secondaryBorderStyles};
  background-color: #fff;
  min-height: 400px;
`

interface SeasonShootingChartProps extends PlayerSeasonDataProps {
  width?: number,
  height?: number
}

interface SeasonShootingData {
  x: number,
  y: number,
  filteredIdx: number,
  gameId: string,
  strokeWidth?: number
}

interface SeasonShootingChartDataProps extends SeasonShootingChartProps {
  xValues: number[],
  series: { key: ShootingStat, color: string, data: SeasonShootingData[] }[],
  inputData: InputData
}

interface SeasonShootingChartDataState {
  lockedPosition: null | { mouseY: number }
}

@observer
class SeasonShootingChartData extends React.Component<SeasonShootingChartDataProps, SeasonShootingChartDataState> {
  chartContainer: HTMLDivElement | null
  inputObserveDesposers: (() => void)[] = []
  constructor(props: SeasonShootingChartDataProps) {
    super(props)
    this.state = { lockedPosition: null }
  }

  get xDomain() {
    const { xValues } = this.props
    return xValues.length > 0 ? [xValues[0], xValues[xValues.length - 1]] : [0, 0]
  }

  get chartBoundsWithPadding() {
    if (!this.chartContainer) {
      return null
    }

    const bounds = this.chartContainer.getBoundingClientRect()

    const chartPadding = theme.defaultChartProps.padding
    return {
      left: bounds.left + chartPadding.left + 10,
      right: bounds.right - chartPadding.right - 10,
      top: bounds.top + chartPadding.top,
      bottom: bounds.bottom - chartPadding.bottom
    }
  }

  componentDidMount() {
    const { data, inputData } = this.props

    // when the mouse moves over the chart, we need to update the active game
    const mouseMoveObserver = observe(inputData, 'mousePosition', change => {
      if (change.type !== 'update' || this.state.lockedPosition) {
        return
      }

      const bounds = this.chartBoundsWithPadding
      if (!bounds || !inputData.isMouseWithinBounds(bounds)) {
        return
      }

      const { xDomain, props: { xValues } } = this

      const xp = inputData.getMouseXPercent(bounds)
      const xpv = xDomain[0] + xp * (xDomain[1] - xDomain[0])

      // find the closest x value to the mouse -- key is that they are not uniformly distributed
      let closestIndex = -1
      let closestXDist = Infinity
      xValues.forEach((x, idx) => {
        const dist = Math.abs(x - xpv)
        if (dist < closestXDist) {
          closestXDist = dist
          closestIndex = idx
        }
      })

      if (closestIndex < 0 || closestIndex >= data.filteredGames.length) {
        return data.filterData.clearActiveGameId()
      }

      data.filterData.setActiveGameId(data.filteredGames[closestIndex].GAME_ID)
    })

    // mouse down over the chart toggles lock on the active game
    const mouseDownDesposer = observe(inputData, 'mouseDown', change => {
      if (change.type === 'update' && change.newValue) {
        if (inputData.isMouseWithinBounds(this.chartBoundsWithPadding)) {
          const lp = this.state.lockedPosition ? null : { mouseY: inputData.mouseY }
          this.setState({ lockedPosition: lp })
        }
      }
    })

    this.inputObserveDesposers.push(mouseMoveObserver)
    this.inputObserveDesposers.push(mouseDownDesposer)
  }

  componentWillUnmount() {
    this.inputObserveDesposers.forEach(desposer => desposer())
    this.inputObserveDesposers = []
  }

  setChartContainer = (el: HTMLDivElement | null)  => {
    this.chartContainer = el
  }

  render() {
    const { xValues, series, data, width = 960, height = 384 } = this.props

    series.forEach(s => {
      s.data.forEach(d => {
        const isActiveGame = d.gameId === data.filterData.activeGameId
        d.strokeWidth = isActiveGame ? 8 : undefined
      })
    })

    const containerComponent = <VictoryContainer responsive={true} containerRef={this.setChartContainer} />

    const chartProps = {
      ...theme.defaultChartProps,
      width, height, containerComponent,
      domain: { x: this.xDomain, y: [0, 1] },
      domainPadding: { x: [10, 10], y: [0, 0] }
    }

    return (
      <VictoryChart {...chartProps}>
        <VictoryAxis
          style={theme.independentAxis.style}
          tickCount={Math.min(xValues.length, 5)}
          tickValues={xValues}
          tickFormat={d => moment(d).format('MM/DD/YY')}
        />
        <VictoryAxis
          dependentAxis={true}
          style={theme.dependentAxis.style}
          tickValues={[0.25, 0.5, 0.75, 1]}
          tickFormat={t => `${(t * 100).toFixed(0)}%`}
        />

        {data.activeGame && (
          <VictoryLine
            data={[{ x: data.activeGameTime, y: 0 }, { x: data.activeGameTime, y: 1 }]}
            style={{ data: { stroke: '#000', strokeWidth: 2, strokeDasharray: '10,10' } }}
          />
        )}

        <VictoryGroup>
          {series.map(({ key, data: seriesData, color }) => (
            <VictoryGroup key={key} style={{ data: { fill: color, stroke: color } }} data={seriesData}>
              <VictoryScatter symbol="circle" style={theme.scatter} />
            </VictoryGroup>
          ))}
        </VictoryGroup>
      </VictoryChart>
    )
  }
}

interface SeasonShootingBrushChartProps extends SeasonShootingChartProps {
  series: { key: ShootingStat, color: string, data: SeasonShootingData[] }[],
}

const SeasonShootingBrushChart = observer((props: SeasonShootingBrushChartProps) => {
  const { series, data } = props

  const brushChartProps = {
    ...theme.defaultChartProps,
    height: 120,
    padding: { ...theme.defaultChartProps.padding, bottom: 30 },
    containerComponent: (
      <VictoryBrushContainer
        responsive={true}
        brushDimension="x"
        brushStyle={{ fill: 'orange', fillOpacity: 0.1 }}
        brushDomain={{ x: data.filterData.timeRange, y: [0, 1] }}
        onBrushDomainChange={(domain: { x: [number, number], y: [number, number] }) => {
          data.filterData.setDateRangeFromTimes(domain.x[0], domain.x[1])
        }}
      />
    )
  }

  const monthsSet = new Set<string>()
  const brushTickValues: number[] = []
  data.allGameDates.forEach(d => {
    const m = d.format('MM/YY')
    if (!monthsSet.has(m)) {
      monthsSet.add(m)
      brushTickValues.push(moment(d.format('MM/DD/YY')).valueOf())
    }
  })

  const axisStyle = { ...theme.independentAxis.style }

  return (
    <VictoryChart {...brushChartProps}>
      <VictoryAxis
        style={axisStyle}
        tickValues={brushTickValues}
        tickFormat={d => moment(d).format('MM/YY')}
      />
      {series.map(({ key, data: seriesData, color }) => {
        const style = { data: { ...theme.scatter.data, stroke: color }}
        return <VictoryLine key={key} style={style} data={seriesData} />
      })}

      {data.activeGame && (
        <VictoryLine
          data={[{ x: data.activeGameTime, y: 0 }, { x: data.activeGameTime, y: 1 }]}
          style={{ data: { stroke: '#000', strokeWidth: 2 } }}
        />
      )}
    </VictoryChart>
  )
})

const SeasonShootingChart = observer((props: SeasonShootingChartProps) => {
  const { data } = props
  const { allStats, allGames, filteredGames, filteredStats } = data

  const allXValues = allGames.map(game => game.date.valueOf())
  const filteredXValues = filteredGames.map(game => game.date.valueOf())

  const getSeries = (stats: EnhancedShootingBoxScoreStats[], games: GameLog[], xValues: number[]) => {
    return data.filterData.shootingFilter.enabledStats
     .map(key => {
       const seriesData = stats
         .map((item, idx) => ({ x: xValues[idx], y: item[key], filteredIdx: idx, gameId: games[idx].GAME_ID }))
         .filter(d => !isNaN(d.y))

       return { key, data: seriesData, color: shootingColorMap[key] }
     })
   }

  const allSeries = getSeries(allStats, allGames, allXValues)
  const filteredSeries = getSeries(filteredStats, filteredGames, filteredXValues)

  const content = allStats.length === 0 ? null : (
    <div>
      <SeasonShootingChartData
        {...props}
        xValues={filteredXValues}
        series={filteredSeries}
        inputData={inputDataStore}
      />
      <SeasonShootingBrushChart {...props} series={allSeries} />
      <DescriptionExplanation style={{ paddingLeft: 40, paddingBottom: 15 }}>
        Click on upper graph to <b>lock active game</b>.
        Drag and pan lower graph to <b>select range of games</b>.
      </DescriptionExplanation>
    </div>
  )

  return <Container>{content}</Container>
})

export default SeasonShootingChart
