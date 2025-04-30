"use client"
import React, { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Backdrop } from '@mui/material';
import CreatePrescriptionCard from '../components/stages/CreatePrescriptionCard';
import ResultBox from '../components/ResultBox';
import SubmissionsLog from '@/components/SubmissionsLog';
import PresentPrescriptionCard from '@/components/stages/PresentPrescriptionCard';
import DispensePrescriptionCard from '@/components/stages/DispensePrescriptionCard';
import AcknowledgeReceiptCard from '@/components/stages/AcknowledgeReceiptCard';
import { Token } from '@/components/types';
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { clearAllSubmissions } from "@/utils/db";

const App: React.FC = () => {
  const [prescription, setPrescription] = useState<Token | null>(null)
  const [presentation, setPresentation] = useState<Token | null>(null)
  const [dispensation, setDispensation] = useState<Token | null>(null)
  const [acknowledgement, setAcknowledgement] = useState<Token | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const boxSx = {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    flexDirection: { xs: 'column', md: 'row' }
  };

  const cardSx = {
    width: { xs: '100%', sm: '100%', md: '50%', lg: '40%' },
    minWidth: { md: '350px' },
    flexShrink: 0
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 10, pb: 40, bgcolor: '#f8fbfd' }}>
      <IconButton
        onClick={async () => {
          await clearAllSubmissions();
          window.location.reload();
        }}
        style={{ position: "absolute", top: 24, right: 24, color: "white", backgroundColor: "#8e0e2c", borderRadius: "50%", height: "40px", width: "40px" }}
        aria-label="Reset all submissions"
      >
        <DeleteIcon />
      </IconButton>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'rgba(0,0,0,0.7)',
          p: 3,
          borderRadius: 2
        }}>
          <CircularProgress color="primary" />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Processing...
          </Typography>
        </Box>
      </Backdrop>
      <Typography variant="h4" align="center" color="#2c6e8e" gutterBottom sx={{ py: 5, fontWeight: 'bold', textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>
        Medical Prescription Blockchain Demo
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
      <SubmissionsLog 
        change={isSubmitting} 
        setPrescription={setPrescription} 
        setPresentation={setPresentation} 
        setDispensation={setDispensation}
        setAcknowledgement={setAcknowledgement}
      />
    </Container>
  );
};

export default App;
