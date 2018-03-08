import * as React from 'react'
import styled from 'react-emotion'
import NBASearch from '../components/NBASearch'
import { PageContainer, mobileBreakpoint } from '../layout'

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

const Home = () => (
  <PageContainer>
    <ContentContainer>
      <Title>Understanding Shooter Streakiness</Title>
      <Description>
        This application can be used to analyze variation in shooting accuracy for players and teams,
        with the aim of understanding how recent shooting performance might affect upcoming games or plays.
      </Description>
      <NBASearch big={true} />
    </ContentContainer>
  </PageContainer>
)

export default Home
