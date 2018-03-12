import * as React from 'react'
import { css } from 'emotion'
import styled from 'react-emotion'
import ReactTable from 'react-table'
import { monospace, TextAlign } from '../layout'

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

export const TableCell = styled<{ align?: TextAlign }, 'div'>('div')`
  text-align: ${props => props.align || 'right'};
`

export interface TableColumn<T> {
  Header: string,
  accessor: (keyof T) | ((data: any) => string | number),
  percent?: boolean,
  align?: 'left' | 'center' | 'right',
  Cell?: (row: { value: any, original: T }) => any,
  width?: string | number
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
      const Cell = item.Cell || (row => <TableCell align={item.align}>{row.value}</TableCell>)
      let newItem = { ...item, Cell }

      if (item.percent && typeof item.accessor === 'string') {
        const key = item.accessor
        const accessor = (d: T) => {
          const value = d[key]
          if (typeof value !== 'number') {
            return value
          }

          return (value * 100).toFixed(1) + '%'
        }
        return { ...newItem, id: key, accessor }
      }

      return newItem
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
