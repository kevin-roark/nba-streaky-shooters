import { observable, action, computed } from 'mobx'
import { TeamAbbreviation, Season, PlayerBoxScores, BoxScore } from 'nba-netdata/dist/types'
import { calcShootingDataFromBoxScoreStats, combineBoxScoreStatsWithShootingData } from 'nba-netdata/dist/calc'
import { webDataManager } from '../data'
import { SeasonFilterData } from './seasonFilterData'

const defaultSeasonFitlerData = new SeasonFilterData()

class SeasonData {
  @observable filterData = defaultSeasonFitlerData
  @observable season: Season = '2017-18'
  @observable loading = false
  @observable loadError: string | null = null

  @action reset() {
    this.loading = false
    this.loadError = null
    this.season = '2017-18'
    this.filterData.reset()
  }
}

export interface PlayerSeasonDataProps {
  data: PlayerSeasonData
}

export class PlayerSeasonData extends SeasonData {
  @observable playerId: string | null = null
  @observable scores: PlayerBoxScores | null

  @computed get enhancedBoxScores() {
    const scores = this.scores ? this.scores.scores : []
    return scores.map(b => ({
      game: b.game,
      stats: calcShootingDataFromBoxScoreStats(b.stats)
    }))
  }
  @computed get allGames() {
    return this.enhancedBoxScores.map(b => b.game)
  }
  @computed get allStats() {
    return this.enhancedBoxScores.map(b => b.stats)
  }
  @computed get filteredScores() {
    return this.filterData.filterStats(this.enhancedBoxScores)
  }
  @computed get filteredGames() {
    return this.filteredScores.map(s => s.game)
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

  @action reset() {
    super.reset()
    this.scores = null
    this.playerId = null
  }

  @action async loadData(playerId: string, season: Season) {
    if ((!playerId || playerId === this.playerId) && season === this.filterData.season) {
      return
    }

    this.playerId = playerId
    this.season = season
    this.loading = true
    this.scores = await webDataManager.loadPlayerBoxScores(playerId, season)
    this.loading = false
    this.loadError = this.scores ? null : 'Error loading player box scores...'
  }

  @action setPlayerId(playerId: string) {
    this.loadData(playerId, this.season)
  }
}

export const playerSeasonData = new PlayerSeasonData()

export interface TeamSeasonDataProps {
  data: TeamSeasonData
}

export class TeamSeasonData extends SeasonData {
  @observable team: TeamAbbreviation | null = null
  @observable scores: BoxScore[] | null

  @action reset() {
    super.reset()
    this.scores = null
    this.team = null
  }

  @action async loadData(team: TeamAbbreviation, season: Season) {
    if ((!team || team === this.team) && season === this.season) {
      return
    }

    this.team = team
    this.season = season
    this.loading = true
    this.scores = await webDataManager.loadTeamBoxScores(season, team)
    this.loading = false
    this.loadError = this.scores ? null : 'Error loading team box scores...'
  }

  @action setTeam(team: TeamAbbreviation) {
    this.loadData(team, this.season)
  }
}

export const teamSeasonData = new TeamSeasonData()
