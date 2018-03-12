import * as React from 'react'
import { EnhancedShootingBoxScoreStats } from 'nba-netdata/dist/calc'
import styled from 'react-emotion'
import { VictoryChart, VictoryGroup, VictoryArea, VictoryScatter } from 'victory'

const ChartContainer = styled<{ width: number }, 'div'>('div')`
  width: ${props => props.width}px;
  margin: 0 auto;
`

interface SeasonShootingChartProps {
  enhancedBoxScores: EnhancedShootingBoxScoreStats[]
  width?: number,
  height?: number
}

interface SeasonShootingChartState {

}

class SeasonShootingChart extends React.Component<SeasonShootingChartProps, SeasonShootingChartState> {
  state = {}

  render() {
    const { enhancedBoxScores, width = 960, height = 540 } = this.props

    const mapProperty = (k: keyof EnhancedShootingBoxScoreStats) =>
      enhancedBoxScores
        .map(item => item[k])
        .filter(n => !isNaN(n))
        .map((y, idx) => ({ x: idx, y }))

    const groupStyle = { strokeWidth: 3, fillOpacity: 0.4 }

    const colorMap = {
      effectiveFieldGoalPercentage: 'cyan',
      trueShootingPercentage: 'red'
    }

    const dataKeys: (keyof EnhancedShootingBoxScoreStats)[] = ['effectiveFieldGoalPercentage', 'trueShootingPercentage']

    const series = dataKeys.map(key => ({ key, data: mapProperty(key), color: colorMap[key] }))

    return (
      <ChartContainer width={width}>
        <VictoryChart width={width} height={height}>
          <VictoryGroup style={{ data: groupStyle }}>
            {series.map(({ key, data, color }) => (
              <VictoryGroup key={key} style={{ data: { fill: color, stroke: color } }} data={data}>
                <VictoryArea />
                <VictoryScatter symbol="circle" />
              </VictoryGroup>
            ))}
          </VictoryGroup>
        </VictoryChart>
      </ChartContainer>
    )
  }
}

export default SeasonShootingChart
