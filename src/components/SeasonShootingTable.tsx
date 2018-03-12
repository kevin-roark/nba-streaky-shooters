import * as React from 'react'
import {
  EnhancedShootingStats,
  EnhancedShootingBoxScoreStats,
  combineBoxScoreStatsWithShootingData,
  getEnhancedShootingBoxScoreStatsStdDev
} from 'nba-netdata/dist/calc'
import { Table, TableColumn, TableConfig } from './Table'

interface SeasonShootingTableData extends EnhancedShootingStats {
  label: string
}

interface SeasonShootingTableProps {
  enhancedBoxScores: EnhancedShootingBoxScoreStats[]
}

export const SeasonShootingTable = (props: SeasonShootingTableProps & TableConfig) => {
  const { enhancedBoxScores } = props
  const shootingData = combineBoxScoreStatsWithShootingData(enhancedBoxScores)
  const stdDevShootingData = getEnhancedShootingBoxScoreStatsStdDev(enhancedBoxScores)

  const getShootingColumn = (Header: string, key: keyof EnhancedShootingStats) => {
    return { Header, accessor: key, percent: true }
  }

  const columns: TableColumn<SeasonShootingTableData>[] = [
    { Header: '', accessor: 'label', align: 'center', width: 180 },
    getShootingColumn('EFG%', 'effectiveFieldGoalPercentage'),
    getShootingColumn('TSP%', 'trueShootingPercentage'),
    getShootingColumn('FG%', 'fieldGoalPercentage'),
    getShootingColumn('2P%', 'twoPointPercentage'),
    getShootingColumn('3P%', 'threePointPercentage'),
    getShootingColumn('FT%', 'freeThrowPercentage')
  ]

  const data = [
    { ...shootingData, label: 'Season AVG' },
    { ...stdDevShootingData, label: 'Game-to-Game STD' }
  ]

  return <Table {...props} data={data} columns={columns} />
}

export default SeasonShootingTable
