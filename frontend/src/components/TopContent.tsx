import React from 'react'
import { Grid } from '@mui/material'

import BalanceSummary from './BalanceSummary'
import AuditorInfo from './AuditorIntro'

export type TopContentData = {
  totalUnauditedDeposits: number
  totalUnauditedBurns: number
}

export default function TopContent({
  totalUnauditedDeposits,
  totalUnauditedBurns,
}: TopContentData) {
  return (
    <Grid container columnSpacing={8} paddingY={2} marginBottom={2}>
      <Grid item xs={12} md={6}>
        <BalanceSummary
          totalUnauditedDeposits={totalUnauditedDeposits}
          totalUnauditedBurns={totalUnauditedBurns}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <AuditorInfo />
      </Grid>
    </Grid>
  )
}
