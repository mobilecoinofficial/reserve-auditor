import { PriceCheck } from '@mui/icons-material'
import { Box } from '@mui/material'
import React, { FC } from 'react'
import { TAuditedMint } from '../types'
import { Deposit } from './Deposit'
import { Mint } from './Mint'

type TProps = {
  auditedMint: TAuditedMint
}

export const AuditedMint: FC<TProps> = ({ auditedMint }: TProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        boxShadow:
          'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
        margin: '5px 5px 10px',
      }}
    >
      <Deposit deposit={auditedMint.deposit} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            borderRadius: '50%',
            height: 30,
            width: 30,
            backgroundColor: '#12a312',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <PriceCheck
            sx={{
              color: 'secondary.light',
              margin: 'auto',
            }}
          />
        </Box>
      </Box>
      <Mint {...auditedMint.mint} />
    </Box>
  )
}
