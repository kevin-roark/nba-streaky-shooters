import * as React from 'react'
import styled from 'react-emotion'
import { css } from 'emotion'
import * as cx from 'classnames'
import { TextAlign, monospace } from '../layout'

export type TableStyle = 'default' | 'minimal' | 'small'

const TableContainer = styled('div')`
  border: 1px solid #eee;
  font-size: 15px;
  font-family: ${monospace};

  &.minimal {
    border: none;
  }

  &.small {
    font-size: 10px;
  }
`

export const TableCell = styled('div')`
  position: relative;
  text-align: right;

  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }

  &.left {
    text-align: left;
  }
  &.center {
    text-align: center;
  }

  & .cell-content {
    padding: 4px 8px;
  }

  &.minimal {
    &:first-child {
      border-right: 1px solid #000;
    }

    & .cell-content {
      padding: 2px 4px;
    }
  }

  &.clickable {
    cursor: pointer;
  }
`

const rowHeaderStyles = css`
  display: flex;
  justify-content: stretch;

  &:hover {
    background-color: #eee;
  }
`

const TableHeader = styled('div')`
  ${rowHeaderStyles};

  background-color: #f0f0f0;
  font-weight: 700;

  &.minimal {
    background-color: transparent;
    border-bottom: 1px solid #000;
  }
`

const TableRow = styled('div')`
  ${rowHeaderStyles};

  border-top: 1px solid #eee;

  &.minimal {
    border-top: none;
  }
`

const Tooltip = styled('div')`
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -100%);
  z-index: 2;

  padding: 5px;
  background-color: #eee;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);
  white-space: pre-line;
  text-align: center;
  font-size: 16px;
  font-family: ${monospace};
  font-weight: 400;

  &.horizontal {
    width: 210px;
    left: 100%;
    top: 50%;
    transform: translate(0, -50%);
  }
`

type DataAccessor<T> = (data: T) => React.ReactText
type DataFormatter<T> = (data: T, value: React.ReactText) => React.ReactNode

export interface TableColumn<T> {
  header: string,
  accessor: (keyof T) | DataAccessor<T>,
  id?: string,
  formatter?: DataFormatter<T>,
  align?: TextAlign,
  width?: number,
  headerTooltipRenderer?: () => React.ReactNode,
  dataTooltipRenderer?: (data: T) => React.ReactNode
}

interface ProcesssedTableColumn<T> extends TableColumn<T> {
  id: string,
  accessor: DataAccessor<T>,
  formatter: DataFormatter<T>,
  style: React.CSSProperties
}

export interface TableProps<T extends { id: string }> {
  rows: T[],
  columns: TableColumn<T>[],
  styles?: TableStyle[],
  sortable?: boolean
}

interface TableDataProps<T extends {id: string}> extends TableProps<T> {
  columns: ProcesssedTableColumn<T>[],
}

interface TableDataState {
  sortColumnId: string | null,
  sortAscending: boolean,
  hoverCell: { rowId: string, col: number } | null
}

class TableData<T extends { id: string }> extends React.Component<TableDataProps<T>, TableDataState> {
  constructor(props: TableDataProps<T>) {
    super(props)
    this.state = { sortColumnId: null, hoverCell: null, sortAscending: false }
  }

  onCellHeaderClick = (col: ProcesssedTableColumn<T>) => {
    if (!this.props.sortable) {
      return
    }

    const { sortAscending, sortColumnId } = this.state
    if (col.id === sortColumnId) {
      this.setState({ sortAscending: !sortAscending }) // if we click the already sorted column, toggle sort direction
    } else {
      this.setState({ sortColumnId: col.id })
    }
  }

  onCellMouseEnter = (rowId: string, col: number) => {
    this.setState({ hoverCell: { rowId, col }})
  }

  onCellMouseLeave = () => {
    // this.setState({ hoverCell: null })
  }

  renderCellTooltip(rowId: string, col: number, data?: T) {
    const { hoverCell } = this.state
    const column = this.props.columns[col]
    if (!hoverCell || hoverCell.rowId !== rowId || hoverCell.col !== col) {
      return null
    }

    let value: React.ReactNode | null = null
    if (rowId === 'header' && column.headerTooltipRenderer) {
      value = column.headerTooltipRenderer()
    } else if (data && column.dataTooltipRenderer) {
      value = column.dataTooltipRenderer(data)
    }
    if (value === null) {
      return null
    }

    return (
      <Tooltip className={cx({ horizontal: col === 0 })}>{value}</Tooltip>
    )
  }

  render() {
    const { rows, columns, styles = [], sortable = false } = this.props
    const { sortColumnId, sortAscending } = this.state

    const sortedRows = rows.concat([])
    const sortCol = columns.find(c => c.id === sortColumnId)
    if (sortCol) {
      sortedRows.sort((a, b) => {
        const av = sortCol.accessor(a)
        const bv = sortCol.accessor(b)
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortAscending ? (av - bv) : (bv - av)
        }

        const avs = av + ''
        const bvs = bv + ''
        return sortAscending ? avs.localeCompare(bvs) : bvs.localeCompare(avs)
      })
    }

    const styleClass = cx(styles)

    return (
      <TableContainer className={styleClass}>
        <TableHeader className={styleClass}>
          {columns.map((c, colIdx) => {
            return (
              <TableCell
                key={c.id}
                style={c.style}
                className={cx([styleClass, { clickable: sortable, center: true }])}
                onClick={() => this.onCellHeaderClick(c)}
                onMouseEnter={() => this.onCellMouseEnter('header', colIdx)}
                onMouseLeave={this.onCellMouseLeave}
              >
                <div className="cell-content">{c.header}</div>
                {this.renderCellTooltip('header', colIdx)}
              </TableCell>
            )
          })}
        </TableHeader>
        {sortedRows.map(d => (
          <TableRow key={d.id} className={styleClass}>
            {columns.map((c, colIdx) => {
              const value = c.accessor(d)
              return (
                <TableCell
                  key={c.id}
                  className={cx([styleClass, { [c.align || 'right']: true }])}
                  style={c.style}
                  onMouseEnter={() => this.onCellMouseEnter(d.id, colIdx)}
                >
                  <div className="cell-content">{c.formatter(d, value)}</div>
                  {this.renderCellTooltip(d.id, colIdx, d)}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableContainer>
    )
  }
}

export function Table<T extends { id: string }> (props: TableProps<T>) {
  const { columns } = props

  let reservedWidth = 0
  let fluidColumnsCount = 0
  columns.forEach(c => {
    if (c.width) {
      reservedWidth += c.width
    } else {
      fluidColumnsCount += 1
    }
  })

  const processedColumns: ProcesssedTableColumn<T>[] = columns.map(c => {
    const id = c.id || String(c.accessor)
    const formatter = c.formatter || ((d, v) => v)
    const accessor: DataAccessor<T> = typeof c.accessor === 'function'
      ? (c.accessor as DataAccessor<T>) : ((d: T) => d[c.accessor as keyof T]) as any

    const style = {
      width: c.width || `calc((100% - ${reservedWidth}px) / ${fluidColumnsCount})`,
    }

    return { ...c, id, formatter, accessor, style }
  })

  return <TableData {...props} columns={processedColumns} />
}

export default Table
