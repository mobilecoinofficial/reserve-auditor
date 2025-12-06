import { createTheme, adaptV4Theme } from '@mui/material/styles';

const theme = createTheme(adaptV4Theme({
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
    icon: {
      burnTx: '#CD5B5B',
    }
  },
  typography: {
    fontFamily: 'Sohne-Buch',
  },
}))

export default theme
