import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { css } from 'emotion'
import { PlayerInfo } from 'nba-netdata/dist/types'
import { PlayerSeasonDataProps, playerSeasonData } from '../models/seasonData'
import DataStatus from './DataStatus'
import SeasonDataFilter from './SeasonDataFilter'
import SeasonShootingTable from './SeasonShootingTable'
import SeasonShootingActiveGame from './SeasonShootingActiveGame'
import SeasonShootingChart from './SeasonShootingChart'

const Container = styled('div')``

const contentWrapper = css`
  margin-right: 20px;
`

const rowContainer = css`
  display: flex;
  align-items: flex-start;
`

const FirstRowContainer = styled('div')`
  ${rowContainer};
  margin-bottom: 20px;
`

const TableWrapper = styled('div')`
  ${contentWrapper};
  width: calc(100% - 395px);
`

const FirstRowSidebar = styled('div')`
  width: 375px;
`

const SecondRowContainer = styled('div')`
  ${rowContainer};
`

const ChartWrapper = styled('div')`
  ${contentWrapper};
  width: calc(100% - 210px);
`

const SecondRowSidebar = styled('div')`
  width: 190px;
  min-width: 190px;
`

const PlayerSeasonContent = observer(({ data }: PlayerSeasonDataProps) => {
  return (
    <Container>
      <DataStatus data={data.scores} loading={data.loading} loadError={data.loadError} />

      <FirstRowContainer>
        <TableWrapper>
          <SeasonShootingTable data={data} />
        </TableWrapper>
        <FirstRowSidebar>
          <SeasonShootingActiveGame data={data} />
        </FirstRowSidebar>
      </FirstRowContainer>
      <SecondRowContainer>
        <ChartWrapper>
          <SeasonShootingChart data={data} />
        </ChartWrapper>
        <SecondRowSidebar>
          <SeasonDataFilter data={data.filterData} />
        </SecondRowSidebar>
      </SecondRowContainer>
    </Container>
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
