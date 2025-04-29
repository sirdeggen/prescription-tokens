"use client"
import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper, Divider } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { Token } from '../components/types';

interface ResultBoxProps {
  entry: Token | null,
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

  const entry = startingData ? flatJSON(startingData.data) : null;

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
      <Typography variant="body1" color="#607d8b">Nada aún.</Typography>
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
          Registro de Receta
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
      
      {entry && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.keys(entry).map((key) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
                {key}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                {entry[key as keyof Token]}
              </Typography>
            </Box>
          ))}
          {startingData.txid && <Box key={startingData.txid} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
              txid
            </Typography>
            <Typography variant="body2" sx={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis'  }}>
              {startingData.txid}
            </Typography>
          </Box>}
        </Box>
      )}
    
      {arcData && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ color: '#2c6e8e', fontWeight: 600, mb: 0.5 }}>
            Verificación en Blockchain
          </Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>
            Estado: {!arcData?.txStatus ? 'Todav a no ha sido difundido' : arcData?.txStatus}
          </Typography>
        </Box>
      )}
      
      {startingData?.txid && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://whatsonchain.com/tx/${startingData.txid}`, '_blank');
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
