"use client"
import { Drawer, Paper, Typography, Stack, Box, Chip, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { getAllSubmissions } from '../utils/db';
import { useEffect, useState } from 'react';
import { Token } from '../app/page';

const SubmissionsLog: React.FC<{ change: boolean, setPrescription: (token: Token | null) => void }> = ({ change, setPrescription }) => {
  const [tokens, setTokens] = useState<Token[]>([])

  useEffect(() => {
    if (!change) getAllSubmissions().then(tokens => {
      setTokens(tokens)
      setPrescription(tokens[tokens.length - 1])
    })
  }, [change])

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
            // Determine what kind of data to display based on the step
            // Display patient name and medication details
            let displayText = `${entry.data.paciente?.nombre ?? 'Paciente'}: ${entry.data.medicamento?.nombreMedicamento ?? ''} ${entry.data.medicamento?.dosis ?? ''} | ${entry.data.medicamento?.cantidad ?? ''} unidades`;
            
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
                  <Box sx={{ textAlign: 'right', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" sx={{ color: '#607d8b' }}>
                      {entry.txid}
                    </Typography>
                  </Box>
                )}
              </Stack>
            );
          })}
      </Paper>
    </Drawer>
  );
};

export default SubmissionsLog;