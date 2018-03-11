import * as React from 'react'
import { css } from 'emotion'
import styled from 'react-emotion'
import ReactTable from 'react-table'
import { monospace } from '../layout'

import 'react-table/react-table.css'

const TableContainer = styled('div')`
  font-family: ${monospace};

  & .ReactTable {
    & .rt-tbody {
      & .rt-tr-group {
        border-bottom: none;
      }
    }
  }
`

const tableCellStyles = css``

export const RightAlignedTableCell = styled('div')`
  ${tableCellStyles};
  text-align: right;
`

export interface TableColumn<T> {
  Header: string,
  accessor: (keyof T) | ((data: any) => string | number),
  percent?: boolean,
  Cell?: (row: { value: any, original: T }) => any
}

export interface TableConfig {
  showPagination?: boolean,
  resizable?: boolean,
  defaultPageSize?: number
}

interface TableProps<T> extends TableConfig {
  data: T[],
  columns: TableColumn<T>[],
}

interface TableState {}

export class Table<T> extends React.Component<TableProps<T>, TableState> {
  render() {
    const defaultProps: TableConfig = {
      showPagination: false,
      resizable: false,
      defaultPageSize: this.props.data.length
    }

    const columns = this.props.columns.map(item => {
      if (item.percent && typeof item.accessor === 'string') {
        const key = item.accessor
        const accessor = (d: T) => {
          const value = d[key]
          if (typeof value !== 'number') {
            return value
          }

          return (value * 100).toFixed(1) + '%'
        }
        return { ...item, id: key, accessor }
      }

      return item
    })

    return (
      <TableContainer>
        <ReactTable
          {...defaultProps}
          {...this.props}
          columns={columns}
        />
      </TableContainer>
    )
  }
}

export default Table
