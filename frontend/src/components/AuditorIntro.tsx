import React from 'react'
import { Box, Typography, Link } from '@mui/material'

export default function AuditorInfo() {
  return (
    <Box
      paddingY={2}
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Typography gutterBottom variant="h5" component="div">
        Auditor Info
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        The proof of reserve is on-chain, which shows the 1:1 between minted
        WBTC tokens and eUSD stored by the custodian multisig. When eUSD LP’s
        redeem their tokens for eUSD, the tokens are burned. The minting and
        burning of tokens is in turn tracked and verifiable on the relevant
        blockchain.
      </Typography>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Typography variant="body2">
          A collaboration between the teams at{' '}
        </Typography>
        <Box>
          <Typography variant="body2">
            <Link
              href="https://reserve.org/en/"
              target="_blank"
              rel="noreferrer"
            >
              Reserve
            </Link>{' '}
            and{' '}
            <Link
              href="https://mobilecoin.com/"
              target="_blank"
              rel="noreferrer"
            >
              MobileCoin
            </Link>{' '}
            ✌️
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
