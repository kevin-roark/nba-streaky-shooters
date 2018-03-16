import * as React from 'react'
import styled from 'react-emotion'
import { css } from 'emotion'
import * as cx from 'classnames'
import { TextAlign, monospace, serif } from '../layout'
import { getHeatColor } from '../util/color'

export type TableStyle = 'default' | 'minimal' | 'small' | 'medium'

const TableContainer = styled('div')`
  border: 1px solid #eee;
  font-size: 15px;
  font-family: ${monospace};

  &.minimal {
    border: none;
  }

  &.medium {
    font-size: 13px;
  }

  &.small {
    font-size: 10px;
  }
`

export const TableCell = styled('div')`
  position: relative;
  text-align: right;
  border: 1px solid transparent;

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
      padding: 4px 4px;
    }
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      border: 1px solid #000;

      &:not(.sortedBy) {
        background-color: #ddd;
      }
    }
  }

  &.sortedBy {
    background-color: #ffb;
    &.ascending {
      border-top: 1px solid #000;
    }
    &.descending {
      border-bottom: 1px solid #000;
    }
  }
`

const rowHeaderStyles = css`
  display: flex;
  justify-content: stretch;

  &.highlight {
    &:hover {
      background-color: #eee;
    }
  }
`

const TableHeader = styled('div')`
  ${rowHeaderStyles};

  background-color: #f0f0f0;
  font-weight: 700;
  user-select: none;

  &.minimal {
    background-color: transparent;
    border-bottom: 1px solid #000;
  }
`

const TableRow = styled('div')`
  ${rowHeaderStyles};

  border-top: 1px solid #e0e0e0;

  &.minimal {
    border-top: none;
  }
`

const Tooltip = styled('div')`
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  transform: translate(-50%, calc(-100% - 10px));
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

export const TextTooltip = styled('div')`
  font-size: 13px;
  font-family: ${serif};
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
  dataTooltipRenderer?: (data: T) => React.ReactNode,
  heatProvider?: (data: T) => number,
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
  highlight?: boolean
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

  clearHoverCell = (rowId: string, colIdx: number) => {
    const { hoverCell } = this.state
    if (hoverCell && hoverCell.col === colIdx && hoverCell.rowId === rowId) {
      this.setState({ hoverCell: null })
    }
  }

  forceClearHoverCell = () => {
    this.setState({ hoverCell: null })
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
      <Tooltip
        className={cx({ horizontal: col === 0 })}
        onMouseEnter={() => this.clearHoverCell(rowId, col)}
      >
        {value}
      </Tooltip>
    )
  }

  render() {
    const { rows, columns, styles = [], sortable = false, highlight = true } = this.props
    const { sortColumnId, sortAscending } = this.state

    const sortedRows = rows.concat([])
    const sortCol = columns.find(c => c.id === sortColumnId)
    if (sortCol) {
      sortedRows.sort((a, b) => {
        let av = sortCol.accessor(a)
        let bv = sortCol.accessor(b)
        if (typeof av === 'number' && typeof bv === 'number') {
          av = isNaN(av) ? (sortAscending ? Infinity : -Infinity) : av
          bv = isNaN(bv) ? (sortAscending ? Infinity : -Infinity) : bv
          return sortAscending ? (av - bv) : (bv - av)
        }

        av = av + ''
        bv = bv + ''
        return sortAscending ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }

    const styleClass = cx(styles, { highlight })

    return (
      <TableContainer className={styleClass} onMouseLeave={this.forceClearHoverCell}>
        <TableHeader className={styleClass}>
          {columns.map((c, colIdx) => {
            const headerCellClass = cx([styleClass, {
              clickable: sortable, center: true, sortedBy: sortCol === c, ascending: sortAscending, descending: !sortAscending
            }])
            return (
              <TableCell
                key={c.id}
                style={c.style}
                className={headerCellClass}
                onClick={() => this.onCellHeaderClick(c)}
                onMouseEnter={() => this.onCellMouseEnter('header', colIdx)}
                onMouseLeave={() => this.clearHoverCell('header', colIdx)}
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
              let style = { ...c.style }
              if (c.heatProvider) {
                const heat = c.heatProvider(d)
                if (!isNaN(heat)) {
                  style.backgroundColor = getHeatColor(heat)
                }
              }

              return (
                <TableCell
                  key={c.id}
                  className={cx([styleClass, { [c.align || 'center']: true }])}
                  style={style}
                  onMouseEnter={() => this.onCellMouseEnter(d.id, colIdx)}
                  onMouseLeave={() => this.clearHoverCell(d.id, colIdx)}
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

    const style: React.CSSProperties = {
      width: c.width || `calc((100% - ${reservedWidth}px) / ${fluidColumnsCount})`,
    }

    return { ...c, id, formatter, accessor, style }
  })

  return <TableData {...props} columns={processedColumns} />
}

export default Table
