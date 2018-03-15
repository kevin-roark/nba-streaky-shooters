import * as React from 'react'
import { RouteComponentProps, Link } from 'react-router-dom'
import styled from 'react-emotion'
import { getPlayerWithSimpleId, getTeamWithAbbreviation } from 'nba-netdata/dist/data'
import { PageContainer, ContentContainer, PageTitle, hoverLinkClass } from '../layout'
import * as routes from '../routes'
import TogglingSubMenu from '../components/TogglingSubMenu'
import PlayerSeason from '../components/PlayerSeason'

const TopHeader = styled('div')`
  position: relative;
  max-width: 600px;
  margin: 20px auto;
  padding: 12px;
  border: 2px solid #000;
  background-color: #eee;
  text-align: center;
`

const CurrentTeam = styled('h2')`
  margin: 6px 0 10px 0;
  font-size: 20px;
  font-weight: 400;
`

interface PlayerProps extends RouteComponentProps<any> {}

const containerWrap = (content: any) =>
  <PageContainer><ContentContainer>{content}</ContentContainer></PageContainer>

const PlayerMenuItems = {
  seasonShooting: 'Season Shooting',
  gameShooting: 'Game Shooting'
}

const Player = (props: PlayerProps) => {
  const { history, match, location } = props
  const { playerId, gameId } = match.params as { playerId?: string, gameId?: string }

  const player = playerId ? getPlayerWithSimpleId(playerId) : null
  const sortedSeasons = player ? Object.keys(player.teams).sort() : []
  const mostRecentSeason = sortedSeasons.length > 0 ? sortedSeasons[sortedSeasons.length - 1] : null
  const playerTeams = player && mostRecentSeason ? player.teams[mostRecentSeason] : null
  if (!playerId || !player || !playerTeams || playerTeams.length === 0) {
    return containerWrap(<h1>Player Not Found. Try searching for another.</h1>)
  }

  const seasonShooting = !location.pathname.includes('/game')

  const subMenuProps = {
    menuItems: [PlayerMenuItems.seasonShooting, PlayerMenuItems.gameShooting],
    currentMenuItem: seasonShooting ? PlayerMenuItems.seasonShooting : PlayerMenuItems.gameShooting,
    onSelect: (item) => {
      if (item === PlayerMenuItems.seasonShooting) {
        history.push(routes.getPlayerRoute(playerId))
      } else if (item === PlayerMenuItems.gameShooting) {
        history.push(routes.getPlayerGameRoute(playerId, gameId))
      }
    }
  }

  const playerName = `${player.firstName} ${player.lastName}`
  const playerCurrentTeam = getTeamWithAbbreviation(playerTeams[playerTeams.length - 1].team)
  const teamRoute = seasonShooting
    ? routes.getTeamRoute(playerCurrentTeam.abbreviation)
    : routes.getTeamGameRoute(playerCurrentTeam.abbreviation, gameId)

  return containerWrap((
    <div>
      <TopHeader>
        <PageTitle>{playerName}</PageTitle>
        <CurrentTeam><Link className={hoverLinkClass} to={teamRoute}>{playerCurrentTeam.name}</Link></CurrentTeam>
        <TogglingSubMenu {...subMenuProps} />
      </TopHeader>
      {seasonShooting && <PlayerSeason player={player} />}
    </div>
  ))
}

export default Player
