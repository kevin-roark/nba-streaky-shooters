import * as React from 'react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import styled from 'react-emotion'
import * as moment from 'moment'
import { GameLog } from 'nba-netdata/dist/types'
import {
  EnhancedShootingBoxScoreStats,
  combineBoxScoreStatsWithShootingData,
  getStatsDiff
} from 'nba-netdata/dist/calc'
import * as routes from '../routes'
import { DescriptionExplanation } from '../layout'
import { shootingColumns } from '../util/shooting'
import { pct } from '../util/format'
import NumberDiff from './NumberDiff'
import { Table, TableColumn } from './table/Table'

const Container = styled('div')`
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

interface SeasonShootingHoverTableData extends EnhancedShootingBoxScoreStats {
  label: string,
  diff?: boolean
}

interface SeasonShootingHoverGameProps { games: GameLog[], stats: EnhancedShootingBoxScoreStats[], dataIndex: number }

const SeasonShootingHoverGame = withRouter((props: SeasonShootingHoverGameProps & RouteComponentProps<any>) => {
  const { games, stats, dataIndex, location } = props
  const game = games[dataIndex]
  if (!game) {
    return <Container />
  }

  const { GAME_DATE: date, TEAM_ABBREVIATION: team, OPPONENT_TEAM_ABBREVIATION: otherTeam, GAME_ID: id } = game

  const fdate = moment(date).format('MM/DD/YY')
  const firstLink = <Link to={routes.getTeamGameRoute(team, id)}>{team}</Link>
  const secondLink = <Link to={routes.getTeamGameRoute(otherTeam, id)}>{otherTeam}</Link>
  const connector = game.HOME ? 'vs.' : '@'

  const playerId = routes.getPlayerId(location.pathname)
  const moreDetailLink = playerId && <Link to={routes.getPlayerGameRoute(playerId, id)}>Explore game in detail.</Link>

  const gameStats = stats[dataIndex]
  const rangeData = combineBoxScoreStatsWithShootingData(stats)
  const diffData = getStatsDiff(gameStats, rangeData)

  const data = [
    { ...gameStats, label: 'Game' },
    { ...rangeData, label: 'All' },
    { ...diffData, label: 'Diff', diff: true }
  ]

  const lc: TableColumn<SeasonShootingHoverTableData> = { Header: '', accessor: 'label', align: 'center', width: 35 }
  const dataColumns = shootingColumns
    .filter(({ key }) => !isNaN(gameStats[key]))
    .map(({ Header, key }): TableColumn<SeasonShootingHoverTableData> => {
      const f = (n: number) => pct(n, false)
      const accessor = (d: SeasonShootingHoverTableData) =>
        d.diff ? <NumberDiff diff={d[key]} formatter={f} /> : f(d[key])

      return { Header: Header + '%', id: key, accessor, width: 42 }
    })
  const columns = [lc].concat(dataColumns)

  return (
    <Container>
      <Title>{fdate} – {firstLink} {connector} {secondLink}</Title>
      <TableWrapper>
        <Table data={data} columns={columns} styles={['minimal', 'small']} />
      </TableWrapper>
      {moreDetailLink && <MoreDetailLinkWrapper>{moreDetailLink}</MoreDetailLinkWrapper>}
      <DescriptionExplanation>
        Average calculated with games shown in graph.
        Click outside modal to close.
      </DescriptionExplanation>
    </Container>
  )
})

export default SeasonShootingHoverGame
