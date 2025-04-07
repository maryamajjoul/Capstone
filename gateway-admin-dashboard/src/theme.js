// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF914D', // <-- Orange for the sidebar
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#737373', // <-- Grey for the main content background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111111',
      secondary: '#64748B',
    },
  },
});

export default theme;
