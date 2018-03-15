import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { sansSerif } from '../layout'

const Container = styled('ul')`
  text-align: left;
`

const MenuItem = styled('li')`
  margin: 0;
  padding: 8px;
  font-family: ${sansSerif};
  font-size: 16px;
  font-weight: 500;

  &:not(.current) {
    cursor: pointer;

    &:hover {
      background-color: #e8e8e8;
    }
  }

  &.current {
    background-color: #D8D8D8
  }
`

interface TogglingSubMenuProps {
  menuItems: string[],
  currentMenuItem: string,
  onSelect: (item: string) => void
}

const TogglingSubMenu = ({ menuItems, currentMenuItem, onSelect }: TogglingSubMenuProps) => (
  <Container>
    {menuItems.map((item, idx) => {
      const current = currentMenuItem === item
      const onClick = current ? undefined : () => onSelect(item)
      return <MenuItem key={idx} className={cx({ current })} onClick={onClick}>{item}</MenuItem>
    })}
  </Container>
)

export default TogglingSubMenu
