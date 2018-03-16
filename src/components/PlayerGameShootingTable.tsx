import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import {
  EnhancedShootingBoxScoreStats,
  getEnhancedShootingBoxScoreStatsStdDev,
  getEnhancedShootingBoxScoreStatsIQR
} from 'nba-netdata/dist/calc'
import { secondaryContainerStyles, DescriptionExplanation, serif, sansSerif } from '../layout'
import { pct } from '../util/format'
import { gameShootingColumns, getStatTooltipText, getShotTypeAbbr, getShotHeat } from '../util/shooting'
import { PlayerGameDataProps, EnhancedPlaysAndStats } from '../models/gameData'
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

const StreakTooltipTitle = styled('div')`
  margin-bottom: 5px;
  font-size: 14px;
  font-family: ${sansSerif};
`

const StreakValTooltipItem = styled('div')`
  text-align: right;
`

const renderStreakDataTooltip = (period: string, sType: string, streaks: {[k: string]: number}) => {
  const types = Object.keys(streaks)
  if (types.length === 0) {
    return null
  }

  types.sort((a, b) => streaks[b] - streaks[a] || a.localeCompare(b))

  return (
    <div>
      <StreakTooltipTitle>{period} max {sType} streaks</StreakTooltipTitle>
      {types.map(t => (
        <StreakValTooltipItem key={t}>{getShotTypeAbbr(t as any)}: {streaks[t]}</StreakValTooltipItem>
      ))}
    </div>
  )
}

const getStreakHeat = (streak: number) => {
  if (streak === 0) {
    return 0
  } else if (streak === 1) {
    return 0.5
  }

  const maxStreak = 6
  return Math.min(1, 0.5 + (streak - 2) / (maxStreak - 2) * 0.5)
}

export const getPointsHeat = (points: number, max: number = 10) => {
  return points / max
}

const getPeriodTooltipText = (period: string): string => {
  switch (period) {
    case 'Q1':
      return 'First Quarter Shots'
    case 'Q2':
      return 'Second Quarter Shots'
    case 'Q3':
      return 'Third Quarter Shots'
    case 'Q4':
      return 'Fourth Quarter Shots'
    case 'OT':
      return 'Overtime Shots'
    case 'All':
    default:
      return 'All Shots'
  }
}

interface PlayerGameShootingTableData {
  id: string,
  period: string,
  data: EnhancedPlaysAndStats,
}

interface PlayerGameShootingTableContentProps extends PlayerGameDataProps {
  rows: PlayerGameShootingTableData[]
}

const PlayerGameShootingTableContent = observer(({ rows }: PlayerGameShootingTableContentProps) => {
  const columns: TableColumn<PlayerGameShootingTableData>[] = [
    {
      header: '',
      accessor: 'period',
      align: 'center',
      width: 60,
      dataTooltipRenderer: d => <TextTooltip>{getPeriodTooltipText(d.period)}</TextTooltip>
    },
    {
      header: 'PTS',
      id: 'points',
      accessor: d => d.data.stats.points,
      dataTooltipRenderer: d => getStatTooltipText(d.data.stats, 'points'),
      heatProvider: d => getPointsHeat(d.data.stats.points, d.period === 'All' ? 35 : 10)
    },
    ...['hit', 'miss'].map(t => {
      const header = t === 'hit' ? 'FGHS' : 'FGMS'
      return {
        header, id: header,
        accessor: d => d.data.shotTypeStreaks[t].fieldGoal || '-',
        heatProvider: d => getStreakHeat(d.data.shotTypeStreaks[t].fieldGoal),
        headerTooltipRenderer: () => <TextTooltip>Max Field Goal {t === 'hit' ? 'Hit' : 'Miss'} Streak</TextTooltip>,
        dataTooltipRenderer: d => renderStreakDataTooltip(d.period, t, d.data.shotTypeStreaks[t])
      }
    }),
    ...gameShootingColumns.map(({ header, key, title }): TableColumn<PlayerGameShootingTableData> => {
      const accessor = d => d.data.stats[key]
      return {
        header, id: key, accessor,
        heatProvider: d => getShotHeat(key, accessor(d)),
        formatter: (d, v: number) => isNaN(v) ? '-' : pct(v),
        headerTooltipRenderer: () => <TextTooltip>{title}</TextTooltip>,
        dataTooltipRenderer: d => getStatTooltipText(d.data.stats, key)
      }
    })
  ]

  return (
    <div>
      <Table rows={rows} columns={columns} sortable={true} highlight={false} />
      <DescriptionExplanation>
        Hover over cells for more info.
        Heat colors based on difference from league average in category.
        Stat calculations taken from {' '}
        <a href="https://www.basketball-reference.com/about/glossary.html" target="_blank">Basketball Reference</a>.
        Shot Type categorization inspired by {' '}
        <a href="https://cleaningtheglass.com/" target="_blank">Cleaning the Glass</a>.
      </DescriptionExplanation>
    </div>
  )
})

export const PlayerGameShootingTable = observer((props: PlayerGameDataProps) => {
  const { data } = props
  const { splitCurrentStats } = data

  const rows = (splitCurrentStats || [])
    .filter(r => r.period !== 'OT' || r.data.plays.length > 0)

  const content = rows.length === 0 ? null : (
    <PlayerGameShootingTableContent {...props} rows={rows} />
  )

  return <Container>{content}</Container>
})

export default PlayerGameShootingTable
