import { Box } from '@mui/material'
import React, { FC } from 'react'
import { GnosisSafe } from '../components/GnosisSafe'
import { LedgerBalance } from '../components/LedgerBalance'

export const Balances: FC = () => {
  const containerStyle = {
    margin: 1,
    minWidth: '150px',
    minHeight: '50px',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 1,
  }
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        gap: 1,
      }}
    >
      <Box sx={containerStyle}>
        <LedgerBalance />
      </Box>
      <Box sx={containerStyle}>
        <GnosisSafe />
      </Box>
    </Box>
  )
}
