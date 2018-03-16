import * as React from 'react'
import { observer } from 'mobx-react'
import { PlayerGameDataProps } from '../models/gameData'
import DataStatus from './DataStatus'
import Pane from './Pane'
import GameSummary from './GameSummary'
import GameSelector from './GameSelector'
import PlayerGameShootingTable from './PlayerGameShootingTable'
import GameShotTimeMap from './GameShotTimeMap'
import GamePointsOverTimeChart from './GamePointsOverTimeChart'
import GameShotPercentBarChart from './GameShotPercentBarChart'
import GameShotDistributionBarChart from './GameShotDistributionBarChart'
import MadeMissedLegend from './MadeMissedLegend'

const PlayerGame = observer(({ data }: PlayerGameDataProps) => {
  return (
    <div>
      <DataStatus data={data.data} loading={data.loading} loadError={data.loadError} />

      <Pane
        sideWidth={200}
        centerMainContent={true}
        mainContent={<GameSummary data={data} />}
        sideContent={<GameSelector data={data} />}
      />

      <PlayerGameShootingTable data={data} />

      <Pane
        sideWidth={200}
        mainContent={<GameShotTimeMap data={data} />}
        sideContent={<MadeMissedLegend description="Hover over shot for more info." />}
      />

      <GamePointsOverTimeChart data={data} />

      <Pane
        sideWidth={200}
        mainContent={<GameShotPercentBarChart data={data} />}
        sideContent={<MadeMissedLegend description="Hover over bars for totals." />}
      />

      <GameShotDistributionBarChart data={data} />
    </div>
  )
})

export default PlayerGame
