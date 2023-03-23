import React from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'

import theme from './theme'
import { GnosisSafeProvider } from './contexts'
import Layout from './layout/Layout'

export const App = () => {
  return (
    <GnosisSafeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Layout />
      </ThemeProvider>
    </GnosisSafeProvider>
  )
}
