import * as React from 'react'
import DevTools from 'mobx-react-devtools'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'react-emotion'
import * as routes from './routes'
import Menu from './components/Menu'
import Home from './pages/Home'
import Player from './pages/Player'
import Team from './pages/Team'

import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'

const Container = styled('div')`
  box-sizing: border-box;
  padding: 0 0 16px 0;

  & * {
    box-sizing: inherit;
  }
`

const App = () => (
  <Router>
    <Container>
      <Menu />

      <Route path={routes.home} exact={true} component={Home} />

      <Route path={routes.getPlayerRoute(':playerId')} exact={true} component={Player} />
      <Route path={routes.getPlayerGameRoute(':playerId')} exact={true} component={Player} />
      <Route path={routes.getPlayerGameRoute(':playerId', ':gameId')} exact={true} component={Player} />

      <Route path={routes.getTeamRoute(':teamAbbreviation')} exact={true} component={Team} />
      <Route path={routes.getTeamGameRoute(':teamAbbreviation')} exact={true} component={Team} />
      <Route path={routes.getTeamGameRoute(':teamAbbreviation', ':gameId')} exact={true} component={Team} />

      <DevTools />
    </Container>
  </Router>
)

export default App
