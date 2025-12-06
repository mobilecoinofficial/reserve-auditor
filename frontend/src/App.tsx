import React from 'react'
import { CssBaseline, ThemeProvider, Theme, StyledEngineProvider } from '@mui/material';

import theme from './theme'
import { GnosisSafeProvider } from './contexts'
import Layout from './components/Layout'


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


export const App = () => {
  return (
    <GnosisSafeProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <Layout />
        </ThemeProvider>
      </StyledEngineProvider>
    </GnosisSafeProvider>
  );
}
