import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'react-emotion'
import Home from './components/Home'

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
      <Route path="/" component={Home} />
    </Container>
  </Router>
)

export default App
