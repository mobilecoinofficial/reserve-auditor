import React, { FC, ReactElement } from 'react'
import { Box, Container, Toolbar, Typography } from '@mui/material'
import { eUSDIcon } from '../components/icons'

let net_name = '' // network name prefix for the header, blank for mainnet.
if (typeof MC_NETWORK !== 'undefined') {
  // env variable set in webpack.<net>.js.
  if (MC_NETWORK == 'testnet') {
    net_name = 'TestNet'
  }
}

export const Header: FC = (): ReactElement => {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100px',
          background:
            'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 100%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Toolbar disableGutters>
            {eUSDIcon('#fff')}
            <Typography
              variant="h4"
              noWrap
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                color: 'primary.contrastText',
                paddingLeft: 2,
              }}
            >
              {net_name} MobileCoin / Reserve Electronic Dollar (eUSD) Auditor
            </Typography>
          </Toolbar>
        </Container>
      </Box>
    </>
  )
}
