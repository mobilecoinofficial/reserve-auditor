import React, { useState } from 'react'
import { Container, Toolbar, Collapse } from '@mui/material'

import Header from './Header'
import TopContent from './TopContent'
import MintsAndBurns from './MintsAndBurns'
import useMintsAndBurns from '../api/hooks/useMintsAndBurns'

export default function Layout() {
  const { sortedData, ...rest } = useMintsAndBurns()
  const [renderTopContent, setRenderTopContent] = useState(true)

  return (
    <Container maxWidth="lg">
      <Header />
      <Toolbar />
      <Collapse in={renderTopContent} timeout={1000}>
        <TopContent {...rest} />
      </Collapse>
      <MintsAndBurns
        data={sortedData}
        renderTopContent={renderTopContent}
        setRenderTopContent={setRenderTopContent}
      />
    </Container>
  )
}
