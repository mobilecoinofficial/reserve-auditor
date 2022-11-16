import { Box, Tooltip, Typography } from '@mui/material'
import React, { FC } from 'react'
import { TBurn } from '../types'

const precision = 10 ** 6
const locale = 'en-US'
const localeOptions = {
  style: 'decimal',
  minimumFractionDigits: 2,
  currency: 'USD',
}

export const Burn: FC<TBurn> = (burn: TBurn) => {
  const style: React.CSSProperties = {
    borderRadius: 1,
    padding: 1,
    margin: 1,
    boxShadow:
      'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em',
    width: '18vw',
  }

  const noWrapStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  return (
    <Box sx={style}>
      <Typography sx={{ fontWeight: 'bold' }}>MobileCoin eUSD Burn</Typography>
      <Box>
        amount:{' '}
        {(burn.amount / precision).toLocaleString(locale, localeOptions)} eUSD
      </Box>
      <Box>block index: {burn.blockIndex}</Box>
      <Tooltip title={`${burn.publicKeyHex}`} placement="bottom" arrow>
        <Box sx={noWrapStyle}>txo_pubkey: {burn.publicKeyHex}</Box>
      </Tooltip>
    </Box>
  )
}
