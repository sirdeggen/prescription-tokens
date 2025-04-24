"use client"
import { Drawer, Paper, Typography, Stack, Box, Chip, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { Submission } from '../app/page';

const SubmissionsLog: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  if (submissions.length === 0) {
    return null
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
            Prescription Blockchain Records
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {submissions.toSorted((a, b) => new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime()).map((entry) => {
          // Determine what kind of data to display based on the step
          let displayText = '';
          if (entry.step === 'Create Prescription' && entry.data.medication) {
            displayText = `${entry.data.medication.medicationName} ${entry.data.medication.dosage} | ${entry.data.medication.quantity} units`;
          } else if (entry.step === 'Collect Medication' && entry.data.pharmacy) {
            displayText = `Dispensed by ${entry.data.pharmacy.name}`;
          }
          
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
              <Chip 
                label={entry.step} 
                size="small"
                sx={{ 
                  backgroundColor: entry.step === 'Create Prescription' ? '#e1f0f5' : '#e8f4f8',
                  color: entry.step === 'Create Prescription' ? '#2c6e8e' : '#4b9aaa',
                  fontWeight: 500,
                  minWidth: '160px'
                }} 
              />
              <Box sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography variant="body2" noWrap>{displayText}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', minWidth: '120px' }}>
                <Typography variant="caption" sx={{ color: '#607d8b' }}>
                  {new Date(entry.data.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', maxWidth: '100px' }}>
                <Typography variant="caption" sx={{ color: '#607d8b' }}>
                  {entry.txid.substring(0, 8)}...
                </Typography>
              </Box>
            </Stack>
          )
        })}
      </Paper>
    </Drawer>
  )
}

export default SubmissionsLog