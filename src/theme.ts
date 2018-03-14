
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
  tickLabels: { fontSize: 12, padding: 5, fill: '#000' },
}

const dependentGrid = { stroke: '#ccc', strokeDasharray: '10,10' }

export const theme = {
  defaultChartProps: {
    width: 960,
    height: 540,
    padding: { left: 40, top: 10, bottom: 40, right: 10 }
  },
  area: {
    data: { strokeWidth: 3, fillOpacity: 0.4 }
  },
  line: {
    data: { strokeWidth: 3 }
  },
  scatter: {
    data: { strokeWidth: (d, active) => active ? 4 : 2 }
  },
  axis: {
    style: axisStyle
  },
  independentAxis: {
    style: { ...axisStyle, tickLabels: { ...axisStyle.tickLabels, padding: 8 } }
  },
  dependentAxis: {
    style: { ...axisStyle, grid: dependentGrid }
  }
}

export default theme
