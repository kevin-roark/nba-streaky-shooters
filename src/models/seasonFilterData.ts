import { observable, action, computed } from 'mobx'
import * as moment from 'moment'
import { Moment } from 'moment'
import { Season, GameLog } from 'nba-netdata/dist/types'
import { boxScoreSeasons, getSeasonInfo } from 'nba-netdata/dist/data'
import defaultShootinFilterData from './shootingFilterData'

interface MomentDateRange { startDate: Moment, endDate: Moment }

export interface SeasonFilterProps {
  filterData: SeasonFilterData
}

export class SeasonFilterData {
    static allSeasons = boxScoreSeasons

    @observable season: Season | null = '2017-18'
    @observable dateRange: MomentDateRange = { ...this.rangeBounds }
    @observable activeGameId: string | null = null
    @observable shootingFilter = defaultShootinFilterData

    static isWithinRange(day: Moment, range: MomentDateRange): boolean {
      return range.startDate.isSameOrBefore(day) && range.endDate.isSameOrAfter(day)
    }

    @computed get rangeBounds() {
      if (!this.season) {
        const firstSeasonInfo = getSeasonInfo(boxScoreSeasons[boxScoreSeasons.length - 1])
        const lastSeasonInfo = getSeasonInfo(boxScoreSeasons[0])
        return { startDate: moment(firstSeasonInfo.startDate), endDate: moment(lastSeasonInfo.endDate) }
      }

      const seasonInfo = getSeasonInfo(this.season)
      return { startDate: moment(seasonInfo.startDate), endDate: moment(seasonInfo.endDate) }
    }
    @computed get startDate() { return this.dateRange.startDate }
    @computed get endDate() { return this.dateRange.endDate }
    @computed get timeRange() {
      return [this.dateRange.startDate.valueOf(), this.dateRange.endDate.valueOf()]
    }
    @computed get dirtyDates() {
      return this.startDate.valueOf() !== this.rangeBounds.startDate.valueOf()
        && this.endDate.valueOf() !== this.rangeBounds.endDate.valueOf()
    }

    @action reset() {
      this.setSeason('2017-18')
      this.activeGameId = null
    }

    @action setSeason(season: Season | null) {
      this.season = season
      this.setDateRange(this.rangeBounds)
    }

    @action setDateRange(range: MomentDateRange) {
      const startDate = range.startDate.valueOf() < this.rangeBounds.startDate.valueOf() ? this.rangeBounds.startDate : range.startDate
      const endDate = range.endDate.valueOf() > this.rangeBounds.endDate.valueOf() ? this.rangeBounds.endDate : range.endDate
      this.dateRange = { startDate, endDate }
    }

    @action setDateRangeFromTimes(t1: number, t2: number) {
      this.setDateRange({ startDate: moment(t1), endDate: moment(t2) })
    }

    @action resetDateRange() {
      this.setDateRange({ ... this.rangeBounds })
    }

    @action setActiveGameId(gameId: string | null) {
      this.activeGameId = gameId
    }

    @action clearActiveGameId() {
      this.setActiveGameId(null)
    }

    isWithinBounds(day: Moment) {
      return SeasonFilterData.isWithinRange(day, this.rangeBounds)
    }

    isWithinCurrentRange(day: Moment) {
      return SeasonFilterData.isWithinRange(day, this.dateRange)
    }

    filterStats<T extends { game: GameLog }>(stats: T[]): T[] {
      return stats.filter(({ game }) => {
        const d = moment(game.GAME_DATE)
        if (!this.isWithinCurrentRange(d)) {
          return false
        }

        return true
      })
    }
}

export default SeasonFilterData
