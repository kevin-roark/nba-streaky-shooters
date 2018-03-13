import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import * as moment from 'moment'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryGroup, VictoryLine, VictoryScatter } from 'victory'
import { GameLog } from 'nba-netdata/dist/types'
import { EnhancedShootingBoxScoreStats, ShootingStat } from 'nba-netdata/dist/calc'
import { theme, shootingColorMap } from '../theme'
import shootingFilterData, { ShootingFilterData } from '../models/shootingFilterData'
import ShootingDataLegend from './ShootingDataLegend'
import HoverContainer from './HoverContainer'
import SeasonShootingHoverGame from './SeasonShootingHoverGame'

const Container = styled('div')`
  margin: 20px auto 0 auto;
  max-width: 1440px;
  display: flex;
  align-items: flex-start;
`

const ChartWrapper = styled('div')`
  width: 100%;
  margin-right: 20px;
  background-color: #fff;
`

interface SeasonShootingChartProps {
  games: GameLog[],
  enhancedBoxScores: EnhancedShootingBoxScoreStats[]
  width?: number,
  height?: number
}

interface SeasonShootingData {
  x: number,
  y: number,
  idx: number
}

interface SeasonShootingChartDataProps extends SeasonShootingChartProps {
  xDomain: [number, number],
  xValues: number[],
  series: { key: ShootingStat, color: string, data: SeasonShootingData[] }[]
}

interface SeasonShootingChartDataState {
  hoverInfo: { mouseX: number, mouseY: number, dataIndex: number },
  showHoverInfo: boolean
}

class SeasonShootingChartData extends React.Component<SeasonShootingChartDataProps, SeasonShootingChartDataState> {
  constructor(props: SeasonShootingChartDataProps) {
    super(props)
    this.state = {
      showHoverInfo: false,
      hoverInfo: { mouseX: -1, mouseY: -1, dataIndex: -1 }
    }
  }

  closeHoverContainer = () => {
    this.setState({ showHoverInfo: false })
  }

  renderHoverInfo() {
    const { hoverInfo, showHoverInfo } = this.state
    if (!showHoverInfo) {
      return null
    }

    const { games, enhancedBoxScores } = this.props

    return (
      <HoverContainer {...hoverInfo} selfManaged={true} onCloseRequest={this.closeHoverContainer}>
        <SeasonShootingHoverGame games={games} stats={enhancedBoxScores} dataIndex={hoverInfo.dataIndex} />
      </HoverContainer>
    )
  }

  render() {
    const { xDomain, xValues, series, width = 960, height = 540 } = this.props
    // const { hoverInfo } = this.state

    const events = [{
      target: 'data',
      eventHandlers: {
        onMouseOver: (e: MouseEvent) => [{
          mutation: (props) => {
            this.setState({
              showHoverInfo: true,
              hoverInfo: { mouseX: e.clientX, mouseY: e.clientY, dataIndex: props.datum.idx }
            })
            return { style: { ...props.style, strokeWidth: 8 } }
          }
        }],
        onMouseOut: (e: MouseEvent) => [{
          mutation: (props) => {
            return null
          }
        }]
      }
    }]
    //
    // const series = this.props.series.map(s => ({
    //   ...s,
    //   data: s.data.map(d => ({ ...d, strokeWidth: d.idx === h ? 8 : 2 }))
    // }))

    const chartProps = {
      ...theme.defaultChartProps,
      width, height,
      containerComponent: <VictoryContainer responsive={true} />,
      domain: { x: xDomain, y: [0, 1] },
      domainPadding: { x: [10, 10], y: [0, 5] }
    }

    return (
      <ChartWrapper>
        {this.renderHoverInfo()}

        <VictoryChart {...chartProps}>
          <VictoryGroup>
            {series.map(({ key, data, color }) => (
              <VictoryGroup key={key} style={{ data: { fill: color, stroke: color } }} data={data}>
                <VictoryLine style={theme.line} />
                <VictoryScatter events={events}  symbol="circle" style={theme.scatter} />
              </VictoryGroup>
            ))}
          </VictoryGroup>
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
            tickValues={[0, 0.25, 0.5, 0.75, 1]}
            tickFormat={t => `${(t * 100).toFixed(0)}%`}
          />
        </VictoryChart>
      </ChartWrapper>
    )
  }
}

const SeasonShootingChart = observer((props: SeasonShootingChartProps & { filterData: ShootingFilterData }) => {
  const { games, enhancedBoxScores, filterData } = props

  const series = filterData.enabledStats
    .map(key => {
      const data = enhancedBoxScores
        .map((item, idx) => {
          const date = moment(games[idx].GAME_DATE)
          return { x: date.valueOf(), y: item[key], idx }
        })
        .filter(d => !isNaN(d.y))

      const color = shootingColorMap[key]

      return { key, data, color }
    })

  let minX = Infinity, maxX = -Infinity, xValueSet = new Set<number>()
  series.forEach(s => {
    s.data.forEach(({ x }) => {
      xValueSet.add(x)
      minX = Math.min(x, minX)
      maxX = Math.max(x, maxX)
    })
  })

  const xValues = Array.from(xValueSet)

  return (
    <Container>
      <SeasonShootingChartData
        {...props}
        xDomain={[minX, maxX]}
        xValues={xValues}
        series={series}
      />
      <ShootingDataLegend filterData={filterData} />
    </Container>
  )
})

const ConnectedSeasonShootingChart = (props: SeasonShootingChartProps) =>
  <SeasonShootingChart {...props} filterData={shootingFilterData} />

export default ConnectedSeasonShootingChart
