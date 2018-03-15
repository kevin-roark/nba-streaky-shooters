import { ShootingStat, EnhancedShootingStats } from 'nba-netdata/dist/calc'

export interface ShootingColumn { header: string, key: ShootingStat, title: string }

const shootingColumnKeys: ShootingStat[] = [
  'trueShootingPercentage',
  'effectiveFieldGoalPercentage',
  'fieldGoalPercentage',
  'twoPointPercentage',
  'threePointPercentage',
  'freeThrowPercentage'
]

export const shootingColumns: ShootingColumn[] = shootingColumnKeys.map(key => ({
  key, header: getStatAbbr(key), title: getStatTitle(key)
}))

export function getStatAbbr(stat: ShootingStat) {
  switch (stat) {
    case 'effectiveFieldGoalPercentage':
      return 'eFG'
    case 'trueShootingPercentage':
      return 'TSP'
    case 'fieldGoalPercentage':
      return 'FG'
    case 'twoPointPercentage':
      return '2P'
    case 'threePointPercentage':
      return '3P'
    case 'freeThrowPercentage':
      return 'FT'
    case 'rimPercentage':
      return 'RIM'
    case 'shortMidRangePercentage':
      return 'SMR'
    case 'longMidRangePercentage':
      return 'LMR'

    default:
      return 'Unknown'
  }
}

export function getStatTitle(stat: ShootingStat) {
  switch (stat) {
    case 'effectiveFieldGoalPercentage':
      return 'Effective Field Goal %'
    case 'trueShootingPercentage':
      return 'True Shooting %'
    case 'fieldGoalPercentage':
      return 'Field Goal %'
    case 'twoPointPercentage':
      return 'Two Point %'
    case 'threePointPercentage':
      return 'Three Point %'
    case 'freeThrowPercentage':
      return 'Free Throw %'
    case 'rimPercentage':
      return 'Shots at rim %'
    case 'shortMidRangePercentage':
      return 'Short mid range %'
    case 'longMidRangePercentage':
      return 'Long mid range %'

    default:
      return 'Unknown'
  }
}

export function madeAttemptedText(made: number, attempted: number) {
  return `${Number(made)} / ${Number(attempted)}`
}

export function getStatMadeAttemptedText(data: EnhancedShootingStats, stat: ShootingStat) {
  const mat = madeAttemptedText

  switch (stat) {
    case 'twoPointPercentage':
      return mat(data.twoPointersMade, data.twoPointersAttempted)
    case 'threePointPercentage':
      return mat(data.threePointersMade, data.threePointersAttempted)
    case 'fieldGoalPercentage':
      return mat(data.fieldGoalsMade, data.fieldGoalsAttempted)
    case 'freeThrowPercentage':
      return mat(data.freeThrowsMade, data.freeThrowsAttempted)
    case 'rimPercentage':
      return mat(data.rimMade, data.rimAttempted)
    case 'shortMidRangePercentage':
      return mat(data.shortMidRangeMade, data.shortMidRangeAttempted)
    case 'longMidRangePercentage':
      return mat(data.longMidRangeMade, data.longMidRangeAttempted)

    case 'effectiveFieldGoalPercentage':
    case 'trueShootingPercentage':
    default:
      return null
  }
}

export function getStatTooltipText(data: EnhancedShootingStats, stat: ShootingStat) {
  if (stat === 'effectiveFieldGoalPercentage') {
    const twoP = madeAttemptedText(data.twoPointersMade, data.twoPointersAttempted)
    const threeP = madeAttemptedText(data.threePointersMade, data.threePointersAttempted)
    return `2P: ${twoP}\n3P: ${threeP}`
  }

  return getStatMadeAttemptedText(data, stat)
}
