
export const shootingColorMap = {
  effectiveFieldGoalPercentage: 'cyan',
  trueShootingPercentage: 'red',
  fieldGoalPercentage: 'blue',
  twoPointPercentage: 'orange',
  threePointPercentage: 'green',
  freeThrowPercentage: 'pink',
  rimPercentage: 'purple',
  shortMidRangePercentage: 'yellow',
  longMidRangePercentage: 'black'
}

const axisStyle = {
  axis: { stroke: '#000', strokeWidth: 3 },
  axisLabel: { fontSize: 16, textAnchor: 'middle', padding: 25 },
  tickLabels: { fontSize: 12, padding: 5, fill: '#000' }
}

export const theme = {
  defaultChartProps: {
    width: 960,
    height: 540,
    padding: { left: 50, top: 10, bottom: 50, right: 10 }
  },
  area: {
    data: { strokeWidth: 3, fillOpacity: 0.4 }
  },
  line: {
    data: { strokeWidth: 3 }
  },
  scatter: {
    data: { strokeWidth: 2 }
  },
  axis: {
    style: axisStyle
  },
  independentAxis: {
    style: { ...axisStyle, tickLabels: { ...axisStyle.tickLabels, padding: 8 } }
  },
  dependentAxis: {
    style: { ...axisStyle, axisLabel: { ...axisStyle.axisLabel, padding: 30 } }
  }
}

export default theme
