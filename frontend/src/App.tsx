import React from 'react'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { Header } from './layout/Header'
import { AuditList } from './layout/AuditList'
import { Balances } from './layout/Balances'
import { GnosisSafeProvider } from './contexts'

let bg_color = "#004e80" // mainnet background color is a shade of blue
if (typeof MC_NETWORK  !== 'undefined') {
  if (MC_NETWORK == 'testnet') {
    bg_color = "#774e80" // testnet background color is lavender
  }
}

export const App = () => {
  const theme = createTheme({
    palette: {
      primary: {
        // mobilecoin blue
        light: '#0c90e6',
        main: '#027cfd',
        dark: '#0082d6',
        contrastText: '#fff',
      },
      secondary: {
        // mobilecoin grayscale
        main: '#f0f0f0',
        light: '#fff',
        dark: '#000',
        contrastText: '#000',
      },
    },
  })

  return (
    <GnosisSafeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: `${bg_color}`
          }}
        >
          <Header />
          <Balances />
          <AuditList />
        </Box>
      </ThemeProvider>
    </GnosisSafeProvider>
  )
}
