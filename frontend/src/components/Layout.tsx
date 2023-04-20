import React from 'react'
import { Container, Toolbar } from '@mui/material'

import Header from './Header'
import TopContent from './TopContent'
import AuditDataTable from './AuditDataTable'
import useTableData from '../api/hooks/useTableData'

export default function Layout() {
  const { sortedData, ...rest } = useTableData()

  return (
    <Container maxWidth="lg">
      <Header />
      <Toolbar />
      <TopContent {...rest} />
      <AuditDataTable data={sortedData} />
    </Container>
  )
}
