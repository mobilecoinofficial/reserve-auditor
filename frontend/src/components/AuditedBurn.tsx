import { PriceCheck } from '@mui/icons-material'
import { Box } from '@mui/material'
import React, { FC } from 'react'
import { TAuditedBurn } from '../types'
import { Withdrawal } from './Withdrawal'
import { Burn } from './Burn'

type TProps = {
  auditedBurn: TAuditedBurn
}

export const AuditedBurn: FC<TProps> = ({ auditedBurn }: TProps) => {
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
      <Burn {...auditedBurn.burn} />
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
      <Withdrawal withdrawal={auditedBurn.withdrawal} />
    </Box>
  )
}
