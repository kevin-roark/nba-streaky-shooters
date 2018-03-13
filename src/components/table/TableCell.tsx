import * as React from 'react'
import styled from 'react-emotion'
import { TextAlign } from '../../layout'

interface TableCellProps { align?: TextAlign }

export const TableCell = styled<TableCellProps, 'div'>('div')`
  text-align: ${props => props.align || 'right'};
`

interface HoverTableCellProps extends TableCellProps {
  children: React.ReactNode,
  onHover: (hovering: boolean, mouseX: number, mouseY: number) => void,
}

export const HoverTableCell = ({ onHover, align, children }: HoverTableCellProps) => (
  <TableCell
    align={align}
    onMouseOver={e => onHover(true, e.clientX, e.clientY)}
    onMouseOut={e => onHover(false, e.clientX, e.clientY)}
  >
    {children}
  </TableCell>
)
