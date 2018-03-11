import * as React from 'react'
import { GameStats } from 'nba-netdata/dist/types'
import { EnhancedShootingStats, combineBoxScoreStatsWithShootingData } from 'nba-netdata/dist/calc'
import { Table, TableColumn, TableConfig, RightAlignedTableCell } from './Table'

export const SeasonShootingTable = (props: { data: EnhancedShootingStats } & TableConfig) => {
  const { data } = props

  const getShootingColumn = (Header: string, key: keyof EnhancedShootingStats) => {
    const Cell = row => {
      return <RightAlignedTableCell>{row.value}</RightAlignedTableCell>
    }
    return { Header, accessor: key, percent: true, Cell }
  }

  const columns: TableColumn<EnhancedShootingStats>[] = [
    getShootingColumn('EFG%', 'effectiveFieldGoalPercentage'),
    getShootingColumn('TSP%', 'trueShootingPercentage'),
    getShootingColumn('FG%', 'fieldGoalPercentage'),
    getShootingColumn('2P%', 'twoPointPercentage'),
    getShootingColumn('3P%', 'threePointPercentage'),
    getShootingColumn('FT%', 'freeThrowPercentage')
  ]

  return <Table {...props} data={[data]} columns={columns} />
}

export const BoxScoreSeasonShootingTable = (props: { stats: GameStats[] } & TableConfig) => {
  const boxScores = props.stats.map(s => s.stats)
  const shootingData = combineBoxScoreStatsWithShootingData(boxScores)
  return <SeasonShootingTable {...props} data={shootingData} />
}

export default SeasonShootingTable
