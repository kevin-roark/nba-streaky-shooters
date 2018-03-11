import * as React from 'react'
import { RouteComponentProps, Link } from 'react-router-dom'
import styled from 'react-emotion'
import { getPlayerWithSimpleId, getTeamWithAbbreviation } from 'nba-netdata/dist/data'
import { PageContainer, ContentContainer, PageTitle } from '../layout'
import * as routes from '../routes'
import TogglingSubMenu from '../components/TogglingSubMenu'
import PlayerSeason from '../components/PlayerSeason'

const TopHeader = styled('div')`
  margin: 25px 0;
  padding: 12px 12px 16px 12px;
  border: 2px solid #000;
  background-color: #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TopHeaderSection = styled('div')``

const CurrentTeam = styled('h2')`
  font-size: 24px;
`

interface PlayerProps extends RouteComponentProps<any> {

}

const containerWrap = (content: any) =>
  <PageContainer><ContentContainer>{content}</ContentContainer></PageContainer>

const PlayerMenuItems = {
  acrossSeason: 'Across Season',
  withinGame: 'Within Game'
}

const Player = (props: PlayerProps) => {
  const { history, match, location } = props
  const { playerId, gameId } = match.params as { playerId?: string, gameId?: string }
  const { season } = routes.parseQueryParams(location.search)

  const player = playerId ? getPlayerWithSimpleId(playerId) : null
  const playerTeams = player ? player.teams[season] : null
  if (!playerId || !player || !playerTeams || playerTeams.length === 0) {
    return containerWrap(<h1>Player Not Found. Try searching for another.</h1>)
  }

  const acrossSeason = !location.pathname.includes('/game')

  const subMenuProps = {
    menuItems: [PlayerMenuItems.acrossSeason, PlayerMenuItems.withinGame],
    currentMenuItem: acrossSeason ? PlayerMenuItems.acrossSeason : PlayerMenuItems.withinGame,
    onSelect: (item) => {
      if (item === PlayerMenuItems.acrossSeason) {
        history.push(routes.getPlayerRoute(playerId))
      } else if (item === PlayerMenuItems.withinGame) {
        history.push(routes.getPlayerGameRoute(playerId, gameId))
      }
    }
  }

  const playerName = `${player.firstName} ${player.lastName}`
  const playerCurrentTeam = getTeamWithAbbreviation(playerTeams[playerTeams.length - 1].team)
  const teamRoute = acrossSeason
    ? routes.getTeamRoute(playerCurrentTeam.abbreviation)
    : routes.getTeamGameRoute(playerCurrentTeam.abbreviation, gameId)

  return containerWrap((
    <div>
      <TopHeader>
        <TopHeaderSection>
          <PageTitle>{playerName}</PageTitle>
          <CurrentTeam><Link to={teamRoute}>{playerCurrentTeam.name}</Link></CurrentTeam>
        </TopHeaderSection>
        <TopHeaderSection>
          <TogglingSubMenu {...subMenuProps} />
        </TopHeaderSection>
      </TopHeader>
      {acrossSeason && <PlayerSeason player={player} season={season} />}
    </div>
  ))
}

export default Player
