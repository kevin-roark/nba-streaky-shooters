import { observable, action, computed, configure, runInAction, observe } from 'mobx'
import * as groupBy from 'lodash.groupby'
import { TeamAbbreviation } from 'nba-netdata/dist/types'
import { PlayByPlayShotData, PlayByPlayShotDataPoint } from 'nba-netdata/dist/play-by-play'
import { calcShootingDataFromShots, EnhancedShootingStats } from 'nba-netdata/dist/calc'
import { webDataManager } from '../data'
import { PlayerData } from './playerData'

configure({ enforceActions: true }) // don't allow state modifications outside actions

export interface PlaysAndStats {
  plays: PlayByPlayShotDataPoint[],
  stats: EnhancedShootingStats
}

export interface GameDataProps {
  data: GameData
}

export interface PlayerGameDataProps {
  data: PlayerGameData
}

export interface TeamGameDataProps {
  data: TeamGameData
}

abstract class GameData {
  @observable loading = false
  @observable loadError: string | null = null
  @observable gameId: string | null = null
  @observable playByPlayData: PlayByPlayShotData | null = null

  @computed get data() {
    if (!this.playByPlayData) {
      return null
    }

    const allStats = calcShootingDataFromShots(this.playByPlayData.plays)

    const teamPlays: {[team: string]: PlayByPlayShotDataPoint[]} = groupBy(this.playByPlayData.plays, p => p.team)
    const teamStats: {[team: string]: EnhancedShootingStats} = {}
    Object.keys(teamPlays).map(team => {
      teamStats[team] = calcShootingDataFromShots(teamPlays[team])
    })

    const playerPlays: {[playerId: string]: PlayByPlayShotDataPoint[]} = groupBy(this.playByPlayData.plays, p => p.playerId)
    const playerStats: {[playerId: string]: EnhancedShootingStats} = {}
    Object.keys(playerPlays).map(playerId => {
      playerStats[playerId] = calcShootingDataFromShots(playerPlays[playerId])
    })

    return { allStats, teamPlays, teamStats, playerPlays, playerStats }
  }

  @action resetData() {
    this.loading = false
    this.loadError = null
    this.playByPlayData = null
  }

  @action async setGameId(gameId: string) {
    if (gameId === this.gameId) {
      return
    }

    this.gameId = gameId
    this.loadData()
  }

  @action async loadData() {
    if (!this.gameId) {
      this.resetData()
      return
    }

    this.playByPlayData = null
    this.loading = true
    const playByPlayData = await webDataManager.fetchPlayByPlayShotData({ GameID: this.gameId })
    runInAction(() => {
      this.loading = false
      this.loadError = playByPlayData ? null : 'Error loading play by play data...'
      this.playByPlayData = playByPlayData
    })
  }

  getPlayerData(playerId: string): PlaysAndStats | null {
    if (!this.data) {
      return null
    }

    const plays = this.data.playerPlays[playerId]
    const stats = this.data.playerStats[playerId]
    return plays && stats ? { plays, stats } : null
  }

  getTeamData(team: TeamAbbreviation): PlaysAndStats | null {
    if (!this.data) {
      return null
    }

    const plays = this.data.teamPlays[team]
    const stats = this.data.teamStats[team]
    return plays && stats ? { plays, stats } : null
  }
}

export class PlayerGameData extends GameData {
  @observable playerData: PlayerData

  constructor(playerData: PlayerData) {
    super()

    this.playerData = playerData
    observe(this.playerData, 'gameId', () => {
      const { gameId } = this.playerData
      if (gameId) {
        this.setGameId(gameId)
      }
    })
  }

  @computed get playerId() {
    return this.playerData.playerId
  }
  @computed get myPlayerStats() {
    return this.playerId ? this.getPlayerData(this.playerId) : null
  }
}

export class TeamGameData extends GameData {
  @observable team: TeamAbbreviation | null = null

  @computed get myTeamStats() {
    return this.team ? this.getTeamData(this.team) : null
  }

  @action reset() {
    super.resetData()
    this.team = null
  }

  @action async setTeam(team: TeamAbbreviation) {
    if (team === this.team) {
      return
    }

    this.team = team
  }
}
