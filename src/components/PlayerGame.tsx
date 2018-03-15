import * as React from 'react'
import { observer } from 'mobx-react'
import { PlayerGameDataProps } from '../models/gameData'
import DataStatus from './DataStatus'
// import Pane from './Pane'
import GameShotTimeMap from './GameShotTimeMap'

const PlayerGame = observer(({ data }: PlayerGameDataProps) => {
  return (
    <div>
      <DataStatus data={data.data} loading={data.loading} loadError={data.loadError} />

      <GameShotTimeMap data={data} />
    </div>
  )
})

export default PlayerGame
