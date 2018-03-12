import { observable, action, computed } from 'mobx'
import * as moment from 'moment'
import { Moment } from 'moment'
import { GameStats } from 'nba-netdata/dist/types'

interface MomentDateRange { startDate: Moment, endDate: Moment }

export class SeasonFilterData {
    readonly rangeBounds = {
      startDate: moment('2017-10-17'),
      endDate: moment('2018-04-11')
    }

    @observable dateRange: MomentDateRange = { ...this.rangeBounds }

    static isWithinRange(day: Moment, range: MomentDateRange): boolean {
      return range.startDate.isSameOrBefore(day) && range.endDate.isSameOrAfter(day)
    }

    @computed get startDate() { return this.dateRange.startDate }
    @computed get endDate() { return this.dateRange.endDate }

    @action setDateRange(range: MomentDateRange) {
      this.dateRange = range
    }

    isWithinBounds(day: Moment) {
      return SeasonFilterData.isWithinRange(day, this.rangeBounds)
    }

    isWithinCurrentRange(day: Moment) {
      return SeasonFilterData.isWithinRange(day, this.dateRange)
    }

    filterStats(stats: GameStats[]) {
      return stats.filter(({ game }) => {
        const d = moment(game.GAME_DATE)
        if (!this.isWithinCurrentRange(d)) {
          return false
        }

        return true
      })
    }
}

const store = new SeasonFilterData()
export default store
