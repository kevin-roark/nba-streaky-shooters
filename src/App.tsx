import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'react-emotion'
import * as routes from './routes'
import Menu from './components/Menu'
import Home from './pages/Home'
import Player from './pages/Player'
import Team from './pages/Team'

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

      <Route path={routes.getPlayerUrl(':playerId')} exact={true} component={Player} />
      <Route path={routes.getPlayerGameUrl(':playerId', ':gameId')} exact={true} component={Player} />

      <Route path={routes.getTeamUrl(':playerId')} exact={true} component={Team} />
      <Route path={routes.getTeamGameUrl(':playerId', ':gameId')} exact={true} component={Team} />
    </Container>
  </Router>
)

export default App
