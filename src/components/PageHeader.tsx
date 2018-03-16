import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import { PageTitle } from '../layout'
import TogglingSubMenu from './TogglingSubMenu'

export enum PageMenuItem {
  SeasonShooting = 'Season Mode',
  GameShooting = 'Game Mode'
}

interface PageHeaderProps {
  title: React.ReactNode,
  currentMenuItem: PageMenuItem,
  onMenuItemSelect: (item: PageMenuItem) => void,
  subtitle?: React.ReactNode,
}

const TopHeader = styled('div')`
  position: relative;
  max-width: 600px;
  margin: 20px auto;
  padding: 12px;
  border: 2px solid #000;
  background-color: #eee;
  text-align: center;
`

const SubTitle = styled('h2')`
  margin: 6px 0 10px 0;
  font-size: 20px;
  font-weight: 400;
`

const PageHeader = ({ title, currentMenuItem, onMenuItemSelect, subtitle }: PageHeaderProps) => {
  const subMenuProps = {
    menuItems: [PageMenuItem.SeasonShooting, PageMenuItem.GameShooting],
    currentMenuItem: currentMenuItem,
    onSelect: onMenuItemSelect
  }

  const titleStyle = subtitle ? {} : { marginBottom: 15 }

  return (
    <TopHeader>
      <PageTitle style={titleStyle}>{title}</PageTitle>
      {subtitle && <SubTitle>{subtitle}</SubTitle>}
      <TogglingSubMenu {...subMenuProps} />
    </TopHeader>
  )
}

export default PageHeader
