import { ShootingStat, EnhancedShootingStats, shotTypeToShootingStat, getShotPercentAverage } from 'nba-netdata/dist/calc'
import { ShotType, FieldGoal } from 'nba-netdata/dist/types'

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

const gameShootingColumnKeys: ShootingStat[] = [
  'trueShootingPercentage',
  'effectiveFieldGoalPercentage',
  'fieldGoalPercentage',
  'twoPointPercentage',
  'rimPercentage',
  'shortMidRangePercentage',
  'longMidRangePercentage',
  'threePointPercentage',
  'freeThrowPercentage'
]

export const gameShootingColumns: ShootingColumn[] = gameShootingColumnKeys.map(key => ({
  key, header: getStatAbbr(key), title: getStatTitle(key)
}))

export function getStatAbbr(stat: ShootingStat) {
  switch (stat) {
    case 'points':
      return 'PTS'
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
    case 'points':
      return 'Points'
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
      return 'Shots at Rim %'
    case 'shortMidRangePercentage':
      return 'Short Mid Range %'
    case 'longMidRangePercentage':
      return 'Long Mid Range %'

    default:
      return 'Unknown'
  }
}

export function madeAttemptedText(made: number, attempted: number) {
  return attempted > 0 ? `${Number(made)}/${Number(attempted)}` : null
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
  // if (stat === 'effectiveFieldGoalPercentage') {
  //   const twoP = madeAttemptedText(data.twoPointersMade, data.twoPointersAttempted)
  //   const threeP = madeAttemptedText(data.threePointersMade, data.threePointersAttempted)
  //   return (!twoP && !threeP) ? null : `2P: ${twoP || '0/0'}\n3P: ${threeP || '0/0'}`
  // }

  if (stat === 'points') {
    return `FTM: ${data.freeThrowsMade}\n2PM: ${data.twoPointersMade}\n3PM: ${data.threePointersMade}`
  }

  return getStatMadeAttemptedText(data, stat)
}

export const allShotTypes = [
  ShotType.GenericTwoPt, ShotType.Rim, ShotType.ShortMidRange, ShotType.LongMidRange,
  ShotType.ThreePt, ShotType.FreeThrow
]

export const fieldGoalTypes = [ShotType.Rim, ShotType.ShortMidRange, ShotType.LongMidRange, ShotType.ThreePt]

export function getShotTypeTitle(type: ShotType | 'fieldGoal') {
  switch (type) {
    case ShotType.FreeThrow:
      return 'Free Throw'
    case ShotType.LongMidRange:
      return 'Long Mid Range'
    case ShotType.Rim:
      return 'Rim'
    case ShotType.ShortMidRange:
      return 'Short Mid Range'
    case ShotType.ThreePt:
      return 'Three Pointer'
    case ShotType.GenericTwoPt:
      return 'Two Pointer'
    case FieldGoal:
    default:
      return 'Field Goal'
  }
}

export function getShotTypeAbbr(type: ShotType | 'fieldGoal') {
  return getStatAbbr(shotTypeToShootingStat(type))
}

export function getShotTypeTitleAlt(type: ShotType | 'fieldGoal') {
  switch (type) {
    case ShotType.FreeThrow:
      return 'Free Throws'
    case ShotType.LongMidRange:
      return 'Long Mid Range Shots'
    case ShotType.Rim:
      return 'Shots at Rim'
    case ShotType.ShortMidRange:
      return 'Short Mid Range Shots'
    case ShotType.ThreePt:
      return 'Three Point Shots'
    case ShotType.GenericTwoPt:
      return 'Two Point Shots'
    case FieldGoal:
    default:
      return 'Field Goals'
  }
}

export function getShotHeat (type: string, percent: number) {
  const average = getShotPercentAverage(type)

  return percent < average
    ? 0.5 * (percent / average)
    : 0.5 + (percent - average) / (1 - average)
}

export const getStreakHeat = (type: string, streak: number) => {
  if (streak <= 1) {
    return type === 'hit' ? 0 : 1
  } else if (streak === 2) {
    return 0.5
  }

  const maxStreak = 8
  const v = Math.min(1, 0.5 + (streak - 3) / (maxStreak - 3) * 0.5)
  return type === 'hit' ? v : (0.5 - v)
}

export const getPointsHeat = (points: number, max: number = 10) => {
  return points / max
}
