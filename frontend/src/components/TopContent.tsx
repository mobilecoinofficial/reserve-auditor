import React from 'react'
import { Grid } from '@mui/material'

import BalanceSummary from './BalanceSummary'
import AuditorInfo from './AuditorIntro'

export default function TopContent() {
  return (
    <Grid container columnSpacing={8} paddingY={2}>
      <Grid item xs={12} md={6}>
        <BalanceSummary />
      </Grid>
      <Grid item xs={12} md={6}>
        <AuditorInfo />
      </Grid>
    </Grid>
  )
}
