import * as React from 'react'
import styled from 'react-emotion'

const Diff = styled('span')`
  color: #ccc;

  &.plus {
    color: #00f;
    :before {
      content: "+";
    }
  }

  &.minus {
    color: #f00;
  }
`

type NumberFormatter = (n: number) => any
interface NumberDiffProps { diff: number, formatter?: NumberFormatter }

const NumberDiff = ({ diff, formatter }: NumberDiffProps) => {
  const f = formatter || (n => n)

  let className = ''
  if (diff > 0) {
    className = 'plus'
  } else if (diff < 0) {
    className = 'minus'
  }

  return <Diff className={className}>{f(diff)}</Diff>
}

export default NumberDiff
