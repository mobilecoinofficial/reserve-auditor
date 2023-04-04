import React, { useState } from 'react'
import { Container, Toolbar, Collapse } from '@mui/material'

import Header from './Header'
import TopContent from './TopContent'
import AuditDataTable from './AuditDataTable'
import useTableData from '../api/hooks/useTableData'

export default function Layout() {
  const { sortedData, ...rest } = useTableData()
  const [renderTopContent, setRenderTopContent] = useState(true)

  return (
    <Container maxWidth="lg">
      <Header />
      <Toolbar />
      <Collapse in={renderTopContent} timeout={1000}>
        <TopContent {...rest} />
      </Collapse>
      <AuditDataTable
        data={sortedData}
        renderTopContent={renderTopContent}
        setRenderTopContent={setRenderTopContent}
      />
    </Container>
  )
}
