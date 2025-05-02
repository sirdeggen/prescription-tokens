import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.tsx'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { BroadcastProvider } from './context/broadcast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BroadcastProvider>
        <CssBaseline />
        <App />
      </BroadcastProvider>
    </ThemeProvider>
  </StrictMode>,
)
