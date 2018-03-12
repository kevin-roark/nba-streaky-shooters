import * as React from 'react'
import { EnhancedShootingBoxScoreStats } from 'nba-netdata/dist/calc'
import styled from 'react-emotion'
import { VictoryChart, VictoryGroup, VictoryArea } from 'victory'

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
  constructor(props: SeasonShootingChartProps) {
    super(props)
    this.state = {

    }
  }

  render() {
    const { enhancedBoxScores, width = 960, height = 540 } = this.props

    const colorMap = {
      efg: 'cyan',
      tsp: 'red'
    }

    const mapProperty = (k: keyof EnhancedShootingBoxScoreStats) =>
      enhancedBoxScores
        .map(item => item[k])
        .filter(n => !isNaN(n))
        .map((y, idx) => ({ x: idx, y }))

    const efg = mapProperty('effectiveFieldGoalPercentage')
    const tsp = mapProperty('trueShootingPercentage')

    return (
      <ChartContainer width={width}>
        <VictoryChart width={width} height={height}>
          <VictoryGroup style={{ data: { strokeWidth: 3, fillOpacity: 0.4 } }}>
          <VictoryArea
            style={{ data: { fill: colorMap.efg, stroke: colorMap.efg } }}
            data={efg}
          />
          <VictoryArea
            style={{ data: { fill: colorMap.tsp, stroke: colorMap.tsp } }}
            data={tsp}
          />
          </VictoryGroup>
        </VictoryChart>
      </ChartContainer>
    )
  }
}

export default SeasonShootingChart
