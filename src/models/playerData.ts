import { observable, action, computed, configure } from 'mobx'
import { getPlayerGameIds, getPlayerWithSimpleId, getTeamWithAbbreviation } from 'nba-netdata/dist/data'
import { PlayerGameData } from './gameData'
import { PlayerSeasonData } from './seasonData'

configure({ enforceActions: true }) // don't allow state modifications outside actions

export enum PlayerMenuItem {
  SeasonShooting = 'Season Shooting',
  GameShooting = 'Game Shooting'
}

export interface PlayerDataProps {
  player: PlayerData
}

export class PlayerData {
  @observable currentMenuItem: PlayerMenuItem = PlayerMenuItem.SeasonShooting
  @observable simplePlayerId: string = ''
  @observable gameId: string | null = null
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
  @computed get mostRecentPlayerGameId() {
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

  @action setCurrentMenuItem(currentMenuItem: PlayerMenuItem) {
    if (currentMenuItem !== this.currentMenuItem) {
      this.currentMenuItem = currentMenuItem
    }
  }

  @action setSimpleId(simplePlayerId: string) {
    if (simplePlayerId === this.simplePlayerId) {
      return
    }

    this.simplePlayerId = simplePlayerId
  }

  @action setGameId(gameId: string | null) {
    if (gameId === this.gameId) {
      return
    }

    this.gameId = gameId
  }
}

export const defaultPlayer = new PlayerData()

export default defaultPlayer
