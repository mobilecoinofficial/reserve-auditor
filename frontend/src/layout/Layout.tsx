import React from 'react'
import { Container, Toolbar, Grid } from '@mui/material'

import Header from '../components/Header'
import TopContent from '../components/TopContent'
import MintsAndBurns from '../components/MintsAndBurns'
import BottomContent from '../components/BottomContent'

export default function Layout() {
  return (
    <Container maxWidth="lg">
      <Header />
      <Toolbar />
      <Grid>
        <Grid item xs={12}>
          <TopContent />
        </Grid>
        <Grid item xs={12}>
          <MintsAndBurns />
        </Grid>
        <Grid item xs={12}>
          <BottomContent />
        </Grid>
      </Grid>
    </Container>
  )
}
