import * as React from 'react'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import styled from 'react-emotion'
import * as cx from 'classnames'
import * as routes from '../routes'
import { GameDataProps } from '../models/gameData'
import { monospace } from '../layout'
import { zpad } from '../util/format'

const Container = styled('div')`
  text-align: center;
`

const GameLine = styled('div')`
  font-family: ${monospace};
  font-size: 36px;
  line-height: 1;

  &:not(:last-child) {
    margin-bottom: 20px;
  }
`

const Score = styled('span')`
  color: #f00;

  &.winner {
    color: #00f;
  }
`

const GameSummary = ({ data: { game, team } }: GameDataProps) => {
  if (!game) {
    return <Container><GameLine>-</GameLine></Container>
  }

  let matchup = [game.home, game.away]
  let points = [game.homePoints, game.awayPoints]
  if (team !== game.home) {
    matchup = [game.away, game.home]
    points = [game.awayPoints, game.homePoints]
  }

  return (
    <Container>
      <GameLine>{game.date}</GameLine>
      <GameLine>
        <Link to={routes.getTeamGameRoute(matchup[0], game.id)}>{matchup[0]}</Link>
        {team === game.home ? ' v ' : ' @ '}
        <Link to={routes.getTeamGameRoute(matchup[1], game.id)}>{matchup[1]}</Link>
      </GameLine>
      <GameLine>
        <Score className={cx({ winner: points[0] > points[1] })}>{zpad(points[0], 3)}</Score>{` - `}
        <Score className={cx({ winner: points[1] > points[0] })}>{zpad(points[1], 3)}</Score>
      </GameLine>
    </Container>
  )
}

export default observer(GameSummary)
