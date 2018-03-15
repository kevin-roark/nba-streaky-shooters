import * as React from 'react'
import { observer } from 'mobx-react'
import { RouteComponentProps, Link } from 'react-router-dom'
import styled from 'react-emotion'
import { PageContainer, ContentContainer, PageTitle, hoverLinkClass } from '../layout'
import * as routes from '../routes'
import { defaultPlayer, PlayerDataProps } from '../models/playerData'
import TogglingSubMenu from '../components/TogglingSubMenu'
import PlayerSeason from '../components/PlayerSeason'
import PlayerGame from '../components/PlayerGame'

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

const containerWrap = (content: any) =>
  <PageContainer><ContentContainer>{content}</ContentContainer></PageContainer>

enum PlayerMenuItem {
  SeasonShooting = 'Season Shooting',
  GameShooting = 'Game Shooting'
}

const Player = observer((props: PlayerDataProps & { selectMenuItem: (item: PlayerMenuItem) => void }) => {
  const { player, selectMenuItem } = props
  const { playerInfo, currentTeam } = player

  if (!playerInfo || !currentTeam) {
    return containerWrap(<h1>Player Not Found. Try searching for another.</h1>)
  }

  const subMenuProps = {
    menuItems: [PlayerMenuItem.SeasonShooting, PlayerMenuItem.GameShooting],
    currentMenuItem: player.currentMenuItem,
    onSelect: selectMenuItem
  }

  const seasonShooting = player.currentMenuItem === PlayerMenuItem.SeasonShooting
  const teamRoute = seasonShooting
    ? routes.getTeamRoute(currentTeam.abbreviation)
    : routes.getTeamGameRoute(currentTeam.abbreviation, player.gameId || undefined)

  return containerWrap((
    <div>
      <TopHeader>
        <PageTitle>{player.playerName}</PageTitle>
        <CurrentTeam><Link className={hoverLinkClass} to={teamRoute}>{currentTeam.name}</Link></CurrentTeam>
        <TogglingSubMenu {...subMenuProps} />
      </TopHeader>
      {seasonShooting && <PlayerSeason data={player.seasonData} />}
      {!seasonShooting && <PlayerGame data={player.gameData} />}
    </div>
  ))
})

class PlayerRoute extends React.Component<RouteComponentProps<any>, {}> {
  componentDidMount() {
    this.updateModel()
  }

  componentDidUpdate() {
    this.updateModel()
  }

  selectMenuItem = (item: PlayerMenuItem) => {
    const { history } = this.props
    if (item === PlayerMenuItem.SeasonShooting) {
      history.push(routes.getPlayerRoute(defaultPlayer.simplePlayerId))
    } else if (item === PlayerMenuItem.GameShooting) {
      history.push(routes.getPlayerGameRoute(defaultPlayer.simplePlayerId, defaultPlayer.gameId || undefined))
    }
  }

  updateModel() {
    const { match, history, location } = this.props
    const { playerId, gameId } = match.params as { playerId?: string, gameId?: string }

    const currentMenuItem = location.pathname.includes('/game') ? PlayerMenuItem.GameShooting : PlayerMenuItem.SeasonShooting
    defaultPlayer.setCurrentMenuItem(currentMenuItem)

    if (playerId) {
      defaultPlayer.setSimpleId(playerId)
      if (gameId) {
        defaultPlayer.setGameId(gameId)
      } else if (currentMenuItem === PlayerMenuItem.GameShooting) {
        history.replace(routes.getPlayerGameRoute(playerId, defaultPlayer.mostRecentPlayerGameId))
      }
    }
  }

  render() {
    return <Player player={defaultPlayer} selectMenuItem={this.selectMenuItem} />
  }
}

export default PlayerRoute
