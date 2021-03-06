import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { Link } from 'react-router-dom'
import {
  EnhancedShootingBoxScoreStats,
  getEnhancedShootingBoxScoreStatsStdDev,
} from 'nba-netdata/dist/calc'
import * as routes from '../routes'
import { secondaryContainerStyles, DescriptionExplanation, ComponentTitle } from '../layout'
import { pct, pctZpad } from '../util/format'
import { shootingColumns, getStatTooltipText, getShotHeat  } from '../util/shooting'
import { TeamSeasonDataProps } from '../models/seasonData'
import { Table, TableColumn, TextTooltip } from './Table2'
import NumberDiff from './NumberDiff'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 0 20px 15px 20px;
  min-height: 180px;
`

const TooltipWrapper = styled('div')`
`

interface TeamSeasonShootingTableData {
  id: string
  all: { overall: EnhancedShootingBoxScoreStats, stdDev: EnhancedShootingBoxScoreStats, stats: EnhancedShootingBoxScoreStats[] },
  filtered: { overall: EnhancedShootingBoxScoreStats, stdDev: EnhancedShootingBoxScoreStats, stats: EnhancedShootingBoxScoreStats[] },
  link?: string
}

interface TeamSeasonShootingTableProps extends TeamSeasonDataProps {}

interface TeamSeasonShootingTableContentProps extends TeamSeasonShootingTableProps {
  filtered: boolean,
  rows: TeamSeasonShootingTableData[]
}

const TeamSeasonShootingTableContent = observer(({ rows, filtered }: TeamSeasonShootingTableContentProps) => {
  const columns: TableColumn<TeamSeasonShootingTableData>[] = [
    {
      header: '', accessor: 'id', align: 'left', width: 175,
      formatter: (d, v) => {
        if (!d.link) {
          return v
        }

        return <Link to={d.link}>{v}</Link>
      }
    },
    { header: 'MIN', id: 'MIN', width: 60, align: 'center',
      accessor: d => d.id === 'Overall' ? '-' : Math.round(d.filtered.overall.MIN),
      headerTooltipRenderer: () => <TextTooltip>Total Minutes Played</TextTooltip>
    },
    { header: 'GP', id: 'GP', width: 60, align: 'center',
      accessor: d => d.filtered.stats.length,
      headerTooltipRenderer: () => <TextTooltip>Total Games Played</TextTooltip>
    },
    ...shootingColumns.map((({ header, key, title }): TableColumn<TeamSeasonShootingTableData> => {
      const accessor = d => d.filtered.overall[key]
      return {
        header, id: key, accessor, align: 'center',
        heatProvider: d => getShotHeat(key, accessor(d)),
        formatter: (d, v: number) => {
          if (isNaN(v)) {
            return '-'
          }
          if (!filtered) {
            const std = d.filtered.stdDev[key]
            return std && !isNaN(std) ? `${pctZpad(v)} | ${pctZpad(std)}` : pct(v)
          }

          const av = d.all.overall[key]
          return (
            <span>
              {pct(v)} <span style={{ opacity: 0.5 }}>→</span> <NumberDiff diff={v - av} formatter={pct} />
            </span>
          )
        },
        headerTooltipRenderer: () => <TextTooltip>{title}</TextTooltip>,
        dataTooltipRenderer: d => {
          let std = filtered ? d.filtered.stdDev[key] : null
          if (isNaN(Number(std))) {
            std = null
          }

          const stat = getStatTooltipText(d.filtered.overall, key)
          if (!stat && !std) {
            return null
          }

          return (
            <TooltipWrapper>
              <div>{std && `STD: ${pct(std)}`}</div>
              <div>{stat && `${std ? 'Counts:' : ''} ${stat}`}</div>
            </TooltipWrapper>
          )
        }
      }
    }))
  ]

  return (
    <div>
      <Table rows={rows} columns={columns} sortable={true} styles={['medium']} />
      <DescriptionExplanation>
        {filtered && 'Colored % values are differences between stats over currently filtered games and the season overall. '}
        {!filtered && 'The left half of each cell is the % value. The right half is game-to-game standard deviation. '}
        Hover over cells for more info.
        Players with less than 200 minutes filtered out.
        Stat calculations taken from {' '}
        <a href="https://www.basketball-reference.com/about/glossary.html" target="_blank">Basketball Reference</a>.
      </DescriptionExplanation>
    </div>
  )
})

export const TeamSeasonShootingTable = observer((props: TeamSeasonShootingTableProps) => {
  const { data } = props
  const { allStats, filteredStats, filtered, allAverageStats, filteredAverageStats, players, statsByPlayer, filteredStatsByPlayer } = data

  const allStdDev = getEnhancedShootingBoxScoreStatsStdDev(allStats)
  const filteredStdDev = filtered ? getEnhancedShootingBoxScoreStatsStdDev(filteredStats) : allStdDev

  const overallRow = {
    id: 'Overall',
    all: { overall: allAverageStats, stdDev: allStdDev, stats: allStats, },
    filtered: { overall: filteredAverageStats, stdDev: filteredStdDev, stats: filteredStats },
  }

  const playerRows = players.map(player => {
    const playerStats = statsByPlayer[player.id]
    const filteredPlayerStats = filtered ? (filteredStatsByPlayer[player.id] || playerStats) : playerStats
    const playerAllStdDev = getEnhancedShootingBoxScoreStatsStdDev(playerStats.stats)
    const playerFilteredStdDev = filtered ? getEnhancedShootingBoxScoreStatsStdDev(filteredPlayerStats.stats) : playerAllStdDev
    return {
      id: player.name,
      link: routes.getPlayerRoute(player.simpleId),
      all: { overall: playerStats.shootingData, stdDev: playerAllStdDev, stats: playerStats.stats },
      filtered: { overall: filteredPlayerStats.shootingData, stdDev: playerFilteredStdDev, stats: filteredPlayerStats.stats }
    }
  })

  const rows = [overallRow].concat(playerRows)

  const content = allStats.length === 0 ? null : (
    <TeamSeasonShootingTableContent {...props} rows={rows} filtered={filtered} />
  )

  return <Container><ComponentTitle>{data.season} Team Shooting Stats</ComponentTitle>{content}</Container>
})

export default TeamSeasonShootingTable
