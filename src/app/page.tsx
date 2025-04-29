"use client"
import React, { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Backdrop } from '@mui/material';
import CreatePrescriptionCard from '../components/stages/CreatePrescriptionCard';
import ResultBox from '../components/ResultBox';
import { Utils, PushDrop, Random, Transaction, CreateActionOutput, Hash } from '@bsv/sdk'
import SubmissionsLog from '@/components/SubmissionsLog';
import { saveSubmission } from '@/utils/db';
import prescriptions from '@/utils/prescriptions.json';
import { doctor, patient } from '@/utils/wallets';

export interface DataEntry {
  paciente?: {
    idPaciente: string;
    nombre: string;
    fechaNacimiento: string;
  };
  prescriptor?: {
    npiPrescriptor: string;
    nombre: string;
    clinica: string;
  };
  medicamento?: {
    nombreMedicamento: string;
    ndc: string;
    dosis: string;
    cantidad: number;
    recargas: number;
    instrucciones: string;
    fechaVencimiento: string;
  };
  farmacia?: {
    npiFarmacia: string;
    nombre: string;
    farmaceutico: string;
    fechaDispensacion: string;
  };
  timestamp: string;
  id: string;
  [key: string]: unknown;
}

export interface Token {
  data: DataEntry;
  txid: string;
  tx: Transaction;
}

export interface Submission {
  data: DataEntry;
  txid: string;
  step: string;
  arc: unknown;
}

const App: React.FC = () => {
  const [prescription, setPrescription] = useState<Token | null>(null)
  // const [collection, setCollection] = useState<Token | null>(null)
  // const [dispensation, setDispensation] = useState<Token | null>(null)
  // const [patientAcknowledgement, setPatientAcknowledgement] = useState<Token | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  



  /**
   * Simulates data by picking from the example data
   * @returns The simulated data
   */
  function simulateData(): DataEntry {
    const data = prescriptions[Math.floor(Math.random() * prescriptions.length)] as DataEntry
    data.timestamp = new Date().toISOString()
    data.id = Utils.toBase64(Random(8))
    return data
  }

  /**
   * Uses the BSV Blockchain to create a token capturing the data, timestamping it, 
   * and assigning ownership to the token.
   * 
   * @param data The data to be stored
   * @param step The step of the process
   * @returns The transaction ID and broadcast response
   */
  async function doctorCreatesPrescription() {
    try {
      setIsSubmitting(true)
      let outputs: CreateActionOutput[] | undefined = undefined
      const pushdrop = new PushDrop(doctor, 'https://prescription-tokens.vercel.app')
      const prescriptionData = simulateData()
      const jsonBlob = Utils.toArray(JSON.stringify(prescriptionData), 'utf8')
      const documentHash = Hash.sha256(jsonBlob)

      const { publicKey: patientIdentityKey } = await patient.getPublicKey({ identityKey: true })
      
      const lockingScript = await pushdrop.lock(
        [documentHash],
        [0, 'medical prescription'],
        prescriptionData.id,
        patientIdentityKey,
        false, 
        true,
        'after'
      )

      const action = await doctor.createAction({
        outputs: [{
          lockingScript: lockingScript.toHex(),
          satoshis: 3,
          outputDescription: 'medical prescription issuance',
        }],
        description: 'Create prescription',
        options: {
          randomizeOutputs: false
        }
      })

      const token: Token = {
        data: prescriptionData,
        txid: action.txid as string,
        tx: Transaction.fromBEEF(action.tx as number[])
      }

      setPrescription(token)

      await saveSubmission(token)

    } catch (error) {
      console.error('Error creating prescription:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <Box sx={cardSx}><CreatePrescriptionCard onSubmit={doctorCreatesPrescription} /></Box>
          <ResultBox entry={prescription} />
        </Box>
        <Box sx={boxSx}>
          <Box sx={cardSx}><PresentPrescriptionCard onSubmit={patientPresentsPrescription} /></Box>
          <ResultBox entry={prescription} />
        </Box>
        <Box sx={boxSx}>
          <Box sx={cardSx}><DispensePrescriptionCard onSubmit={pharmacyDispensesPrescription} /></Box>
          <ResultBox entry={prescription} />
        </Box>
        <Box sx={boxSx}>
          <Box sx={cardSx}><AcknowledgeReceiptCard onSubmit={patientAcknowledgesReceipt} /></Box>
          <ResultBox entry={prescription} />
        </Box>
      </Box>
      <SubmissionsLog change={isSubmitting} setPrescription={setPrescription} />
    </Container>
  );
};

export default App;
