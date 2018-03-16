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

const LegendList = styled('ul')`
  position: relative;

  &.multiline {
    display: flex;
    flex-wrap: wrap;
  }
`

const LegendItem = styled('li')`
  display: flex;
  align-items: center;
  user-select: none;
  opacity: 1;
  transition: opacity 0.2s;

  margin-bottom: 15px;
  &.small {
    margin-bottom: 10px;
  }

  &.multiline {
    width: 50%;
  }

  &:not(.multiline) {
    &:last-child {
      margin-bottom: 0;
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
  description?: string,
  multiline?: boolean
}

const Legend = ({ items, description, small, multiline }: LegendProps) => {
  const smallClass = cx({ small })
  const multilineClass = cx({ multiline })
  return (
    <Container className={smallClass}>
      <LegendList className={multilineClass}>
        {items.map(({ label, squareStyle, disabled, color, onClick }) => (
          <LegendItem key={label} onClick={onClick} className={cx({ disabled, small, multiline, clickable: !!onClick })}>
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
