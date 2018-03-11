import styled from 'react-emotion'

export const serif = `Times New Roman, serif`
export const sansSerif = `'Work Sans', 'Helvetica', sans-serif`
export const monospace = `'Overpass Mono', monospace`

export const mobileBreakpoint = 'max-width: 800px'
export const notMobileBreakpoint = 'min-width: 801px'

export const PageContainer = styled('div')``
export const ContentContainer = styled('div')`
  max-width: 1600px;
  margin: 0 auto;

  @media(max-width: 1650px) {
    max-width: none;
    margin: 0 25px;
  }
`

export const PageTitle = styled('h1')`
  margin-top: 0;
  font-size: 48px;
  font-weight: 500;
`
