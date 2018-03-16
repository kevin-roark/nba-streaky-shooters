import * as React from 'react'
import { observer } from 'mobx-react'
import { RouteComponentProps } from 'react-router-dom'
import { TeamAbbreviation } from 'nba-netdata/dist/types'
import { PageContainer, ContentContainer } from '../layout'
import * as routes from '../routes'
import { defaultTeam, TeamDataProps } from '../models/routeData'
import PageHeader, { PageMenuItem } from '../components/PageHeader'
import TeamSeason from '../components/TeamSeason'
import TeamGame from '../components/TeamGame'

const containerWrap = (content: any) =>
  <PageContainer><ContentContainer>{content}</ContentContainer></PageContainer>

const Team = observer((props: TeamDataProps & { selectMenuItem: (item: PageMenuItem) => void }) => {
  const { team, selectMenuItem } = props
  const { teamInfo } = team

  if (!teamInfo) {
    return containerWrap(<h1>Team Not Found. Try searching for another.</h1>)
  }

  const seasonShooting = team.currentMenuItem === PageMenuItem.SeasonShooting

  return containerWrap((
    <div>
      <PageHeader
        title={team.teamInfo.name}
        currentMenuItem={team.currentMenuItem}
        onMenuItemSelect={selectMenuItem}
      />
      {seasonShooting && <TeamSeason data={team.seasonData} />}
      {!seasonShooting && <TeamGame data={team.gameData} />}
    </div>
  ))
})

class TeamRoute extends React.Component<RouteComponentProps<any>, {}> {
  componentDidMount() {
    this.updateModel()
  }

  componentDidUpdate() {
    this.updateModel()
  }

  selectMenuItem = (item: PageMenuItem) => {
    const { history } = this.props
    if (item === PageMenuItem.SeasonShooting) {
      history.push(routes.getTeamRoute(defaultTeam.team))
    } else if (item === PageMenuItem.GameShooting) {
      history.push(routes.getTeamGameRoute(defaultTeam.team, defaultTeam.gameId || undefined))
    }
  }

  updateModel() {
    const { match, history, location } = this.props
    const { teamAbbreviation, gameId } = match.params as { teamAbbreviation?: TeamAbbreviation, gameId?: string }

    const currentMenuItem = location.pathname.includes('/game') ? PageMenuItem.GameShooting : PageMenuItem.SeasonShooting
    defaultTeam.setCurrentMenuItem(currentMenuItem)

    if (teamAbbreviation) {
      defaultTeam.setTeam(teamAbbreviation)
      if (gameId) {
        defaultTeam.setGameId(gameId)
      } else if (currentMenuItem === PageMenuItem.GameShooting) {
        history.replace(routes.getTeamGameRoute(teamAbbreviation, defaultTeam.mostRecentGameId))
      }
    }
  }

  render() {
    return <Team team={defaultTeam} selectMenuItem={this.selectMenuItem} />
  }
}

export default TeamRoute
