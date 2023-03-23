import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      light: '#757575',
      dark: '#000000',
      contrastText: 'white',
    },
    warning: {
      main: '#ffa726',
    },
    background: {
      default: '#faf8f6',
    },
  },
  typography: {
    fontFamily: 'Sohne-Buch',
  },
})
export default theme
