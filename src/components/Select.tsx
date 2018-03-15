import * as React from 'react'
import { css } from 'emotion'
import ReactSelect from 'react-select'
import { monospace } from '../layout'

import 'react-select/dist/react-select.css'

const selectClassName = css`
  font-family: ${monospace};
  font-size: 12px;

  & .Select-control {
    border-radius: 0;
  }
`

interface SelectProps {
  value: string,
  options: { value: string, label: string}[],
  onChange: (item: { value: string, label: string}) => void,
  name?: string,
}

const Select = (props: SelectProps) => (
  <ReactSelect
    {...props}
    className={selectClassName}
    clearable={false}
    searchable={false}
  />
)

export default Select
