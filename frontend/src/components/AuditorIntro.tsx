import React from 'react'
import { Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledCard = styled(Card)(() => ({
  boxShadow: 'none',
  border: 'none`',
  backgroundColor: 'inherit',
  paddingTop: 16,
  paddingBottom: 16,
}))

// TODO: links to MC and reserve
export default function AuditorInfo() {
  return (
    <StyledCard>
      <Typography gutterBottom variant="h5" component="div">
        Auditor Info
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        The proof of reserve is on-chain, which shows the 1:1 between minted
        eUSD tokens and eUSD stored by the custodian multisig. When eUSD
        LP&rsquos redeem their tokens for eUSD, the tokens are burned. The
        minting and burning of tokens is in turn tracked and verifiable on the
        relevant blockchain.
      </Typography>
      <Typography variant="body2">
        A collaboration between the teams at Reserve and MobileCoin
      </Typography>
    </StyledCard>
  )
}
