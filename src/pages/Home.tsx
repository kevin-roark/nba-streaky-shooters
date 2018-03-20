import * as React from 'react'
import styled from 'react-emotion'
import RoutingNBASearch from '../components/RoutingNBASearch'
import { PageContainer, mobileBreakpoint, monospace } from '../layout'

const ContentContainer = styled('div')`
  max-width: 1080px;
  margin: 0 auto;
`

const Title = styled('h1')`
  margin-top: 40px;
  text-align: center;
  font-size: 56px;

  @media(${mobileBreakpoint}) {
    font-size: 28px;
  }
`

const Subtitle = styled('h2')`
  margin-top: 16px;
  text-align: center;
  font-size: 32px;
`

const Description = styled('p')`
  margin: 40px 0 80px calc((100% - 800px) / 2);
  max-width: 800px;
  color: #333;
  font-size: 24px;

  @media(${mobileBreakpoint}) {
    font-size: 20px;
    margin: 20px 0 50px 0;
    text-align: center;
  }
`

const Credit = styled('div')`
  position: fixed;
  bottom: 5px;
  right: 5px;
  font-family: ${monospace};
  font-size: 14px;
`

const Home = () => (
  <PageContainer>
    <ContentContainer>
      <Title>NBA Streaky Shooting</Title>
      <Subtitle>Visualizing trends in shooting accuracy</Subtitle>
      <Description>
        This application hopes to aid the analysis of shooting consistency over time for players and teams in both a
        "macro" season sense and "micro" game sense. It is a work in progress and still growing.
      </Description>
      <RoutingNBASearch big={true} />
    </ContentContainer>
    <Credit>Data last updated: 03/18/18. Made by <a href="mailto:kevin.e.roark@gmail.com">Kevin Roark Jr</a>.</Credit>
  </PageContainer>
)

export default Home
