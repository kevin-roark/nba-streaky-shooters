import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'react-emotion'
import Home from './pages/Home'
import Player from './pages/Player'

const Container = styled('div')`
  box-sizing: border-box;
  padding: 8px;

  & * {
    box-sizing: inherit;
  }
`

const App = () => (
  <Router>
    <Container>
      <Route path="/" exact={true} component={Home} />

      <Route path="/player/:playerId" component={Player} />
      <Route path="/player/:playerId/game/:gameId" component={Player} />
    </Container>
  </Router>
)

export default App
