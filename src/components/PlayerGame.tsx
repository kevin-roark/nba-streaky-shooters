import * as React from 'react'
import { observer } from 'mobx-react'
import { PlayerGameDataProps } from '../models/gameData'
import DataStatus from './DataStatus'
import Pane from './Pane'
import GameShotTimeMap from './GameShotTimeMap'
import MadeMissedLegend from './MadeMissedLegend'

const PlayerGame = observer(({ data }: PlayerGameDataProps) => {
  const { myPlayerStats } = data
  return (
    <div>
      <DataStatus data={data.data} loading={data.loading} loadError={data.loadError} />

      <Pane
        sideWidth={200}
        mainContent={<GameShotTimeMap plays={myPlayerStats ? myPlayerStats.plays : []} />}
        sideContent={<MadeMissedLegend />}
      />
    </div>
  )
})

export default PlayerGame
