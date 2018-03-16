import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { secondaryContainerStyles, DescriptionExplanation, sansSerif, ComponentTitle } from '../layout'
import { pct } from '../util/format'
import { gameShootingColumns, getStatTooltipText, getShotTypeAbbr, getShotHeat, getStreakHeat, getPointsHeat } from '../util/shooting'
import { TeamGameDataProps, EnhancedPlaysAndStats } from '../models/gameData'
import { Table, TableColumn, TextTooltip } from './Table2'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 0 20px 15px 20px;
  min-height: 180px;
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

interface TeamGameShootingTableData {
  id: string,
  period: string,
  data: EnhancedPlaysAndStats,
}

interface TeamGameShootingTableContentProps extends TeamGameDataProps {
  rows: TeamGameShootingTableData[]
}

const TeamGameShootingTableContent = observer(({ rows }: TeamGameShootingTableContentProps) => {
  const columns: TableColumn<TeamGameShootingTableData>[] = [
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
      heatProvider: d => getPointsHeat(d.data.stats.points, d.period === 'All' ? 125 : 35)
    },
    ...['hit', 'miss'].map(t => {
      const header = t === 'hit' ? 'FGHS' : 'FGMS'
      return {
        header, id: header,
        accessor: d => d.data.shotTypeStreaks[t].fieldGoal || '-',
        heatProvider: d => getStreakHeat(t, d.data.shotTypeStreaks[t].fieldGoal),
        headerTooltipRenderer: () => <TextTooltip>Max Field Goal {t === 'hit' ? 'Hit' : 'Miss'} Streak</TextTooltip>,
        dataTooltipRenderer: d => renderStreakDataTooltip(d.period, t, d.data.shotTypeStreaks[t])
      }
    }),
    ...gameShootingColumns.map(({ header, key, title }): TableColumn<TeamGameShootingTableData> => {
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

export const TeamGameShootingTable = observer((props: TeamGameDataProps) => {
  const { data } = props
  const { splitCurrentStats } = data

  const rows = (splitCurrentStats || [])
    .filter(r => r.period !== 'OT' || r.data.plays.length > 0)

  const content = rows.length === 0 ? null : (
    <TeamGameShootingTableContent {...props} rows={rows} />
  )

  return <Container><ComponentTitle>Overall Team Stats</ComponentTitle>{content}</Container>
})

export default TeamGameShootingTable
