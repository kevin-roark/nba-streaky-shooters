import { observable, action, computed } from 'mobx'
import { ShootingStat } from 'nba-netdata/dist/calc'

export interface ShootingFilterDataProps {
  shootingFilterData: ShootingFilterData
}

export class ShootingFilterData {
    @observable shootingStatsEnabled = {
      effectiveFieldGoalPercentage: true,
      trueShootingPercentage: false,
      fieldGoalPercentage: false,
      twoPointPercentage: true,
      threePointPercentage: true,
      freeThrowPercentage: false,
      rimPercentage: false,
      shortMidRangePercentage: false,
      longMidRangePercentage: false
    }

    @computed get statKeys() { return Object.keys(this.shootingStatsEnabled) as ShootingStat[] }
    @computed get efg() { return this.shootingStatsEnabled.effectiveFieldGoalPercentage }
    @computed get tsp() { return this.shootingStatsEnabled.trueShootingPercentage }
    @computed get fgp() { return this.shootingStatsEnabled.fieldGoalPercentage }
    @computed get twoPP() { return this.shootingStatsEnabled.twoPointPercentage }
    @computed get threePP() { return this.shootingStatsEnabled.threePointPercentage }
    @computed get ftp() { return this.shootingStatsEnabled.freeThrowPercentage }

    @computed get enabledStats(): ShootingStat[] {
      return this.statKeys.filter(k => this.getStatEnabled(k))
    }

    getStatEnabled(stat: ShootingStat) {
      return this.shootingStatsEnabled[stat]
    }

    @action setStatEnabled(stat: ShootingStat, enabled: boolean) {
      this.shootingStatsEnabled[stat] = enabled
    }

    @action toggleStatEnabled(stat: ShootingStat) {
      this.setStatEnabled(stat, !this.getStatEnabled(stat))
    }

    @action setAllStatsEnabled (enabled: boolean) {
      this.statKeys.forEach(key => {
        this.shootingStatsEnabled[key] = enabled
      })
    }
}

const store = new ShootingFilterData()
export default store
