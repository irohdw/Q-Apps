import { createTheme } from '@mui/material/styles';

const commonThemeOptions = {
  typography: {
    fontFamily: [
      'Mulish',
      'Copse',
      'Cambon Light',
      'Raleway, sans-serif',
      'Karla',
      'Merriweather Sans',
      'Montserrat',
      'Proxima Nova',
      'Oxygen',
      'Catamaran',
      'Cairo',
      'Arial',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '23px',
      fontFamily: 'Raleway',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
    },

    body2: {
      fontSize: '18px',
      fontFamily: 'Raleway, Arial',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.2px',
    },
    margin: 0,
  },
  spacing: 8,
  shape: {
    borderRadius: 4,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: 'inherit',
          transition: 'filter 0.3s ease-in-out',
          '&:hover': {
            filter: 'brightness(1.1)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
    },
  },
};

const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#34BFA6',
      dark: '#2c9d88',
      light: '#A9D9D0',
    },
    secondary: {
      main: '#57AAF2',
      dark: '#2E83F2',
    },
    background: {
      default: '#ffffff',
      paper: '#F2F2F2',
    },
    text: {
      primary: '#000000',
      secondary: '#525252',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'body::-webkit-scrollbar-track': {
          backgroundColor: '#ffffff',
        },
        'body::-webkit-scrollbar-track:hover': {
          backgroundColor: '#ffffff',
        },
        'body::-webkit-scrollbar': {
          width: '16px',
          height: '10px',
          backgroundColor: '#ffffff',
        },
        'body::-webkit-scrollbar-thumb': {
          backgroundColor: '#34BFA6',
          borderRadius: '8px',
          backgroundClip: 'content-box',
          border: '4px solid transparent',
          transition: 'all 0.3s ease-in-out',
        },
        'body::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#2c9d88',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;',
          borderRadius: '8px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            cursor: 'pointer',
            boxShadow:
              'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;',
          },
        },
      },
    },
    MuiIcon: {
      defaultProps: {
        style: {
          color: '#000000',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#6B6FBF',
      dark: '#5a5da7',
      light: '#979be0',
    },
    secondary: {
      main: '#F2A74B',
    },

    background: {
      default: '#1C1A26',
      paper: '#434259',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'body::-webkit-scrollbar-track': {
          backgroundColor: '#1C1A26',
        },
        'body::-webkit-scrollbar-track:hover': {
          backgroundColor: '#1C1A26',
        },
        'body::-webkit-scrollbar': {
          width: '16px',
          height: '10px',
          backgroundColor: '#1C1A26',
        },
        'body::-webkit-scrollbar-thumb': {
          backgroundColor: '#6B6FBF',
          borderRadius: '8px',
          backgroundClip: 'content-box',
          border: '4px solid transparent',
          transition: 'all 0.3s ease-in-out',
        },
        'body::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#5a5da7',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: '8px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            cursor: 'pointer',
            boxShadow:
              ' 0px 3px 4px 0px hsla(0,0%,0%,0.14), 0px 3px 3px -2px hsla(0,0%,0%,0.12), 0px 1px 8px 0px hsla(0,0%,0%,0.2);',
          },
        },
      },
    },
    MuiIcon: {
      defaultProps: {
        style: {
          color: '#ffffff',
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
