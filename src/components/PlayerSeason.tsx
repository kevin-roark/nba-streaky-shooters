import * as React from 'react'
import styled from 'react-emotion'
import { Season, PlayerInfo, PlayerBoxScores } from 'nba-netdata/dist/types'
import { webDataManager } from '../data'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import SeasonShootingTable from './SeasonShootingTable'

const TableWrapper = styled('div')`
  max-width: 800px;
  margin: 0 auto;
`

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
    this.state = {
      loading: true,
      loadError: null,
      boxScores: null
    }
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

    return (
      <div>
        <TableWrapper>
          <SeasonShootingTable stats={boxScores.scores} />
        </TableWrapper>
      </div>
    )
  }
}

export default PlayerSeason
