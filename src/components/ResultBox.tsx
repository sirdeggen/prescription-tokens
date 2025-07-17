import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper, Divider, Chip, Tooltip, useTheme } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VerifiedIcon from '@mui/icons-material/Verified';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Token } from '../components/types';

interface ResultBoxProps {
  entry: Token | null,
}

interface ArcResponse {
  txStatus: string
}

const ResultBox: React.FC<ResultBoxProps> = ({ entry: startingData }) => {
  const [arcData, setArcData] = useState<ArcResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null);
  const theme = useTheme();

  const getStatus = async () => {
    if (!startingData?.txid) return;
    const res = await (await fetch('https://arc.gorillapool.io/v1/tx/' + startingData.txid)).json()
    setArcData(res)
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const flatJSON = (obj: any, parentKey = '') => {
    const result: any = {}
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(result, flatJSON(obj[key], parentKey + (parentKey ? '.' : '') + key))
      } else {
        result[parentKey + (parentKey ? '.' : '') + key] = obj[key]
      }
    }
    return result
  }

  const entry = startingData ? flatJSON(startingData.data) : null;

  if (!startingData) {
    return <Box sx={{ 
      flex: 1,
      height: 200, 
      border: '1px dashed rgba(44, 110, 142, 0.25)', 
      borderRadius: 3, 
      p: 3, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'rgba(248, 251, 253, 0.6)',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.3s ease',
    }}>
      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Aún no hay datos para mostrar
      </Typography>
    </Box>
  }

  return (
    <Paper 
      elevation={3} 
      onClick={getStatus} 
      sx={{ 
        flex: 1,
        overflow: 'hidden', 
        position: 'relative', 
        borderRadius: 3,
        p: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderLeft: `4px solid ${startingData?.txid ? theme.palette.primary.main : theme.palette.grey[400]}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocalHospitalIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Registro de Receta
        </Typography>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Tooltip title="Actualizar estado">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              getStatus();
            }}
            aria-label="refresh" 
            sx={{ 
              color: theme.palette.primary.light,
              backgroundColor: 'rgba(44, 110, 142, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(44, 110, 142, 0.15)'
              }
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {entry && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {Object.keys(entry).map((key) => (
            <Box 
              key={key} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',  
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'rgba(248, 251, 253, 0.8)'
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 600, 
                  mr: 2,
                  fontSize: '0.85rem'
                }}
              >
                {key}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.primary,
                    fontSize: '0.85rem'
                  }}
                >
                  {entry[key as keyof Token]}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {startingData.txid && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1,
                mt: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(44, 110, 142, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(44, 110, 142, 0.1)'
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                txid
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '70%' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.primary,
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.85rem'
                  }}
                >
                  {startingData.txid}
                </Typography>
                <Tooltip title={copied === 'txid' ? "¡Copiado!" : "Copiar al portapapeles"}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(startingData.txid || '', 'txid');
                    }}
                    sx={{ 
                      ml: 1, 
                      color: copied === 'txid' ? theme.palette.success.main : theme.palette.grey[400],
                      padding: '2px'
                    }}
                  >
                    {copied === 'txid' ? <VerifiedIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Box>
      )}
    
      {arcData && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
              Verificación en Blockchain
            </Typography>
            
            <Chip 
              label={!arcData?.txStatus ? 'Pendiente' : arcData?.txStatus} 
              size="small"
              color={!arcData?.txStatus ? 'warning' : 'success'}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
      )}
      
      {startingData?.txid && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Tooltip title="Ver en Whatsonchain">
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://whatsonchain.com/tx/${startingData.txid}`, '_blank');
              }}
              sx={{ 
                color: theme.palette.primary.light,
                backgroundColor: 'rgba(44, 110, 142, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(44, 110, 142, 0.15)'
                }
              }}
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  )
}

export default ResultBox
