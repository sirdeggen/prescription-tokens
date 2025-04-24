"use client"
import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper, Divider, Chip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { QueueEntry } from '../app/page';

interface ResultBoxProps {
  entry: QueueEntry,
}

interface ArcResponse {
  txStatus: string
}

const ResultBox: React.FC<ResultBoxProps> = ({ entry: startingData }) => {
  const [arcData, setArcData] = useState<ArcResponse | null>(null)

  const getStatus = async () => {
    if (!startingData?.txid) return;
    const res = await (await fetch('https://arc.taal.com/v1/tx/' + startingData.txid)).json()
    setArcData(res)
  }

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

  const entry = startingData ? flatJSON(startingData) : null;

  if (!startingData) {
    return <Box sx={{ 
      my: 3,
      height: 150, 
      border: '1px dashed #a0c8d7', 
      borderRadius: 2, 
      p: 2, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      sm: { width: '100%' }, 
      md: { width: '60%' },
      backgroundColor: '#f5f9fb' 
    }}>
      <Typography variant="body1" color="#607d8b">No prescription data yet.</Typography>
    </Box>
  }

  return (
    <Paper 
      elevation={1} 
      onClick={getStatus} 
      sx={{ 
        overflow: 'hidden', 
        my: 3, 
        sm: { width: '60%' }, 
        md: {width: '60%' }, 
        position: 'relative', 
        height: 'auto', 
        borderRadius: 2, 
        p: 3, 
        backgroundColor: entry?.txid ? '#eef7fa' : '#f8f8f8',
        borderLeft: entry?.txid ? '4px solid #2c6e8e' : '4px solid #ccc'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocalHospitalIcon sx={{ mr: 1, color: '#2c6e8e' }} />
        <Typography variant="h6" sx={{ color: '#2c6e8e', fontWeight: 600 }}>
          {startingData?.step || 'Prescription'} Record
        </Typography>
        <Box sx={{ flexGrow: 1 }}></Box>
        <IconButton 
          size="small" 
          aria-label="refresh" 
          sx={{ color: '#4b9aaa' }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {entry && startingData.data && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {startingData.data.patient && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
                Patient Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Patient: {startingData.data.patient.name} (ID: {startingData.data.patient.patientId})
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Date of Birth: {startingData.data.patient.dateOfBirth}
              </Typography>
            </Box>
          )}
          
          {startingData.data.prescriber && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
                Prescriber Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Prescribed by: {startingData.data.prescriber.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                NPI: {startingData.data.prescriber.prescriberNPI}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Clinic: {startingData.data.prescriber.clinic}
              </Typography>
            </Box>
          )}
          
          {startingData.data.medication && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
                Medication Details
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Medication: {startingData.data.medication.medicationName} {startingData.data.medication.dosage}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                NDC: {startingData.data.medication.ndc}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Quantity: {startingData.data.medication.quantity}
              </Typography>
              {startingData.data.medication.refills !== undefined && (
                <Typography variant="body2" sx={{ color: '#555' }}>
                  Refills: {startingData.data.medication.refills}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#555' }}>
                Instructions: {startingData.data.medication.instructions}
              </Typography>
              {startingData.data.medication.expirationDate && (
                <Typography variant="body2" sx={{ color: '#555' }}>
                  Expiration: {startingData.data.medication.expirationDate}
                </Typography>
              )}
            </Box>
          )}
          
          {startingData.data.pharmacy && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
                Pharmacy Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Dispensed by: {startingData.data.pharmacy.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Pharmacist: {startingData.data.pharmacy.pharmacist}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Dispensed Date: {startingData.data.pharmacy.dispensedDate}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 1 }}>
            {startingData.data.timestamp && (
              <Chip 
                size="small" 
                label={`Timestamp: ${startingData.data.timestamp}`} 
                sx={{ backgroundColor: '#e1f0f5', color: '#4b9aaa', mb: 1, mr: 1 }} 
              />
            )}
            {startingData.data.entryId && (
              <Chip 
                size="small" 
                label={`Entry ID: ${startingData.data.entryId}`} 
                sx={{ backgroundColor: '#e1f0f5', color: '#4b9aaa', mb: 1 }} 
              />
            )}
          </Box>
        </Box>
      )}
      
      {arcData && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
            Blockchain Verification
          </Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>
            Status: {arcData.txStatus}
          </Typography>
        </Box>
      )}
      
      {entry?.txid && arcData && arcData.txStatus === 'MINED' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://whatsonchain.com/tx/${entry.txid}`, '_blank');
            }}
            sx={{ color: '#4b9aaa' }}
          >
            <LinkIcon />
          </IconButton>
        </Box>
      )}
    </Paper>
  )
}

export default ResultBox
