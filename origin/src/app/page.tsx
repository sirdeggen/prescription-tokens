import React, { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Backdrop, Paper } from '@mui/material';
import CreatePrescriptionCard from '../components/stages/CreatePrescriptionCard';
import ResultBox from '../components/ResultBox';
import SubmissionsLog from '@/components/SubmissionsLog';
import PresentPrescriptionCard from '@/components/stages/PresentPrescriptionCard';
import DispensePrescriptionCard from '@/components/stages/DispensePrescriptionCard';
import AcknowledgeReceiptCard from '@/components/stages/AcknowledgeReceiptCard';
import { Token } from '@/components/types';

const App: React.FC = () => {
  const [prescription, setPrescription] = useState<Token | null>(null)
  const [presentation, setPresentation] = useState<Token | null>(null)
  const [dispensation, setDispensation] = useState<Token | null>(null)
  const [acknowledgement, setAcknowledgement] = useState<Token | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const boxSx = {
    display: 'flex',
    gap: { xs: 3, md: 4 },
    alignItems: { xs: 'flex-start', md: 'center' },
    flexDirection: { xs: 'column', md: 'row' },
    mb: 4,
  };

  const cardSx = {
    width: { xs: '100%', md: '50%', lg: '40%' },
    minWidth: { md: '350px' },
    flexShrink: 0,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      pt: 10, 
      pb: 40, 
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%232c6e8e\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Container maxWidth="lg" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        zIndex: 1,
      }}>
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={isSubmitting}
        >
          <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.85)',
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(4px)'
          }}>
            <CircularProgress color="primary" size={48} thickness={4} />
            <Typography variant="h6" sx={{ mt: 3, color: 'white', fontWeight: 500 }}>
              Procesando transacción...
            </Typography>
          </Paper>
        </Backdrop>
        
        <Paper elevation={0} sx={{ 
          textAlign: 'center', 
          p: { xs: 3, md: 4 }, 
          my: 4, 
          background: 'linear-gradient(135deg, rgba(44, 110, 142, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(44, 110, 142, 0.1)',
          backdropFilter: 'blur(4px)'
        }}>
          <Typography variant="h4" color="primary.main" gutterBottom sx={{ 
            fontWeight: 700, 
            textShadow: '0 1px 2px rgba(0,0,0,0.05)',
            fontSize: { xs: '1.7rem', sm: '2rem', md: '2.125rem' }
          }}>
            Demostración de Recetas Médicas en Blockchain
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ 
            maxWidth: '800px', 
            mx: 'auto',
            mt: 1
          }}>
            Sistema seguro de gestión de recetas médicas utilizando tecnología blockchain
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={boxSx}>
            <Box sx={cardSx}><CreatePrescriptionCard outstanding={prescription ?? presentation ?? dispensation ?? acknowledgement} setPrescription={setPrescription} setIsSubmitting={setIsSubmitting} /></Box>
            <ResultBox entry={prescription} />
          </Box>
          <Box sx={boxSx}>
            <Box sx={cardSx}><PresentPrescriptionCard prescription={prescription} setPrescription={setPrescription} setPresentation={setPresentation} setIsSubmitting={setIsSubmitting} /></Box>
            <ResultBox entry={presentation} />
          </Box>
          <Box sx={boxSx}>
            <Box sx={cardSx}><DispensePrescriptionCard presentation={presentation} setPresentation={setPresentation} setDispensation={setDispensation} setIsSubmitting={setIsSubmitting} /></Box>
            <ResultBox entry={dispensation} />
          </Box>
          <Box sx={boxSx}>
            <Box sx={cardSx}><AcknowledgeReceiptCard dispensation={dispensation} setDispensation={setDispensation} setAcknowledgement={setAcknowledgement} setIsSubmitting={setIsSubmitting} /></Box>
            <ResultBox entry={acknowledgement} />
          </Box>
        </Box>
        <Box sx={{ mb: 50 }} />
      </Container>
      <SubmissionsLog 
        change={isSubmitting} 
        setPrescription={setPrescription} 
        setPresentation={setPresentation} 
        setDispensation={setDispensation}
        setAcknowledgement={setAcknowledgement}
      />
    </Box>
  );
};

export default App;
