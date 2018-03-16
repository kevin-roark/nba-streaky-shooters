import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import {
  EnhancedShootingBoxScoreStats,
  getEnhancedShootingBoxScoreStatsStdDev,
  getEnhancedShootingBoxScoreStatsIQR
} from 'nba-netdata/dist/calc'
import { secondaryContainerStyles, DescriptionExplanation, serif } from '../layout'
import { pct } from '../util/format'
import { shootingColumns, getStatTooltipText } from '../util/shooting'
import { SeasonDataProps } from '../models/seasonData'
import { Table, TableColumn } from './Table2'
import NumberDiff from './NumberDiff'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 20px 20px 15px 20px;
  min-height: 180px;
`

const TextTooltip = styled('div')`
  font-size: 13px;
  font-family: ${serif};
`

interface SeasonShootingTableData {
  all: EnhancedShootingBoxScoreStats,
  filtered: EnhancedShootingBoxScoreStats,
  id: string
}

interface SeasonShootingTableProps extends SeasonDataProps {}

interface SeasonShootingTableContentProps extends SeasonShootingTableProps {
  filtered: boolean,
  rows: SeasonShootingTableData[]
}

const SeasonShootingTableContent = observer(({ rows, filtered }: SeasonShootingTableContentProps) => {
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

  const lc: TableColumn<SeasonShootingTableData> = {
    header: '',
    accessor: 'id',
    align: 'center',
    width: 60,
    dataTooltipRenderer: (d) => <TextTooltip>{getLabelTooltipText(d.id)}</TextTooltip>
  }

  const columns = [lc].concat(shootingColumns.map((({ header, key, title }): TableColumn<SeasonShootingTableData> => {
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

export const SeasonShootingTable = observer((props: SeasonShootingTableProps) => {
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
    <SeasonShootingTableContent {...props} rows={rows} filtered={filtered} />
  )

  return <Container>{content}</Container>
})

export default SeasonShootingTable
