import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a custom color palette
const palette = {
  primary: {
    main: '#2c6e8e',
    light: '#4b9aaa',
    dark: '#1c4d64',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8e0e2c',
    light: '#b23d54',
    dark: '#6a0921',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8fbfd',
    paper: '#ffffff',
  },
  text: {
    primary: '#2c353d',
    secondary: '#607d8b',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
};

// Create the base theme
let theme = createTheme({
  palette,
  typography: {
    fontFamily: 'var(--font-geist-sans)',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          padding: '8px 24px',
        },
        outlined: {
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Make fonts responsive
theme = responsiveFontSizes(theme);

export default theme;
