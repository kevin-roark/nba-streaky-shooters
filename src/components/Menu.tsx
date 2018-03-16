import * as React from 'react'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import styled from 'react-emotion'
import { css } from 'emotion'
import { allPlayers, allTeams } from '../routes'
import { buttonLinkClass } from '../layout'
import RoutingNBASearch from './RoutingNBASearch'

const Container = styled('div')`
  width: 100vw;
  height: 60px;
  padding: 0 24px;
  background-color: #eee;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);

  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AppTitle = styled('h1')`
  margin: 0;
  font-size: 28px;
  font-weight: 400;
`

const NavContainer = styled('div')`
  display: flex;
  align-items: center;
`

const menuLinkClass = css`
  ${buttonLinkClass};
  margin-left: 15px;
  display: none;
`

const Menu = (props: RouteComponentProps<any>) => {
  const { location: { pathname } } = props
  if (pathname === '/') {
    return null
  }

  return (
    <Container>
      <AppTitle>NBA Streaky Shooting</AppTitle>
      <NavContainer>
        <RoutingNBASearch />
        <Link className={menuLinkClass} to={allPlayers}>View All Players</Link>
        <Link className={menuLinkClass} to={allTeams}>View All Teams</Link>
      </NavContainer>
    </Container>
  )
}

export default withRouter(Menu)
