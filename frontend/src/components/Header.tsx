import React from 'react'
import { AppBar, Container, Toolbar, Typography, Box } from '@mui/material'
import MobileCoinLogo from './MobileCoinLogo'

export default function Header() {
  return (
    <AppBar>
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
              MobileCoin Electronic Dollar Auditor
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
