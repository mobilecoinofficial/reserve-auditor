import React from 'react'
import { Container, Toolbar, Grid } from '@mui/material'

import Header from '../components/Header'
import TopContent from '../components/TopContent'
import MintsAndBurns from '../components/MintsAndBurns'
import BottomContent from '../components/BottomContent'
import useMintsAndBurns from '../api/hooks/useMintsAndBurns'

export default function Layout() {
  const { sortedData, ...rest } = useMintsAndBurns()

  return (
    <Container maxWidth="lg">
      <Header />
      <Toolbar />
      <Grid container>
        <Grid item xs={12}>
          <TopContent {...rest} />
        </Grid>
        <Grid item xs={12}>
          <MintsAndBurns data={sortedData} />
        </Grid>
      </Grid>
    </Container>
  )
}
