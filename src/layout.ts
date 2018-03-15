import styled from 'react-emotion'
import { css } from 'emotion'

export type TextAlign = 'left' | 'center' | 'right'

export const serif = `Times New Roman, serif`
export const sansSerif = `'Work Sans', 'Helvetica', sans-serif`
export const monospace = `'Overpass Mono', monospace`

export const mobileBreakpoint = 'max-width: 800px'
export const notMobileBreakpoint = 'min-width: 801px'

export const PageContainer = styled('div')`
  min-width: 960px;
`

export const ContentContainer = styled('div')`
  max-width: 1440px;
  margin: 0 auto;

  @media(max-width: 1490px) {
    max-width: none;
    margin: 0 25px;
  }
`

export const secondaryBorderStyles = css`
  border: 1px solid #000;
`

export const secondaryContainerStyles = css`
  ${secondaryBorderStyles};
  background: #fafafa;
  margin-bottom: 20px;
`

export const baseChartContainerStyles = css`
  ${secondaryBorderStyles};
  background-color: #fff;
  min-height: 400px;
`

export const BaseChartContainer = styled('div')`
  ${baseChartContainerStyles};
`

export const PageTitle = styled('h1')`
  margin-top: 0;
  font-size: 40px;
  font-weight: 500;
`

export const DescriptionExplanation = styled('p')`
  margin-bottom: 0;
  color: #222;
  font-family: ${serif};
  font-style: italic;
  font-size: 12px;
  line-height: 14px;
`

export const hoverLinkClass = css`
  border-bottom: none;

  &:hover {
    border-bottom: 2px solid #000;
  }
`

export const buttonLinkClass = css`
  display: block;
  padding: 8px;
  margin-left: 15px;
  border: 1px solid #000;
  background-color: #fff;
  font-size: 16px;

  &:hover {
    background-color: #eee;
  }
`
