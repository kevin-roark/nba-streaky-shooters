import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { Season, PlayerInfo, PlayerBoxScores } from 'nba-netdata/dist/types'
import { calcShootingDataFromBoxScoreStats } from 'nba-netdata/dist/calc'
import { webDataManager } from '../data'
import seasonFilterData, { SeasonFilterData } from '../models/seasonFilterData'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import SeasonDataFilter from './SeasonDataFilter'
import SeasonShootingTable from './SeasonShootingTable'
import SeasonShootingChart from './SeasonShootingChart'

const TableWrapper = styled('div')`
  max-width: 800px;
  margin: 0 auto;
`

interface PlayerSeasonDataProps { boxScores: PlayerBoxScores, filterData: SeasonFilterData }

const PlayerSeasonData = observer(({ boxScores, filterData }: PlayerSeasonDataProps) => {
  const stats = filterData.filterStats(boxScores.scores).map(s => s.stats)
  const enhancedBoxScores = stats.map(calcShootingDataFromBoxScoreStats)

  return (
    <div>
      <SeasonDataFilter data={filterData} />
      <TableWrapper>
        <SeasonShootingTable enhancedBoxScores={enhancedBoxScores} />
      </TableWrapper>
      <SeasonShootingChart enhancedBoxScores={enhancedBoxScores} />
    </div>
  )
})

interface PlayerSeasonProps {
  player: PlayerInfo,
  season: Season
}

interface PlayerSeasonState {
  loading: boolean,
  loadError: string | null,
  boxScores: PlayerBoxScores | null
}

class PlayerSeason extends React.Component<PlayerSeasonProps, PlayerSeasonState> {
  state = { loading: true, loadError: null, boxScores: null }

  componentDidMount() {
    this.loadSeasonData()
  }

  componentDidUpdate(prevProps: PlayerSeasonProps) {
    if (this.props.player.id !== prevProps.player.id) {
      this.loadSeasonData()
    }
  }

  loadSeasonData() {
    const { player, season } = this.props
    this.setState({ loading: true }, async () => {
      const boxScores = await webDataManager.loadPlayerBoxScores(player.id, season)
      const loadError = boxScores ? null : 'Error loading player box scores...'
      this.setState({ boxScores, loadError, loading: false })
    })
  }

  render() {
    const { loading, loadError, boxScores } = this.state
    if (loading) {
      return <Loading message="Loading" />
    }
    if (loadError || !boxScores) {
      return <ErrorMessage message={`${loadError} — Please try refreshing the page.`} />
    }

    return <PlayerSeasonData boxScores={boxScores} filterData={seasonFilterData} />
  }
}

export default PlayerSeason
