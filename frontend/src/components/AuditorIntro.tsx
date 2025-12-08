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
        This proof of reserve is on-chain and shows the 1:1 relationship between
        wrapped eUSD tokens on the MobileCoin blockchain and eUSD ERC20 tokens
        stored in the custodian multisig. When eUSD LPs redeem their wrapped
        eUSD for eUSD ERC20 tokens, the wrapped eUSD is burned. Minting and
        burning of wrapped eUSD is tracked and verifiable on the MobileCoin
        blockchain, while in turn deposits and withdrawals from the custodian
        multisig are tracked and verifiable on the Ethereum blockchain.
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
              underline="hover">
              Reserve
            </Link>{' '}
            and{' '}
            <Link
              href="https://mobilecoin.com/"
              target="_blank"
              rel="noreferrer"
              underline="hover">
              MobileCoin
            </Link>{' '}
            ✌️
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
