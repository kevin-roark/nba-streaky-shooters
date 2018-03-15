import { observable, action, computed, configure, runInAction, observe } from 'mobx'
import { TeamAbbreviation, PlayerBoxScores, BoxScore } from 'nba-netdata/dist/types'
import { calcEnhancedGameStats, calcEnhancedTeamGameStats, combineBoxScoreStatsWithShootingData, EnhancedGameStats } from 'nba-netdata/dist/calc'
import { webDataManager } from '../data'
import { SeasonFilterData } from './seasonFilterData'

configure({ enforceActions: true }) // don't allow state modifications outside actions

const defaultSeasonFitlerData = new SeasonFilterData()

export interface SeasonDataProps {
  data: SeasonData
}

export interface PlayerSeasonDataProps {
  data: PlayerSeasonData
}

export interface TeamSeasonDataProps {
  data: TeamSeasonData
}

abstract class SeasonData {
  @observable filterData = defaultSeasonFitlerData
  @observable loading = false
  @observable loadError: string | null = null

  constructor() {
    observe(this.filterData, 'season', change => {
      this.loadData()
    })
  }

  abstract get enhancedBoxScores(): EnhancedGameStats[]

  @computed get season() { return this.filterData.season }
  @computed get allGames() {
    return this.enhancedBoxScores.map(b => b.game)
  }
  @computed get allGameDates() {
    return this.allGames.map(game => game.date)
  }
  @computed get allStats() {
    return this.enhancedBoxScores.map(b => b.stats)
  }
  @computed get filteredScores() {
    return this.filterData.filterStats(this.enhancedBoxScores)
  }
  @computed get filteredGames() {
    return this.filteredScores.map(b => b.game)
  }
  @computed get filteredStats() {
    return this.filteredScores.map(s => s.stats)
  }
  @computed get filtered() {
    return this.allStats.length !== this.filteredStats.length
  }
  @computed get allAverageStats() {
    return combineBoxScoreStatsWithShootingData(this.allStats)
  }
  @computed get filteredAverageStats() {
    return this.filtered ? combineBoxScoreStatsWithShootingData(this.filteredStats) : this.allAverageStats
  }
  @computed get activeGameAllIndex() {
    const { activeGameId } = this.filterData
    return this.allGames.findIndex(game => game.GAME_ID === activeGameId)
  }
  @computed get activeGameFilteredIndex() {
    const { activeGameId } = this.filterData
    return this.filteredGames.findIndex(game => game.GAME_ID === activeGameId)
  }
  @computed get activeGame() {
    const index = this.activeGameFilteredIndex
    return index < 0 ? null : this.filteredScores[index]
  }
  @computed get activeGameTime() {
    return this.activeGame ? this.activeGame.game.date.valueOf() : -1
  }

  @action reset() {
    this.loading = false
    this.loadError = null
    this.filterData.reset()
  }

  abstract async loadData()
}

export class PlayerSeasonData extends SeasonData {
  @observable playerId: string | null = null
  @observable scores: PlayerBoxScores | null = null

  @computed get enhancedBoxScores() {
    return (this.scores ? this.scores.scores : []).map(calcEnhancedGameStats)
  }

  @action reset() {
    super.reset()
    this.playerId = null
  }

  @action async setPlayerId(playerId: string) {
    if (playerId === this.playerId) {
      return
    }

    this.playerId = playerId
    this.loadData()
  }

  @action async loadData() {
    if (!this.playerId) {
      this.scores = null
      this.loading = false
      this.loadError = null
      return
    }

    this.scores = null
    this.loading = true
    const scores = await webDataManager.loadPlayerBoxScores(this.playerId, this.season)
    runInAction(() => {
      this.loading = false
      this.loadError = scores ? null : 'Error loading player box scores...'
      this.scores = scores
      this.filterData.setActiveGameId(scores ? scores.scores[0].game.GAME_ID : null)
    })
  }
}

export class TeamSeasonData extends SeasonData {
  @observable team: TeamAbbreviation | null = null
  @observable scores: BoxScore[] | null = null

  @computed get enhancedBoxScores() {
    return (this.scores || []).map(calcEnhancedTeamGameStats)
  }

  @action reset() {
    super.reset()
    this.team = null
  }

  @action async setTeam(team: TeamAbbreviation) {
    if (team === this.team) {
      return
    }

    this.team = team
    this.loadData()
  }

  @action async loadData() {
    if (!this.team || !this.season) {
      this.scores = null
      this.loading = false
      this.loadError = null
      return
    }

    this.scores = null
    this.loading = true
    const scores = await webDataManager.loadTeamBoxScores(this.season, this.team)
    runInAction(() => {
      this.loading = false
      this.loadError = this.scores ? null : 'Error loading team box scores...'
      this.scores = scores
      this.filterData.setActiveGameId(scores ? scores[0].game.GAME_ID : null)
    })
  }
}

export const playerSeasonData = new PlayerSeasonData()
export const teamSeasonData = new TeamSeasonData()
