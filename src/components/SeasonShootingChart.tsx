import * as React from 'react'
import { observer } from 'mobx-react'
import { EnhancedShootingBoxScoreStats } from 'nba-netdata/dist/calc'
import styled from 'react-emotion'
import { VictoryContainer, VictoryChart, VictoryAxis, VictoryGroup, VictoryArea, VictoryScatter } from 'victory'
import { theme } from '../config'
import shootingFilterData, { ShootingFilterData } from '../models/shootingFilterData'
import ShootingDataLegend from './ShootingDataLegend'

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
  enhancedBoxScores: EnhancedShootingBoxScoreStats[]
  width?: number,
  height?: number
}

@observer
class SeasonShootingChart extends React.Component<SeasonShootingChartProps & { filterData: ShootingFilterData }, {}> {
  render() {
    const { enhancedBoxScores, filterData, width = 960, height = 540 } = this.props

    const mapProperty = (k: keyof EnhancedShootingBoxScoreStats) =>
      enhancedBoxScores
        .map(item => item[k])
        .filter(n => !isNaN(n))
        .map((y, idx) => ({ x: idx + 5, y }))

    const series = filterData.enabledStats
      .map(key => ({ key, data: mapProperty(key), color: theme.shootingColorMap[key] }))

    const groupStyle = { strokeWidth: 3, fillOpacity: 0.4 }

    const axisStyle = {
      axis: { stroke: '#000', strokeWidth: 3 },
      axisLabel: { fontSize: 16 },
      tickLabels: { fontSize: 12, padding: 5, fill: '#000' }
    }

    const xAxisStyle = { ...axisStyle, axisLabel: { ...axisStyle.axisLabel, padding: 25 }}
    const yAxisStyle = { ...axisStyle, axisLabel: { ...axisStyle.axisLabel, padding: 30 }}

    const chartProps = {
      width, height,
      padding: { left: 50, top: 10, bottom: 50, right: 10 },
      containerComponent: <VictoryContainer responsive={true} />,
      domain: { y: [0, 1] },
      domainPadding: { x: [5, 5], y: [0, 5] }
    }

    return (
      <Container>
        <ChartWrapper>
          <VictoryChart {...chartProps} >
            <VictoryGroup style={{ data: groupStyle }}>
              {series.map(({ key, data, color }) => (
                <VictoryGroup key={key} style={{ data: { fill: color, stroke: color } }} data={data}>
                  <VictoryArea />
                  <VictoryScatter symbol="circle" />
                </VictoryGroup>
              ))}
            </VictoryGroup>
            <VictoryAxis
              label="Games"
              style={xAxisStyle}
            />
            <VictoryAxis
              dependentAxis={true}
              label="Accuracy"
              style={yAxisStyle}
              tickValues={[0, 0.25, 0.5, 0.75, 1]}
              tickFormat={t => `${(t * 100).toFixed(0)}%`}
            />
          </VictoryChart>
        </ChartWrapper>
        <ShootingDataLegend filterData={filterData} />
      </Container>
    )
  }
}

const ConnectedSeasonShootingChart = (props: SeasonShootingChartProps) =>
  <SeasonShootingChart {...props} filterData={shootingFilterData} />

export default ConnectedSeasonShootingChart
