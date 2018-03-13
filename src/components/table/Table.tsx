import * as React from 'react'
import styled from 'react-emotion'
import * as cx from 'classnames'
import ReactTable from 'react-table'
import { monospace } from '../../layout'
import { TableCell } from './TableCell'

import 'react-table/react-table.css'

type TableStyle = 'default' | 'minimal' | 'small'

const TableContainer = styled('div')`
  font-family: ${monospace};

  & *:focus {
    outline: 0;
  }

  & .ReactTable {
    border: 1px solid #eee;
    font-size: 15px;

    & .rt-th,
    & .rt-td {
      padding: 4px 8px;
    }

    & .rt-thead {
      & .rt-th {
        background-color: #f8f8f8;
        font-weight: 700;
      }

      &.-header {
        box-shadow: none;
      }
    }

    & .rt-tbody {
      & .rt-tr-group {
        border-top: 1px solid #eee;
        border-bottom: none;
      }
    }
  }

  &.minimal .ReactTable {
    border: none;

    & .rt-th,
    & .rt-td {
      padding: 2px 4px;
    }

    & .rt-thead {
      & .rt-th {
        background-color: transparent;
        border-bottom: 1px solid #000;
        border-right: 1px solid #ccc;

        &:first-child {
          border-right: 1px solid #000;
        }
      }
    }

    & .rt-tbody {
      & .rt-tr-group {
        border-top: none;
      }

      & .rt-td {
        border-right: 1px solid #ccc;

        &:first-child {
          border-right: 1px solid #000;
        }
      }
    }
  }

  &.small .ReactTable {
    font-size: 10px;
  }
`

export interface TableColumn<T> {
  Header: string | ((row: any) => React.ReactNode),
  id?: string,
  accessor: (keyof T) | ((data: any) => any),
  align?: 'left' | 'center' | 'right',
  Cell?: (row: { value: any, original: T, index: number }) => React.ReactNode,
  width?: string | number
}

export interface TableConfig {
  showPagination?: boolean,
  resizable?: boolean,
  defaultPageSize?: number,
  sortable?: boolean
}

interface TableProps<T> extends TableConfig {
  data: T[],
  columns: TableColumn<T>[],
  styles?: TableStyle[]
}

interface TableState {}

export class Table<T> extends React.Component<TableProps<T>, TableState> {
  render() {
    const { styles = [] } = this.props

    const defaultProps: TableConfig = {
      showPagination: false,
      resizable: false,
      sortable: styles.indexOf('minimal') < 0,
      defaultPageSize: this.props.data.length
    }

    const columns = this.props.columns.map(item => {
      const Cell = item.Cell || (row => <TableCell align={item.align}>{row.value}</TableCell>)
      let newItem = { ...item, Cell }

      return newItem
    })

    return (
      <TableContainer className={cx(styles)}>
        <ReactTable
          {...defaultProps}
          {...this.props}
          columns={columns}
          className={cx({'-highlight': styles.indexOf('minimal') < 0 })}
        />
      </TableContainer>
    )
  }
}

export default Table
