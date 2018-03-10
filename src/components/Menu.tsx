import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import styled from 'react-emotion'
import { mobileBreakpoint } from '../layout'
import RoutingNBASearch from './RoutingNBASearch'

const Container = styled('div')`
  width: 100vw;
  height: 80px;
  padding: 0 16px;
  background-color: #eee;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);

  display: flex;
  align-items: center;

  @media(${mobileBreakpoint}) {
    height: 80px;
  }
`

const Menu = (props: RouteComponentProps<any>) => {
  const { location: { pathname } } = props
  if (pathname === '/') {
    return null
  }

  return (
    <Container>
      <RoutingNBASearch />
    </Container>
  )
}

export default withRouter(Menu)
