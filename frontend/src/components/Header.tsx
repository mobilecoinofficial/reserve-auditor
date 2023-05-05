import React from 'react'
import { AppBar, Container, Toolbar, Typography, Box } from '@mui/material'
import MobileCoinLogo from './MobileCoinLogo'
import isTestnet from '../utils/isTestnet'

export default function Header() {
  const headerText = isTestnet()
    ? 'Testnet Electronic Dollar Auditor'
    : 'MobileCoin Electronic Dollar Auditor'

  const background = isTestnet()
    ? 'linear-gradient(to right, #7C5EE4, black 90%);'
    : null

  return (
    <AppBar sx={{ background }}>
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{ color: 'white', textDecoration: 'none' }}
          >
            <MobileCoinLogo />
            <Typography
              variant="h5"
              noWrap
              sx={{
                flexGrow: 1,
                display: { xs: 'none', sm: 'block' },
                marginLeft: 1,
              }}
            >
              {headerText}
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
