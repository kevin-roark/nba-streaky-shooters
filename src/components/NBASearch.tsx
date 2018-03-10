import * as React from 'react'
import { css } from 'emotion'
import styled from 'react-emotion'
import * as cx from 'classnames'
import Autosuggest from 'react-autosuggest'
import { getTeamsInfo, getPlayersInfo } from 'nba-netdata/dist/data'
import { PlayerInfo, TeamInfo } from 'nba-netdata/dist/types'
import { mobileBreakpoint } from '../layout'

export interface TeamOrPlayer {
  team?: TeamInfo,
  player?: PlayerInfo
}

export interface PartialNBASearchProps {
  big?: boolean
}

export interface NBASearchProps extends PartialNBASearchProps {
  handleSearchRequest: (input: TeamOrPlayer) => void
}

const teams = getTeamsInfo()
const players = getPlayersInfo()

const teamsAndPlayers =
  (teams.map(team => ({ team })) as TeamOrPlayer[])
  .concat((players.map(player => ({ player }))) as TeamOrPlayer[])

const inputStyles = css`
  border: none;
  outline: none;
  border-radius: 0;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.5);
  font-family: Times New Roman, serif;

  padding: 10px 10px;
  width: 400px;
  font-size: 24px;

  &::placeholder {
    color: #666;
    font-style: italic;
  }

  @media (${mobileBreakpoint}) {

  }
`

const bigInputStyles = css`
  display: block;
  padding: 40px 25px;
  width: 100%;
  font-size: 36px;

  @media (${mobileBreakpoint}) {
    padding: 20px;
    width: auto;
    font-size: 20px;
  }
`

const Container = styled('form')`
  position: relative;

  & .react-autosuggest__input {
    ${inputStyles};
  }

  & .react-autosuggest__suggestions-container {
    display: none;
  }

  & .react-autosuggest__suggestions-container--open {
    display: block;
    position: absolute;
    top: 51px;
    width: 400px;
    background-color: #fff;
    font-size: 16px;
    z-index: 2;
  }

  & .react-autosuggest__suggestion {
    cursor: pointer;
    padding: 10px 20px;
    border: 1px solid #000;
  }

  & .react-autosuggest__suggestion--highlighted {
    background-color: #ddd;
  }

  &.big {
    margin: 0 auto;
    width: 800px;

    & .react-autosuggest__input {
      ${bigInputStyles};
    }

    & .react-autosuggest__suggestions-container--open {
      width: 800px;
      top: 100px;
    }
  }
`

interface NBASearchState {
  value: string,
  suggestions: TeamOrPlayer[],
  selectedSuggestion: TeamOrPlayer | null,
  notFoundError: boolean
}

export class NBASearch extends React.Component<NBASearchProps, NBASearchState> {
  constructor(props: NBASearchProps) {
    super(props)
    this.state = {
      value: '',
      suggestions: [],
      selectedSuggestion: null,
      notFoundError: false
    }
  }

  onInputChange = (ev, { newValue }) => {
    this.setState({ value: newValue })
  }

  onSubmit = (ev) => {
    ev.preventDefault()

    const suggestion = this.state.selectedSuggestion || this.state.suggestions[0]
    if (!suggestion) {
      return this.setState({ notFoundError: true })
    }

    this.props.handleSearchRequest(suggestion)
    this.setState({ notFoundError: false, value: '', selectedSuggestion: null })
  }

  onSuggestionSelected = (ev, options: { suggestion: TeamOrPlayer }) => {
    this.setState({ selectedSuggestion: options.suggestion })
  }

  getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase()
    if (inputValue.length === 0) {
      return []
    }

    return teamsAndPlayers
      .map(item => {
        const label = this.getSuggestionLabel(item)
        const inputIndex = label.toLowerCase().indexOf(inputValue)
        return { item, inputIndex }
      })
      .filter(item => item.inputIndex >= 0)
      .sort((a, b) => a.inputIndex - b.inputIndex)
      .map(item => item.item)
  }

  getSuggestionLabel = (suggestion: TeamOrPlayer) => {
    if (suggestion.team) {
      return suggestion.team.name
    }

    return `${suggestion.player!.firstName} ${suggestion.player!.lastName}`
  }

  getSuggestionValue = (suggestion: TeamOrPlayer) => {
    if (suggestion.team) {
      return suggestion.team.name
    }

    return `${suggestion.player!.firstName} ${suggestion.player!.lastName}`
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) })
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
  }

  render() {
    const { big = false } = this.props
    const { value, suggestions, notFoundError } = this.state

    const inputProps = {
      value,
      placeholder: 'Find Player Or Team',
      onChange: this.onInputChange,
    }

    const renderSuggestion = (suggestion: TeamOrPlayer) => (
      <div>
        {this.getSuggestionLabel(suggestion)}
      </div>
    )

    const handleRef = (el: Autosuggest) => {
      if (el && big && !el.input._hasAutoFocused) {
        el.input.focus()
        el.input.__hasAutoFocused = true
      }
    }

    return (
      <Container className={cx({ big })} onSubmit={this.onSubmit}>
        <Autosuggest
          ref={handleRef}
          suggestions={suggestions}
          inputProps={inputProps}
          highlightFirstSuggestion={true}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={renderSuggestion}
        />
        { notFoundError &&
          <div>Not found!!</div>
        }
      </Container>
    )
  }
}

export default NBASearch
