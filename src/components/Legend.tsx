import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { secondaryContainerStyles, DescriptionExplanation } from '../layout'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 10px;
`

const LegendList = styled('ul')``

const LegendItem = styled('li')`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.2s;

  &:last-child {
    margin-bottom: 0;
  }

  &.disabled {
    opacity: 0.2;
  }
`

const LegendSquare = styled('span')`
  width: 15px;
  height: 15px;
  margin-right: 8px;
`

const LegendText = styled('span')`
  font-weight: 500;
  font-size: 16px;
  color: #333;
`

interface LegendItem { label: string, color: string, disabled?: boolean, onClick?: () => void }
interface LegendProps {
  items: LegendItem[],
  description?: string
}

const Legend = ({ items, description }: LegendProps) => (
  <Container>
    <LegendList>
      {items.map(({ label, disabled, color, onClick }) => (
        <LegendItem key={label} onClick={onClick} className={cx({ disabled })}>
          <LegendSquare style={{backgroundColor: color}} />
          <LegendText>{label}</LegendText>
        </LegendItem>
      ))}
    </LegendList>
    {description && <DescriptionExplanation>{description}</DescriptionExplanation>}
  </Container>
)

export default Legend
