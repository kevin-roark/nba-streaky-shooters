import { observable, action, computed, configure } from 'mobx'
import { TeamAbbreviation } from 'nba-netdata/dist/types'
import { getPlayerGameIds, getPlayerWithSimpleId, getTeamGameIds, getTeamWithAbbreviation } from 'nba-netdata/dist/data'
import { PageMenuItem } from '../components/PageHeader'
import { PlayerGameData, TeamGameData } from './gameData'
import { PlayerSeasonData, TeamSeasonData } from './seasonData'

configure({ enforceActions: true }) // don't allow state modifications outside actions

export interface PlayerDataProps {
  player: PlayerData
}

export interface TeamDataProps {
  team: TeamData
}

abstract class RouteData {
  @observable currentMenuItem: PageMenuItem = PageMenuItem.SeasonShooting
  @observable gameId: string | null = null

  @action setCurrentMenuItem(currentMenuItem: PageMenuItem) {
    if (currentMenuItem !== this.currentMenuItem) {
      this.currentMenuItem = currentMenuItem
    }
  }

  @action setGameId(gameId: string | null) {
    if (gameId === this.gameId) {
      return
    }

    this.gameId = gameId
  }
}

export class PlayerData extends RouteData {
  @observable simplePlayerId: string = ''
  @observable seasonData = new PlayerSeasonData(this)
  @observable gameData = new PlayerGameData(this)

  @computed get playerInfo() {
    return getPlayerWithSimpleId(this.simplePlayerId)
  }
  @computed get playerId() {
    return this.playerInfo ? this.playerInfo.id : null
  }
  @computed get playerName() {
    return this.playerInfo ? `${this.playerInfo.firstName} ${this.playerInfo.lastName}` : ''
  }
  @computed get playerGameIds() {
    return this.playerId ? getPlayerGameIds(this.playerId) : []
  }
  @computed get mostRecentGameId() {
    return this.playerGameIds[this.playerGameIds.length - 1]
  }
  @computed get sortedSeasons() {
    return this.playerInfo ? Object.keys(this.playerInfo.teams).sort() : []
  }
  @computed get mostRecentSeason() {
    return this.sortedSeasons.length > 0 ? this.sortedSeasons[this.sortedSeasons.length - 1] : null
  }
  @computed get currentTeam() {
    const playerTeams = this.playerInfo && this.mostRecentSeason ? this.playerInfo.teams[this.mostRecentSeason] : []
    return playerTeams.length > 0 ? getTeamWithAbbreviation(playerTeams[playerTeams.length - 1].team) : null
  }

  @action setSimpleId(simplePlayerId: string) {
    if (simplePlayerId === this.simplePlayerId) {
      return
    }

    this.simplePlayerId = simplePlayerId
  }
}

export class TeamData extends RouteData {
  @observable team: TeamAbbreviation
  @observable seasonData = new TeamSeasonData(this)
  @observable gameData = new TeamGameData(this)

  @computed get teamInfo() {
    return getTeamWithAbbreviation(this.team)
  }
  @computed get teamGameIds() {
    return getTeamGameIds(this.team)
  }
  @computed get mostRecentGameId() {
    return this.teamGameIds[this.teamGameIds.length - 1]
  }

  @action setTeam(team: TeamAbbreviation) {
    if (team === this.team) {
      return
    }

    this.team = team
  }
}

export const defaultPlayer = new PlayerData()
export const defaultTeam = new TeamData()
