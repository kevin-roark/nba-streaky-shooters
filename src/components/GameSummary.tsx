import * as React from 'react'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import styled from 'react-emotion'
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
  margin: 20px 0;
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
      <GameLine>{zpad(game.awayPoints, 3)} - {zpad(game.homePoints, 3)}</GameLine>
    </Container>
  )
}

export default observer(GameSummary)
