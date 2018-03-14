import { observable, action, computed } from 'mobx'
import * as moment from 'moment'
import { Moment } from 'moment'
import { Season, GameLog } from 'nba-netdata/dist/types'

interface MomentDateRange { startDate: Moment, endDate: Moment }

export interface SeasonFilterProps {
  filterData: SeasonFilterData
}

export class SeasonFilterData {
    readonly rangeBounds = {
      startDate: moment('2017-10-17'),
      endDate: moment('2018-04-11')
    }

    @observable season: Season = '2017-18'
    @observable dateRange: MomentDateRange = { ...this.rangeBounds }
    @observable activeGameId: string | null = null

    static isWithinRange(day: Moment, range: MomentDateRange): boolean {
      return range.startDate.isSameOrBefore(day) && range.endDate.isSameOrAfter(day)
    }

    @computed get startDate() { return this.dateRange.startDate }
    @computed get endDate() { return this.dateRange.endDate }

    @action reset() {
      this.season = '2017-18'
      this.dateRange = { ...this.rangeBounds }
      this.activeGameId = null
    }

    @action setDateRange(range: MomentDateRange) {
      this.dateRange = range
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
