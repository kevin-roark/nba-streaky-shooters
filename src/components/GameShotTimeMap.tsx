import * as React from 'react'
import { observer } from 'mobx-react'
import { GameDataProps } from '../models/gameData'
import { BaseChartContainer } from '../layout'
import Legend from './Legend'
import Pane from './Pane'

interface GameShotTimeMapProps extends GameDataProps {

}

const GameShotTimeMapLegend = () => (
  <Legend
    items={[{ label: 'Made', color: '#00f' }, { label: 'Missed', color: '#f00' }]}
  />
)

const GameShotTimeMapChart = observer((props: GameShotTimeMapProps) => {
  return (
    <BaseChartContainer>
      Hello!
    </BaseChartContainer>
  )
})

const GameShotTimeMap = (props: GameShotTimeMapProps) => (
  <Pane
    sideWidth={200}
    mainContent={<GameShotTimeMapChart {...props} />}
    sideContent={<GameShotTimeMapLegend />}
  />
)

export default observer(GameShotTimeMap)
