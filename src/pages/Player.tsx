import * as React from 'react'
import styled from 'react-emotion'
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

const Player = (props) => {
  console.log(props)
  return (
    <PageContainer>
      <ContentContainer>
        <Title>Player</Title>
      </ContentContainer>
    </PageContainer>
  )
}

export default Player
