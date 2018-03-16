import * as React from 'react'
import { observer } from 'mobx-react'
import { PlayerGameDataProps } from '../models/gameData'
import DataStatus from './DataStatus'
import Pane from './Pane'
import GameShotTimeMap from './GameShotTimeMap'
import GameShotPercentBarChart from './GameShotPercentBarChart'
import GameShotDistributionBarChart from './GameShotDistributionBarChart'
import MadeMissedLegend from './MadeMissedLegend'

const PlayerGame = observer(({ data }: PlayerGameDataProps) => {
  const { myPlayerStats } = data
  return (
    <div>
      <DataStatus data={data.data} loading={data.loading} loadError={data.loadError} />

      <Pane
        sideWidth={200}
        marginBottom={20}
        mainContent={<GameShotTimeMap plays={myPlayerStats ? myPlayerStats.plays : []} />}
        sideContent={<MadeMissedLegend description="Hover over shot for more info." />}
      />

      <Pane
        sideWidth={200}
        marginBottom={20}
        mainContent={<GameShotPercentBarChart stats={myPlayerStats ? myPlayerStats.stats : null} />}
        sideContent={<MadeMissedLegend description="Hover over bars for totals." />}
      />

      <GameShotDistributionBarChart stats={myPlayerStats ? myPlayerStats.stats : null} />
    </div>
  )
})

export default PlayerGame
