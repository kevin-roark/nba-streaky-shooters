import { ShotType } from 'nba-netdata/dist/types'

export const shotTypeColorMap = {
  fieldGoal: '#00796B',
  [ShotType.GenericTwoPt]: '#f00',
  [ShotType.ThreePt]: '#00f',
  [ShotType.FreeThrow]: '#4CAF50',
  [ShotType.Rim]: '#E65100',
  [ShotType.ShortMidRange]: '#C2185B',
  [ShotType.LongMidRange]: '#FFC107'
}

export const shootingColorMap = {
  effectiveFieldGoalPercentage: '#B388FF',
  trueShootingPercentage: '#03A9F4',
  fieldGoalPercentage: shotTypeColorMap.fieldGoal,
  twoPointPercentage: shotTypeColorMap.genericTwoPt,
  threePointPercentage: shotTypeColorMap.three,
  freeThrowPercentage: shotTypeColorMap.freeThrow,
  rimPercentage: shotTypeColorMap.rim,
  shortMidRangePercentage: shotTypeColorMap.shortMidRange,
  longMidRangePercentage: shotTypeColorMap.longMidRange
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
