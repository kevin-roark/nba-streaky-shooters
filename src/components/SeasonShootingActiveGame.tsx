import * as React from 'react'
import { observer } from 'mobx-react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import styled from 'react-emotion'
import * as moment from 'moment'
import {
  EnhancedShootingBoxScoreStats,
  getStatsDiff,
  mapStatsToString
} from 'nba-netdata/dist/calc'
import * as routes from '../routes'
import { PlayerSeasonDataProps } from '../models/seasonData'
import { DescriptionExplanation, secondaryContainerStyles } from '../layout'
import { shootingColumns, getStatMadeAttemptedText } from '../util/shooting'
import { pct } from '../util/format'
import NumberDiff from './NumberDiff'
import { Table, TableColumn } from './table/Table'

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
  margin: 15px auto 0 auto;
`

const MoreDetailLinkWrapper = styled('h4')`
  margin: 10px 0 2px 0;
  font-size: 12px;
  text-align: center;
`

interface SeasonShootingTooltipTableData extends EnhancedShootingBoxScoreStats {
  label: string,
  diff?: boolean
}

interface SeasonShootingActiveGameProps extends PlayerSeasonDataProps {}

const SeasonShootingActiveGame = observer((props: SeasonShootingActiveGameProps & RouteComponentProps<any>) => {
  const { data, location } = props
  const { activeGame, filteredAverageStats } = data
  if (!activeGame) {
    return null
  }

  const { game, stats: gameStats } = activeGame

  const notNaNColumns = shootingColumns
    .filter(({ key }) => !isNaN(gameStats[key]))
  if (notNaNColumns.length === 0) {
    return null
  }

  const diffData = getStatsDiff(gameStats, filteredAverageStats)

  const gameMadeAttempted = mapStatsToString(gameStats, (s, k: any) => getStatMadeAttemptedText(s, k) || '-')

  const tableData = [
    { ...gameStats, label: 'Game %' },
    { ...gameMadeAttempted, label: 'Game #' },
    { ...filteredAverageStats, label: 'All' },
    { ...diffData, label: 'Diff', diff: true }
  ]

  const lc: TableColumn<SeasonShootingTooltipTableData> = { Header: '', accessor: 'label', align: 'center', width: 45 }
  const dataColumns = shootingColumns
    .map(({ Header, key }): TableColumn<SeasonShootingTooltipTableData> => {
      const f = (n: number | string) => {
        if (typeof n === 'string') {
          return n
        }
        if (isNaN(n)) {
          return '-'
        }

        return pct(n, true)
      }

      const accessor = (d: SeasonShootingTooltipTableData) =>
        d.diff ? <NumberDiff diff={d[key]} formatter={f} /> : f(d[key])

      return { Header: Header, id: key, accessor, width: 50 }
    })

  const columns = [lc].concat(dataColumns)

  const { GAME_DATE: date, TEAM_ABBREVIATION: team, OPPONENT_TEAM_ABBREVIATION: otherTeam, GAME_ID: id } = game
  const fdate = moment(date).format('MM/DD/YY')
  const firstLink = <Link to={routes.getTeamGameRoute(team, id)}>{team}</Link>
  const secondLink = <Link to={routes.getTeamGameRoute(otherTeam, id)}>{otherTeam}</Link>
  const connector = game.HOME ? 'vs.' : '@'

  const playerId = routes.getPlayerId(location.pathname)
  const moreDetailLink = playerId && <Link to={routes.getPlayerGameRoute(playerId, id)}>Explore game in detail.</Link>

  return (
    <Container>
      <Title>{fdate} – {firstLink} {connector} {secondLink}</Title>
      <TableWrapper>
        <Table data={tableData} columns={columns} styles={['minimal', 'small']} />
      </TableWrapper>
      {moreDetailLink && <MoreDetailLinkWrapper>{moreDetailLink}</MoreDetailLinkWrapper>}
      <DescriptionExplanation>
        All calculated with games shown in graph.
      </DescriptionExplanation>
    </Container>
  )
})

export default withRouter(SeasonShootingActiveGame)
