
export const shootingColorMap = {
  effectiveFieldGoalPercentage: '#B388FF',
  trueShootingPercentage: '#03A9F4',
  fieldGoalPercentage: '#00796B',
  twoPointPercentage: '#f00',
  threePointPercentage: '#00f',
  freeThrowPercentage: '#4CAF50',
  rimPercentage: '#E65100',
  shortMidRangePercentage: '#C2185B',
  longMidRangePercentage: '#FFC107'
}

export const shotResultColorMap = {
  make: '#00f',
  miss: '#f00'
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
  bar: {
    data: { strokeWidth: 0 },
  },
  line: {
    data: { strokeWidth: 3 }
  },
  scatter: {
    data: { strokeWidth: (d, active) => active ? 4 : 4 }
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
