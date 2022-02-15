import React from 'react'

interface Props {
  bar?: string
}

const Component: React.FC<Props> = (props) => {
  const { bar } = props

  return <div>{bar}</div>
}

export default Component
