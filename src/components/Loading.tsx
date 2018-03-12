import * as React from 'react'
import styled from 'react-emotion'

const LoadingText = styled('h2')`
  color: #666;
`

interface LoadingProps { message: string }
interface LoadingState { counter: number }

class Loading extends React.Component<LoadingProps, LoadingState> {
  state = { counter: 0 }
  interval: any

  componentDidMount() {
    const increment = () => { this.setState({ counter: this.state.counter + 1 }) }
    this.interval = setInterval(increment, 200)
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  render() {
    const { message } = this.props
    const { counter } = this.state
    let text = message
    for (let i = 0; i < counter % 3; i++) {
      text += `.`
    }

    return <LoadingText>{text}</LoadingText>
  }
}

export default Loading
