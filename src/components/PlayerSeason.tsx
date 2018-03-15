import * as React from 'react'
import { observer } from 'mobx-react'
import { PlayerInfo } from 'nba-netdata/dist/types'
import { PlayerSeasonDataProps, playerSeasonData } from '../models/seasonData'
import DataStatus from './DataStatus'
import SeasonDataFilter from './SeasonDataFilter'
import SeasonShootingTable from './SeasonShootingTable'
import SeasonShootingActiveGame from './SeasonShootingActiveGame'
import SeasonShootingChart from './SeasonShootingChart'
import Pane from './Pane'

const PlayerSeasonContent = observer(({ data }: PlayerSeasonDataProps) => {
  return (
    <div>
      <DataStatus data={data.scores} loading={data.loading} loadError={data.loadError} />

      <Pane
        sideWidth={375}
        mainContent={<SeasonShootingTable data={data} />}
        sideContent={<SeasonShootingActiveGame data={data} />}
      />

      <Pane
        sideWidth={190}
        mainContent={<SeasonShootingChart data={data} />}
        sideContent={<SeasonDataFilter data={data.filterData} />}
      />
    </div>
  )
})

interface PlayerSeasonProps {
  player: PlayerInfo
}

@observer
class PlayerSeason extends React.Component<PlayerSeasonProps & PlayerSeasonDataProps, {}> {
  componentDidMount() {
    this.loadSeasonData()
  }

  componentDidUpdate(prevProps: PlayerSeasonProps) {
    if (this.props.player.id !== prevProps.player.id) {
      this.loadSeasonData()
    }
  }

  loadSeasonData() {
    this.props.data.setPlayerId(this.props.player.id)
  }

  render() {
    return <PlayerSeasonContent data={this.props.data} />
  }
}

const ConnectedPlayerSeason = (props: PlayerSeasonProps) =>
  <PlayerSeason {...props} data={playerSeasonData} />

export default ConnectedPlayerSeason
