import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { mobileBreakpoint } from '../layout'

const Input = styled('input')`
  border: none;
  outline: none;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.5);
  font-family: Times New Roman, serif;

  &::placeholder {
    color: #666;
    font-style: italic;
  }

  &.big {
    display: block;
    margin: 0 auto;
    padding: 40px 25px;
    width: 800px;
    font-size: 36px;
  }

  @media (${mobileBreakpoint}) {
    &.big {
      padding: 20px;
      width: auto;
      font-size: 20px;
    }
  }
`

interface NBASearchProps {
  big?: boolean
}

interface NBASearchState {

}

class NBASearch extends React.Component<NBASearchProps, NBASearchState> {
  input: HTMLInputElement | null = null

  componentDidMount() {
    if (this.input && this.props.big) {
      this.input.focus()
    }
  }

  render() {
    const { big = false } = this.props
    return (
      <Input
        innerRef={el => this.input = el}
        className={cx({ big })}
        placeholder="Find Player Or Team"
      />
    )
  }
}

export default NBASearch
