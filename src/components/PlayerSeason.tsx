import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { Season, PlayerInfo } from 'nba-netdata/dist/types'
import { PlayerSeasonDataProps, playerSeasonData } from '../models/seasonData'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import SeasonDataFilter from './SeasonDataFilter'
import SeasonShootingTable from './SeasonShootingTable'
import SeasonShootingActiveGame from './SeasonShootingActiveGame'
import SeasonShootingChart from './SeasonShootingChart'

const Container = styled('div')`
  margin: 0 auto 0 auto;
  max-width: 1440px;
`

const FirstRowContainer = styled('div')`
  height: 200px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
`

const TableWrapper = styled('div')`
  width: calc(100% - 386px);
  margin-right: 20px;
`

const ActiveGameWrapper = styled('div')`
  width: 366px;
`

const PlayerSeasonData = observer(({ data }: PlayerSeasonDataProps) => {
  return (
    <Container>
      <SeasonDataFilter data={data.filterData} />
      <FirstRowContainer>
        <TableWrapper>
          <SeasonShootingTable data={data} />
        </TableWrapper>
        <ActiveGameWrapper>
          <SeasonShootingActiveGame data={data} />
        </ActiveGameWrapper>
      </FirstRowContainer>
      <SeasonShootingChart data={data} />
    </Container>
  )
})

interface PlayerSeasonProps {
  player: PlayerInfo,
  season: Season
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
    const { data } = this.props
    if (data.loading) {
      return <Loading message="Loading" />
    }
    if (data.loadError || !data.scores) {
      return <ErrorMessage message={`${data.loadError} — Please try refreshing the page.`} />
    }

    return <PlayerSeasonData data={data} />
  }
}

const ConnectedPlayerSeason = (props: PlayerSeasonProps) =>
  <PlayerSeason {...props} data={playerSeasonData} />

export default ConnectedPlayerSeason
