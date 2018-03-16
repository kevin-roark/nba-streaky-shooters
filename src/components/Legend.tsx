import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { secondaryContainerStyles, DescriptionExplanation } from '../layout'

const Container = styled('div')`
  ${secondaryContainerStyles};
  padding: 10px;

  &.small {
    padding: 8px;
  }
`

const LegendList = styled('ul')``

const LegendItem = styled('li')`
  margin-bottom: 0;
  display: flex;
  align-items: center;
  user-select: none;
  opacity: 1;
  transition: opacity 0.2s;

  &:not(:last-child) {
    margin-bottom: 15px;

    &.small {
      margin-bottom: 10px;
    }
  }

  &.clickable {
    cursor: pointer;
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

  &.small {
    font-size: 14px;
  }
`

interface LegendItem { label: string, color: string, squareStyle?: React.CSSProperties, disabled?: boolean, onClick?: () => void }
interface LegendProps {
  items: LegendItem[],
  small?: boolean,
  description?: string
}

const Legend = ({ items, description, small }: LegendProps) => {
  const smallClass = cx({ small })
  return (
    <Container className={smallClass}>
      <LegendList>
        {items.map(({ label, squareStyle, disabled, color, onClick }) => (
          <LegendItem key={label} onClick={onClick} className={cx({ disabled, small, clickable: !!onClick })}>
            <LegendSquare style={{ ...squareStyle, backgroundColor: color}} />
            <LegendText className={smallClass}>{label}</LegendText>
          </LegendItem>
        ))}
      </LegendList>
      {description && <DescriptionExplanation>{description}</DescriptionExplanation>}
    </Container>
  )
}

export default Legend
