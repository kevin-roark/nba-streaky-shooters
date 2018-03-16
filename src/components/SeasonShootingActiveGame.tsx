import * as React from 'react'
import { observer } from 'mobx-react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import styled from 'react-emotion'
import {
  EnhancedShootingBoxScoreStats,
  getStatsDiff,
  mapStatsToString
} from 'nba-netdata/dist/calc'
import * as routes from '../routes'
import { SeasonDataProps } from '../models/seasonData'
import { DescriptionExplanation, secondaryContainerStyles } from '../layout'
import { shootingColumns, getStatMadeAttemptedText } from '../util/shooting'
import { pct } from '../util/format'
import NumberDiff from './NumberDiff'
import { Table, TableColumn } from './Table2'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 8px;
  display: flex;
  flex-direction: column;
`

const Title = styled('h3')`
  margin: 0;
  font-size: 16px;
  text-align: center;
`

const TableWrapper = styled('div')`
  margin: 10px 0 5px 0;
`

const MoreDetailLinkWrapper = styled('h4')`
  margin: 4px 0 0 0;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
`

interface SeasonShootingTooltipTableData extends EnhancedShootingBoxScoreStats {
  id: string,
  diff?: boolean
}

interface SeasonShootingActiveGameProps extends SeasonDataProps {}

const SeasonShootingActiveGame = observer((props: SeasonShootingActiveGameProps & RouteComponentProps<any>) => {
  const { data, location } = props
  const { activeGame, filteredAverageStats } = data
  if (!activeGame) {
    return null
  }

  const { game, stats: gameStats } = activeGame

  const diffData = getStatsDiff(gameStats, filteredAverageStats)

  const gameMadeAttempted = mapStatsToString(gameStats, (s, k: any) => (getStatMadeAttemptedText(s, k) || '-').replace(/ /g, ''))

  const rows = [
    { ...gameStats, id: 'Game %' },
    { ...gameMadeAttempted, id: 'Game #' },
    { ...filteredAverageStats, id: 'All' },
    { ...diffData, id: 'Diff', diff: true }
  ]

  const lc: TableColumn<SeasonShootingTooltipTableData> = { header: '', accessor: 'id', align: 'center', width: 48 }
  const dataColumns = shootingColumns
    .map(({ header, key }): TableColumn<SeasonShootingTooltipTableData> => {
      const f = (n: number | string) => {
        if (typeof n === 'string') {
          return n
        }
        if (isNaN(n)) {
          return '-'
        }

        return pct(n, true)
      }

      return {
        header,
        accessor: key,
        formatter: (d, v: number) => d.diff ? <NumberDiff diff={v} formatter={f} /> : f(v)
      }
    })

  const columns = [lc].concat(dataColumns)

  const { date, TEAM_ABBREVIATION: team, OPPONENT_TEAM_ABBREVIATION: otherTeam, GAME_ID: id } = game
  const fdate = date.format('MM/DD/YY')
  const firstLink = <Link to={routes.getTeamGameRoute(team, id)}>{team}</Link>
  const secondLink = <Link to={routes.getTeamGameRoute(otherTeam, id)}>{otherTeam}</Link>
  const connector = game.HOME ? 'vs.' : '@'

  const moreDetailLink = <Link to={data.getGameRoute(id)}>Explore game in detail.</Link>

  return (
    <Container>
      <Title>{fdate} – {firstLink} {connector} {secondLink}</Title>
      <TableWrapper>
        <Table rows={rows} columns={columns} styles={['minimal', 'small']} />
      </TableWrapper>
      {moreDetailLink && <MoreDetailLinkWrapper>{moreDetailLink}</MoreDetailLinkWrapper>}
      <DescriptionExplanation>
        All calculated across range of selected games.
      </DescriptionExplanation>
    </Container>
  )
})

export default withRouter(SeasonShootingActiveGame)
