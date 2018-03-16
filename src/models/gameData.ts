import { observable, action, computed, configure, runInAction, observe } from 'mobx'
import * as groupBy from 'lodash.groupby'
import * as moment from 'moment'
import { Moment } from 'moment'
import { TeamAbbreviation, ShotType } from 'nba-netdata/dist/types'
import { getGameInfo } from 'nba-netdata/dist/data'
import { PlayByPlayShotData, PlayByPlayShotDataPoint } from 'nba-netdata/dist/play-by-play'
import { calcShootingDataFromShots, EnhancedShootingStats, isShotTypeFieldGoal, getParentShotType } from 'nba-netdata/dist/calc'
import * as routes from '../routes'
import { webDataManager } from '../data'
import { PlayerData, TeamData } from './routeData'

configure({ enforceActions: true }) // don't allow state modifications outside actions

export interface Plays {
  plays: PlayByPlayShotDataPoint[],
}

export interface PlaysAndStats extends Plays {
  stats: EnhancedShootingStats
}

export interface EnhancedPlaysAndStats extends PlaysAndStats {
  shotTypeStreaks: {
    hit: {[type: string]: number},
    miss: {[type: string]: number}
  }
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

  abstract get currentPlaysAndStats(): PlaysAndStats | null
  abstract get team(): TeamAbbreviation | null
  abstract get possibleGameIds(): string[]

  @computed get game() {
    return this.gameId ? getGameInfo(this.gameId) : null
  }
  @computed get gameDate() {
    return this.game ? moment(this.game.date) : null
  }
  @computed get possibleGameDates() {
    const dateMap = new Map<string, string>()
    this.possibleGameIds.forEach(id => {
      const info = getGameInfo(id)
      if (info) {
        dateMap.set(info.date, id)
      }
    })
    return dateMap
  }
  @computed get currentGameIdIndex() {
    return this.gameId ? this.possibleGameIds.indexOf(this.gameId) : -1
  }
  @computed get canIncrementGame() {
    return this.currentGameIdIndex >= 0 && this.currentGameIdIndex < this.possibleGameIds.length - 1
  }
  @computed get nextGameId() {
    return this.canIncrementGame ? this.possibleGameIds[this.currentGameIdIndex + 1] : null
  }
  @computed get canDecrementGame() {
    return this.currentGameIdIndex > 0
  }
  @computed get prevGameId() {
    return this.canDecrementGame ? this.possibleGameIds[this.currentGameIdIndex - 1] : null
  }

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
  @computed get currentPlays() {
    return this.currentPlaysAndStats ? this.currentPlaysAndStats.plays : []
  }
  @computed get currentStats() {
    return this.currentPlaysAndStats ? this.currentPlaysAndStats.stats : null
  }
  @computed get enhancedCurrentStats() {
    return this.currentPlaysAndStats ? this.enhancePlaysAndStats(this.currentPlaysAndStats) : null
  }
  @computed get splitCurrentStats() {
    return this.currentPlaysAndStats ? this.splitPlaysAndStats(this.currentPlaysAndStats) : null
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
    await this.loadData()
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

  abstract getGameRoute(gameId: string): string

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

  splitPlaysAndStats(pns: PlaysAndStats) {
    const playsByPeriod: {[period: string]: PlayByPlayShotDataPoint[] } = {}

    const periods = ['Q1', 'Q2', 'Q3', 'Q4', 'OT']
    periods.forEach(p => playsByPeriod[p] = [])

    pns.plays.forEach(play => {
      const key = play.period > 4 ? 'OT' : `Q${play.period}`
      playsByPeriod[key].push(play)
    })

    const pnsByPeriod = periods.map(period => {
      const plays = playsByPeriod[period]
      const stats = calcShootingDataFromShots(plays)
      return { period, id: period, data: this.enhancePlaysAndStats({ plays, stats }) }
    })

    pnsByPeriod.push({ period: 'All', id: 'All', data: this.enhancePlaysAndStats(pns) })

    return pnsByPeriod
  }

  enhancePlaysAndStats(pns: PlaysAndStats): EnhancedPlaysAndStats {
    const shotTypeMaxHitStreaks: {[shotType: string]: number} = {}
    const shotTypeCurHitStreaks: {[shotType: string]: number} = {}
    const shotTypeMaxMissStreaks: {[shotType: string]: number} = {}
    const shotTypeCurMissStreaks: {[shotType: string]: number} = {}

    const update = (type: ShotType | 'fieldGoal', miss: boolean) => {
      // reset the opposite streak
      const altStreaks = miss ? shotTypeCurHitStreaks : shotTypeCurMissStreaks
      altStreaks[type] = 0

      // update the current streak
      const curStreaks = miss ? shotTypeCurMissStreaks : shotTypeCurHitStreaks
      const cur = (curStreaks[type] || 0) + 1
      curStreaks[type] = cur

      // update the max streak
      const maxStreaks = miss ? shotTypeMaxMissStreaks : shotTypeMaxHitStreaks
      const max = maxStreaks[type] || 0
      if (cur > max) {
        maxStreaks[type] = cur
      }
    }

    pns.plays.forEach(({ shotType, miss }) => {
      update(shotType, miss)

      const parentType = getParentShotType(shotType)
      if (parentType) {
        update(parentType, miss)
      }

      if (isShotTypeFieldGoal(shotType)) {
        update('fieldGoal', miss)
      }
    })

    return { ...pns, shotTypeStreaks: { hit: shotTypeMaxHitStreaks, miss: shotTypeMaxMissStreaks } }
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

  @computed get team() {
    return this.playerData.currentTeam ? this.playerData.currentTeam.abbreviation : null
  }
  @computed get possibleGameIds() {
    return this.playerData.playerGameIds
  }

  @computed get currentPlaysAndStats() {
    return this.myPlayerStats
  }
  @computed get playerId() {
    return this.playerData.playerId
  }
  @computed get myPlayerStats() {
    return this.playerId ? this.getPlayerData(this.playerId) : null
  }

  getGameRoute(gameId: string) {
    return routes.getPlayerGameRoute(this.playerData.simplePlayerId, gameId)
  }
}

export class TeamGameData extends GameData {
  @observable teamData: TeamData

  constructor(teamData: TeamData) {
    super()
    this.teamData = teamData
    observe(this.teamData, 'gameId', () => {
      const { gameId } = this.teamData
      if (gameId) {
        this.setGameId(gameId)
      }
    })
  }

  @computed get team() {
    return this.teamData.team
  }
  @computed get currentPlaysAndStats() {
    return this.myTeamStats
  }

  @computed get possibleGameIds() {
    return this.teamData.teamGameIds
  }

  @computed get myTeamStats() {
    return this.team ? this.getTeamData(this.team) : null
  }

  getGameRoute(gameId: string) {
    return this.team ? routes.getTeamGameRoute(this.team, gameId) : ''
  }
}
