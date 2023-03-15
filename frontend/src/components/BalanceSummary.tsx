import React from 'react'
import { Box, Typography, Link } from '@mui/material'

import useLedgerBalance from '../api/hooks/useLedgerBalance'
import useSafeBalance from '../api/hooks/useSafeBalance'

// TODO: link for reserve safe
export default function MCeUSDBalance() {
  const ledgerBalance = useLedgerBalance()
  const safeBalance = useSafeBalance()

  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      justifyContent="space-between"
      sx={{ paddingTop: 2, paddingBottom: 2 }}
    >
      <Box>
        <Typography variant="subtitle1" color="textSecondary">
          eUSD on the MobileCoin Network
        </Typography>
        <Typography variant="h4" gutterBottom>
          {ledgerBalance?.totalSupply}
        </Typography>
        <Box display="flex">
          <Typography color="textSecondary" sx={{ marginRight: 1 }}>
            Minted:
          </Typography>
          <Typography color="textSecondary">
            {ledgerBalance?.totalMinted}
          </Typography>
        </Box>
        <Box display="flex">
          <Typography color="textSecondary" sx={{ marginRight: 1 }}>
            Burned:
          </Typography>
          <Typography color="textSecondary">
            {ledgerBalance?.totalBurned}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography color="textSecondary">
          eUSD in the <Link href="/">Reserve Safe</Link>
        </Typography>
        <Typography variant="h4" sx={{ marginBottom: 2 }}>
          {safeBalance}
        </Typography>
      </Box>
    </Box>
  )
}
