import * as React from 'react'
import { observe } from 'mobx'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import * as moment from 'moment'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryGroup, VictoryLine, VictoryScatter } from 'victory'
import { ShootingStat } from 'nba-netdata/dist/calc'
import { theme, shootingColorMap } from '../theme'
import { PlayerSeasonDataProps } from '../models/seasonData'
import defaultShootingFilterData, { ShootingFilterDataProps } from '../models/shootingFilterData'
import inputDataStore, { InputData } from '../models/inputData'
import ShootingDataLegend from './ShootingDataLegend'

const Container = styled('div')`
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
`

const ChartWrapper = styled('div')`
  width: 100%;
  margin-right: 20px;
  background-color: #fff;
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
    return [xValues[0], xValues[xValues.length - 1]]
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
    const { data, inputData, series } = this.props

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

      let hasData = false
      for (const s of series) {
        hasData = !!s.data.find(item => item.filteredIdx === closestIndex)
        if (hasData) {
          break
        }
      }

      if (!hasData) {
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
    const { xValues, series, data, width = 960, height = 540 } = this.props

    series.forEach(s => {
      s.data.forEach(d => {
        d.strokeWidth = d.gameId === data.filterData.activeGameId ? 8 : undefined
      })
    })

    const containerComponent = <VictoryContainer responsive={true} containerRef={this.setChartContainer} />

    const chartProps = {
      ...theme.defaultChartProps,
      width, height, containerComponent,
      domain: { x: this.xDomain, y: [0, 1] },
      domainPadding: { x: [10, 10], y: [0, 0] }
    }

    const currentXValue = data.activeGame ? moment(data.activeGame.game.GAME_DATE).valueOf() : null

    return (
      <ChartWrapper>
        <VictoryChart {...chartProps}>
          <VictoryAxis
            label="Games"
            style={theme.independentAxis.style}
            tickCount={Math.min(xValues.length, 5)}
            tickValues={xValues}
            tickFormat={d => moment(d).format('MM/DD/YY')}
          />
          <VictoryAxis
            dependentAxis={true}
            label="Accuracy"
            style={theme.dependentAxis.style}
            tickValues={[0.25, 0.5, 0.75, 1]}
            tickFormat={t => `${(t * 100).toFixed(0)}%`}
          />

          {data.activeGame && (
            <VictoryLine
              data={[{ x: currentXValue, y: 0 }, { x: currentXValue, y: 1 }]}
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
      </ChartWrapper>
    )
  }
}

const SeasonShootingChart = observer((props: SeasonShootingChartProps & ShootingFilterDataProps) => {
  const { data, shootingFilterData } = props
  const { filteredGames, filteredStats } = data

  const dates = filteredGames.map(game => moment(game.GAME_DATE))
  let xValues = dates.map(d => d.valueOf())

  const series = shootingFilterData.enabledStats
    .map(key => {
      const seriesData = filteredStats
        .map((item, idx) => ({ x: xValues[idx], y: item[key], filteredIdx: idx, gameId: filteredGames[idx].GAME_ID }))
        .filter(d => !isNaN(d.y))

      return { key, data: seriesData, color: shootingColorMap[key] }
    })

  return (
    <Container>
      <SeasonShootingChartData
        {...props}
        xValues={xValues}
        series={series}
        inputData={inputDataStore}
      />
      <div>
        <ShootingDataLegend filterData={shootingFilterData} />
      </div>
    </Container>
  )
})

const ConnectedSeasonShootingChart = (props: SeasonShootingChartProps) =>
  <SeasonShootingChart {...props} shootingFilterData={defaultShootingFilterData} />

export default ConnectedSeasonShootingChart
