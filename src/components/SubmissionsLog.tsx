import { Drawer, Paper, Typography, Stack, Box, IconButton, useTheme, Tooltip, Chip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { getAllSubmissions, clearAllSubmissions } from '../utils/db';
import { useEffect, useState } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from "@mui/icons-material/Delete";
import { Token } from '../components/types';
import { useBroadcast } from '../context/broadcast';

const SubmissionsLog: React.FC = () => {
  const { isSubmitting, setPrescription, setPresentation, setDispensation, setAcknowledgement } = useBroadcast()
  const [tokens, setTokens] = useState<Token[]>([])
  const [isMinimized, setIsMinimized] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!isSubmitting) getAllSubmissions().then(tokens => {
      setTokens(tokens)
      tokens.forEach(token => {
        if (token.spent) return
        switch (token.status) {
          case 'created':
            setPrescription(token)
            break;
          case 'presented':
            setPresentation(token)
            break;
          case 'dispensed':
            setDispensation(token)
            break;
          case 'acknowledged':
            setAcknowledgement(token)
            break;
          default:
            console.log({ unknownToken: token })
        }
      })
    })
  }, [isSubmitting, getAllSubmissions])

  const handleClearAll = async () => {
    await clearAllSubmissions();
    window.location.reload();
  };

  if (!tokens || tokens.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'created':
        return theme.palette.info.main;
      case 'presented':
        return theme.palette.warning.main;
      case 'dispensed':
        return theme.palette.success.main;
      case 'acknowledged':
        return theme.palette.primary.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'created':
        return 'Creada';
      case 'presented':
        return 'Presentada';
      case 'dispensed':
        return 'Dispensada';
      case 'acknowledged':
        return 'Confirmada';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={true}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          height: isMinimized ? '64px' : 'auto',
          maxHeight: isMinimized ? '64px' : '35vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: `3px solid ${theme.palette.primary.main}`,
          boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }
      }}
    >
      <Box sx={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(10px)',
        zIndex: 1,
        borderBottom: isMinimized ? 'none' : `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalHospitalIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
              Registros de Recetas en Blockchain
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {!isMinimized && (
              <Tooltip title="Borrar todos los registros">
                <IconButton 
                  onClick={handleClearAll} 
                  sx={{ 
                    color: "white", 
                    backgroundColor: theme.palette.secondary.main, 
                    borderRadius: "50%",
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isMinimized ? "Expandir" : "Minimizar"}>
              <IconButton 
                onClick={() => setIsMinimized(!isMinimized)} 
                sx={{ 
                  color: theme.palette.primary.main,
                  backgroundColor: 'rgba(44, 110, 142, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(44, 110, 142, 0.15)'
                  }
                }}
              >
                {isMinimized ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {!isMinimized && (
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mx: { xs: 1, md: 2 },
          my: 2, 
          maxHeight: 'calc(35vh - 70px)', 
          overflowY: 'auto',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          '::-webkit-scrollbar': {
            width: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
          },
          '::-webkit-scrollbar-thumb': {
            background: 'rgba(44, 110, 142, 0.2)',
            borderRadius: '8px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(44, 110, 142, 0.4)',
          }
        }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              Historial completo de transacciones registradas en el blockchain
            </Typography>
          </Box>
          
          {tokens
            .slice()
            .sort((a, b) => 
              new Date(b.data.timestamp || 0).getTime() - 
              new Date(a.data.timestamp || 0).getTime()
            )
            .map((entry) => {
              const status = entry?.status ?? entry?.data?.status;
              
              return (
                <Stack
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    mb: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(248, 251, 253, 1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }
                  }}
                  direction="row"
                  key={entry.txid}
                  spacing={2}
                  alignItems="center"
                  className='log-entry'
                >
                  {entry.data?.timestamp && (
                    <Box sx={{ minWidth: '110px' }}>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(entry.data.timestamp).toLocaleString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, minWidth: '100px' }}>
                    <Chip 
                      label={getStatusLabel(status)} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${getStatusColor(status)}20`,
                        color: getStatusColor(status),
                        fontWeight: 600,
                        borderRadius: '4px',
                      }}
                    />
                    {entry?.spent && (
                      <Chip 
                        label="Gastada" 
                        size="small"
                        sx={{ 
                          backgroundColor: `${theme.palette.info.main}20`,
                          color: theme.palette.info.main,
                          fontWeight: 600,
                          borderRadius: '4px',
                        }}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography variant="body2" sx={{
                      fontSize: '0.8rem',
                    }} noWrap>
                      {entry.data.id}
                    </Typography>
                  </Box>
                  
                  {entry.txid && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        maxWidth: { xs: '80px', sm: '120px', md: '200px' }, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem',
                        }}>
                          {entry.txid}
                        </Typography>
                      </Box>
                      <Tooltip title="Ver en whatsonchain">
                        <IconButton
                          href={`https://whatsonchain.com/tx/${entry.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="open in whatsonchain"
                          size="small"
                          sx={{ 
                            ml: 1,
                            color: theme.palette.primary.light,
                            '&:hover': {
                              color: theme.palette.primary.main,
                            }
                          }}
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {entry.status === 'acknowledged' && !entry.spent && (
                        <Tooltip title="Verificado">
                          <VerifiedIcon fontSize="small" sx={{ ml: 1, color: theme.palette.success.main }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Stack>
              );
            })}
        </Paper>
      )}
    </Drawer>
  );
};

export default SubmissionsLog;