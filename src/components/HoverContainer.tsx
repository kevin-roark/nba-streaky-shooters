import * as React from 'react'
import styled from 'react-emotion'
import { secondaryBorderStyles } from '../layout'

const Container = styled('div')`
  ${secondaryBorderStyles};
  position: fixed;
  z-index: 5;
  padding: 10px;
  background: #eee;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);
`

interface HoverContainerProps {
  mouseX: number,
  mouseY: number,
  children: React.ReactNode,
  selfManaged?: boolean,
  onCloseRequest?: () => void,
  width?: number,
  padding?: number
}

class HoverContainer extends React.Component<HoverContainerProps, {}> {
  container: HTMLDivElement | null

  componentDidMount() {
    if (this.props.selfManaged) {
      window.addEventListener('click', this.onMouseDown)
      window.addEventListener('scroll', this.onScroll)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onMouseDown)
    window.removeEventListener('scroll', this.onScroll)
  }

  onScroll = () => {
    this.props.onCloseRequest!()
  }

  onMouseDown = (ev: MouseEvent) => {
    if (!this.container) {
      return
    }

    const withinContainer = ev.target === this.container || this.container.contains(ev.target as any)
    if (!withinContainer) {
      this.props.onCloseRequest!()
    }
  }

  render() {
    const { mouseX, mouseY, children, width = 320, padding = 10 } = this.props

    const nearRightEdge = mouseX > window.innerWidth - (width + padding)
    const nearBottom = mouseY > window.innerHeight - 200

    const left = nearRightEdge ? (mouseX - width - padding) : (mouseX + padding)
    const top = nearBottom ? '' : (mouseY + padding)
    const bottom = nearBottom ? padding : ''

    const style = { width, left, top, bottom }

    return (
      <Container style={style} innerRef={el => this.container = el}>
        {children}
      </Container>
    )
  }
}

export default HoverContainer
