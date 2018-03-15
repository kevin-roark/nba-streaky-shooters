import * as React from 'react'
import styled from 'react-emotion'
import { css } from 'emotion'
import { monospace } from '../layout'

const statusTextStyles = css`
  position: fixed;
  z-index: 100;
  padding: 20px;
  border: 2px solid #000;
  font-family: ${monospace};
  font-size: 24px;
`

const Loading = styled('div')`
  ${statusTextStyles};
  bottom: 0;
  right: 0;
  background-color: #ff0;
  color: #000;
`

const ErrorMessage = styled('div')`
  ${statusTextStyles};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f00;
  color: #fff;
`

interface DataStatusProps {
  loading: boolean,
  loadError: string | null,
  data: object | null
}

const DataStatus = ({ loading, loadError, data }: DataStatusProps) => {
  if (loading) {
    return <Loading>Loading...</Loading>
  }

  if (!loading && (loadError || !data)) {
    return <ErrorMessage>Error. {loadError ? `${loadError}.` : null} Please try refreshing the page.</ErrorMessage>
  }

  return null
}

export default DataStatus
