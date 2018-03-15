import * as React from 'react'
import styled from 'react-emotion'

interface PaneStyleProps {
  sideWidth: number,
  marginBottom?: number
}

const Container = styled<PaneStyleProps, 'div'>('div')`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${props => props.marginBottom || 0}px;
`

const MainWrapper = styled<PaneStyleProps, 'div'>('div')`
  margin-right: 20px;
  width: calc(100% - ${props => props.sideWidth + 20}px);
`

const SideWrapper = styled<PaneStyleProps, 'div'>('div')`
  width: ${props => props.sideWidth}px;
  min-width: ${props => props.sideWidth}px;
`

interface PaneProps extends PaneStyleProps {
  mainContent: React.ReactNode,
  sideContent: React.ReactNode
}

export const Pane = (props: PaneProps) => (
  <Container {...props}>
    <MainWrapper {...props}>{props.mainContent}</MainWrapper>
    <SideWrapper {...props}>{props.sideContent}</SideWrapper>
  </Container>
)

export default Pane
