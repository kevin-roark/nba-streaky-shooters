import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'react-emotion'
import { Season, PlayerInfo, PlayerBoxScores, GameLog } from 'nba-netdata/dist/types'
import { calcShootingDataFromBoxScoreStats, EnhancedShootingBoxScoreStats } from 'nba-netdata/dist/calc'
import { webDataManager } from '../data'
import seasonFilterData, { SeasonFilterData } from '../models/seasonFilterData'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import SeasonDataFilter from './SeasonDataFilter'
import SeasonShootingTable from './SeasonShootingTable'
import SeasonShootingChart from './SeasonShootingChart'

const TableWrapper = styled('div')`
  max-width: 960px;
  margin: 0 auto;
`

interface PlayerSeasonDataProps {
  boxScores: { game: GameLog, stats: EnhancedShootingBoxScoreStats }[],
  filterData: SeasonFilterData
}

const PlayerSeasonData = observer(({ boxScores, filterData }: PlayerSeasonDataProps) => {
  const allStats = boxScores.map(s => s.stats)

  const filteredScores = filterData.filterStats(boxScores)
  const filteredGames = filteredScores.map(s => s.game)
  const filteredStats = filteredScores.map(s => s.stats)

  return (
    <div>
      <SeasonDataFilter data={filterData} />
      <TableWrapper>
        <SeasonShootingTable allStats={allStats} filteredStats={filteredStats} />
      </TableWrapper>
      <SeasonShootingChart games={filteredGames} enhancedBoxScores={filteredStats} />
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
  constructor(props: PlayerSeasonProps) {
    super(props)
    this.state = { loading: true, loadError: null, boxScores: null }
  }

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

    const enhancedBoxScores = boxScores.scores.map(b => ({
      game: b.game,
      stats: calcShootingDataFromBoxScoreStats(b.stats)
    }))

    return <PlayerSeasonData boxScores={enhancedBoxScores} filterData={seasonFilterData} />
  }
}

export default PlayerSeason
