import * as React from 'react'
import { observer } from 'mobx-react'
import { RouteComponentProps, Link } from 'react-router-dom'
import { PageContainer, ContentContainer, hoverLinkClass } from '../layout'
import * as routes from '../routes'
import { defaultPlayer, PlayerDataProps } from '../models/routeData'
import PageHeader, { PageMenuItem } from '../components/PageHeader'
import PlayerSeason from '../components/PlayerSeason'
import PlayerGame from '../components/PlayerGame'

const containerWrap = (content: any) =>
  <PageContainer><ContentContainer>{content}</ContentContainer></PageContainer>

const Player = observer((props: PlayerDataProps & { selectMenuItem: (item: PageMenuItem) => void }) => {
  const { player, selectMenuItem } = props
  const { playerInfo, currentTeam } = player

  if (!playerInfo || !currentTeam) {
    return containerWrap(<h1>Player Not Found. Try searching for another.</h1>)
  }

  const seasonShooting = player.currentMenuItem === PageMenuItem.SeasonShooting
  const teamRoute = seasonShooting
    ? routes.getTeamRoute(currentTeam.abbreviation)
    : routes.getTeamGameRoute(currentTeam.abbreviation, player.gameId || undefined)

  return containerWrap((
    <div>
      <PageHeader
        title={player.playerName}
        subtitle={<Link className={hoverLinkClass} to={teamRoute}>{currentTeam.name}</Link>}
        currentMenuItem={player.currentMenuItem}
        onMenuItemSelect={selectMenuItem}
      />
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

  selectMenuItem = (item: PageMenuItem) => {
    const { history } = this.props
    if (item === PageMenuItem.SeasonShooting) {
      history.push(routes.getPlayerRoute(defaultPlayer.simplePlayerId))
    } else if (item === PageMenuItem.GameShooting) {
      history.push(routes.getPlayerGameRoute(defaultPlayer.simplePlayerId, defaultPlayer.gameId || undefined))
    }
  }

  updateModel() {
    const { match, history, location } = this.props
    const { playerId, gameId } = match.params as { playerId?: string, gameId?: string }

    const currentMenuItem = location.pathname.includes('/game') ? PageMenuItem.GameShooting : PageMenuItem.SeasonShooting
    defaultPlayer.setCurrentMenuItem(currentMenuItem)

    if (playerId) {
      defaultPlayer.setSimpleId(playerId)
      if (gameId) {
        defaultPlayer.setGameId(gameId)
      } else if (currentMenuItem === PageMenuItem.GameShooting) {
        history.replace(routes.getPlayerGameRoute(playerId, defaultPlayer.mostRecentGameId))
      }
    }
  }

  render() {
    return <Player player={defaultPlayer} selectMenuItem={this.selectMenuItem} />
  }
}

export default PlayerRoute
