import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import {
  EnhancedShootingBoxScoreStats,
  getEnhancedShootingBoxScoreStatsStdDev,
  getEnhancedShootingBoxScoreStatsIQR
} from 'nba-netdata/dist/calc'
import { secondaryContainerStyles, DescriptionExplanation, serif, ComponentTitle } from '../layout'
import { pct } from '../util/format'
import { shootingColumns, getStatTooltipText } from '../util/shooting'
import { SeasonDataProps } from '../models/seasonData'
import { Table, TableColumn, TextTooltip } from './Table2'
import NumberDiff from './NumberDiff'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 0 20px 15px 20px;
  min-height: 180px;
`

interface PlayerSeasonShootingTableData {
  all: EnhancedShootingBoxScoreStats,
  filtered: EnhancedShootingBoxScoreStats,
  id: string
}

interface PlayerSeasonShootingTableProps extends SeasonDataProps {}

interface PlayerSeasonShootingTableContentProps extends PlayerSeasonShootingTableProps {
  filtered: boolean,
  rows: PlayerSeasonShootingTableData[]
}

const PlayerSeasonShootingTableContent = observer(({ rows, filtered }: PlayerSeasonShootingTableContentProps) => {
  const getLabelTooltipText = (value: string) => {
    switch (value) {
      case 'STD':
        return 'Standard Deviation for selected range of games, with per-game data points.'
      case 'IQR':
        return 'Interquartile Range for selected range of games, with per-game data points.'
      case 'AVG':
      default:
        return 'Total for selected range of games.'
    }
  }

  const lc: TableColumn<PlayerSeasonShootingTableData> = {
    header: '',
    accessor: 'id',
    align: 'center',
    width: 60,
    dataTooltipRenderer: (d) => <TextTooltip>{getLabelTooltipText(d.id)}</TextTooltip>
  }

  const columns = [lc].concat(shootingColumns.map((({ header, key, title }): TableColumn<PlayerSeasonShootingTableData> => {
    return {
      header,
      id: key,
      accessor: d => d.filtered[key],
      formatter: (d, v: number) => {
        if (!filtered) {
          return pct(v)
        }

        const av = d.all[key]
        return (
          <span>
            {pct(v)} <span style={{ opacity: 0.5 }}>→</span> <NumberDiff diff={v - av} formatter={pct} />
          </span>
        )
      },
      headerTooltipRenderer: () => <TextTooltip>{title}</TextTooltip>,
      dataTooltipRenderer: d => d.id === 'AVG' ? getStatTooltipText(d.filtered, key) : null
    }
  })))

  return (
    <div>
      <Table rows={rows} columns={columns} />
      <DescriptionExplanation>
        {filtered && 'Colored values are differences between stats over current games and season average. '}
        Hover over cells for more info.
        Stat calculations taken from {' '}
        <a href="https://www.basketball-reference.com/about/glossary.html" target="_blank">Basketball Reference</a>.
      </DescriptionExplanation>
    </div>
  )
})

export const PlayerSeasonShootingTable = observer((props: PlayerSeasonShootingTableProps) => {
  const { data } = props
  const { allStats, filteredStats, filtered, allAverageStats, filteredAverageStats } = data

  const allStdDev = getEnhancedShootingBoxScoreStatsStdDev(allStats)
  const allIQR = getEnhancedShootingBoxScoreStatsIQR(allStats)

  const filteredStdDev = filtered ? getEnhancedShootingBoxScoreStatsStdDev(filteredStats) : allStdDev
  const filteredIQR = filtered ? getEnhancedShootingBoxScoreStatsIQR(filteredStats) : allIQR

  const rows = [
    { all: allAverageStats, filtered: filteredAverageStats, id: 'AVG' },
    { all: allStdDev, filtered: filteredStdDev, id: 'STD' },
    { all: allIQR, filtered: filteredIQR, id: 'IQR' }
  ]

  const content = allStats.length === 0 ? null : (
    <PlayerSeasonShootingTableContent {...props} rows={rows} filtered={filtered} />
  )

  return <Container><ComponentTitle>{data.season} Shooting Stats</ComponentTitle>{content}</Container>
})

export default PlayerSeasonShootingTable
