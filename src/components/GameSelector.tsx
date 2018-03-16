import * as React from 'react'
import { observer } from 'mobx-react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import { SingleDatePicker } from 'react-dates'
import { Moment } from 'moment'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { GameDataProps } from '../models/gameData'
import { monospace, buttonLinkClass, secondaryContainerStyles } from '../layout'
import { zpad } from '../util/format'

const Container = styled('div')`
  ${secondaryContainerStyles};
  text-align: center;
  padding: 12px 10px;
`

const Row = styled('div')`
  &:not(:last-child) {
    margin-bottom: 10px;
  }
`

const GameChangeButton = styled('div')`
  ${buttonLinkClass};

  &:not(:last-child) {
    margin-bottom: 10px;
  }

  transition: opacity 0.2s;
  &.disabled {
    opacity: 0.5;
    cursor: default;
  }
`

@observer
class GameDateSelector extends React.Component<GameDataProps & RouteComponentProps<any>, { focused: boolean }> {
  state = { focused: false }

  render() {
    const { data, history } = this.props
    const { gameDate, possibleGameDates } = data
    if (!gameDate) {
      return null
    }

    const format = 'YYYY-MM-DD'

    const sdpProps = {
      numberOfMonths: 1,
      placeholder: 'Select By Date',
      isDayBlocked: (day: Moment) => !possibleGameDates.has(day.format(format)),
      isOutsideRange: () => false,
      id: 'gameDateSelector',
      date: null,
      onDateChange: (date: Moment) => {
        const text = date.format(format)
        const gameId = possibleGameDates.get(text)
        if (gameId && gameId !== data.gameId) {
          history.push(data.getGameRoute(gameId))
        }
      },
      focused: this.state.focused,
      onFocusChange: ({ focused }) => this.setState({ focused })
    }

    return <Row><SingleDatePicker {...sdpProps} /></Row>
  }
}

const GameSelector = (props: GameDataProps & RouteComponentProps<any>) => {
  const { data, history } = props
  const { nextGameId, prevGameId } = data

  const prevGameLink = prevGameId ? <Link to={data.getGameRoute(prevGameId)}>Prev Game</Link> : 'Prev Game'
  const nextGameLink = nextGameId ? <Link to={data.getGameRoute(nextGameId)}>Next Game</Link> : 'Next Game'

  return (
    <Container>
      <Row>
        <GameChangeButton className={cx({ disabled: !prevGameId })}>{prevGameLink}</GameChangeButton>
      </Row>
      <Row>
        <GameChangeButton className={cx({ disabled: !nextGameId })}>{nextGameLink}</GameChangeButton>
      </Row>
      <GameDateSelector {...props} />
    </Container>
  )
}

export default withRouter(observer(GameSelector))
