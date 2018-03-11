import * as React from 'react'
import styled from 'react-emotion'

const ErrorHeader = styled('h2')`
  color: #f00;
`

const ErrorMessage = ({ message }: { message: string }) => (
  <ErrorHeader>{message}</ErrorHeader>
)

export default ErrorMessage
