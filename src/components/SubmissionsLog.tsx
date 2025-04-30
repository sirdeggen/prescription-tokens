"use client"
import { Drawer, Paper, Typography, Stack, Box, Divider, IconButton } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { getAllSubmissions } from '../utils/db';
import { useEffect, useState } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import { Token } from '../components/types';

interface SubmissionLogProps { 
  change: boolean; 
  setPrescription: (token: Token | null) => void;
  setPresentation: (token: Token | null) => void;
  setDispensation: (token: Token | null) => void;
  setAcknowledgement: (token: Token | null) => void;
}

const SubmissionsLog: React.FC<SubmissionLogProps> = ({ change, setPrescription, setPresentation, setDispensation, setAcknowledgement }) => {
  const [tokens, setTokens] = useState<Token[]>([])

  useEffect(() => {
    if (!change) getAllSubmissions().then(tokens => {
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
  }, [change, getAllSubmissions])

  if (!tokens || tokens.length === 0) {
    return null;
  }

  return (
    <Drawer
      anchor="bottom"
      open={true}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          height: 'auto',
          maxHeight: '30vh',
          overflowY: 'auto',
          backgroundColor: '#f8fbfd',
          borderTop: '3px solid #2c6e8e'
        }
      }}
    >
      <Paper sx={{ 
        p: 3, 
        m: 1, 
        maxHeight: '20vh', 
        overflowY: 'auto',
        boxShadow: 'none',
        backgroundColor: 'transparent'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalHospitalIcon sx={{ mr: 1, color: '#2c6e8e' }} />
          <Typography variant="h6" sx={{ color: '#2c6e8e', fontWeight: 600 }}>
            Registros de Recetas en Blockchain
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {tokens
          .slice() // Create a copy to avoid mutating the original array
          .sort((a, b) => 
            new Date(b.data.timestamp || 0).getTime() - 
            new Date(a.data.timestamp || 0).getTime()
          )
          .map((entry) => {
            // displayText ought to be the id of the prescription data.id and the timestamp in Locale format
            const displayText = `${entry?.status ?? entry?.data?.status} - ${entry?.spent ? 'spent' : 'unspent'} - ${entry.data.id} - ${new Date(entry.data.timestamp).toLocaleString()}`
            
            return (
              <Stack
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  mb: 1.5, 
                  borderRadius: 1, 
                  '&:hover': {
                    backgroundColor: '#eef7fa',
                  }
                }}
                direction="row"
                key={entry.txid}
                spacing={2}
                alignItems="center"
                className='log-entry'
              >
                <Box sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography variant="body2" noWrap>{displayText}</Typography>
                </Box>
                {entry.data?.timestamp && (
                  <Box sx={{ textAlign: 'right', minWidth: '120px' }}>
                    <Typography variant="caption" sx={{ color: '#607d8b' }}>
                      {new Date(entry.data.timestamp).toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                )}
                {entry.txid && (
                  <><Box sx={{ textAlign: 'right', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" sx={{ color: '#607d8b' }}>
                      {entry.txid}
                    </Typography>
                  </Box>
                  <IconButton
                    href={`https://whatsonchain.com/tx/${entry.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="open in whatsonchain"
                    size="small"
                  >
                    <LinkIcon fontSize="small" sx={{ color: '#607d8b' }} />
                  </IconButton>
                  </>
                )}
              </Stack>
            );
          })}
      </Paper>
    </Drawer>
  );
};

export default SubmissionsLog;