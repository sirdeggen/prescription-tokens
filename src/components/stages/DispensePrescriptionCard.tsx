"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';
import { Token, DataEntry } from '../types';
import { PushDrop, Transaction, Hash, Utils, WalletInterface } from '@bsv/sdk';
import { doctorIdentityKey, patientIdentityKey, pharmacy } from '@/utils/wallets';
import { setSpent, saveSubmission } from '@/utils/db';

interface DispensePrescriptionCardProps {
  presentation: Token | null;
  setPresentation: (token: Token | null) => void;
  setDispensation: (token: Token | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const DispensePrescriptionCard: React.FC<DispensePrescriptionCardProps> = ({ presentation, setPresentation, setDispensation, setIsSubmitting }) => {


    async function pharmacistDispensesMedication() {
      try {
        const sourceTransaction = Transaction.fromBEEF(presentation!.tx)
        setIsSubmitting(true)
        const pushdrop = new PushDrop(pharmacy as WalletInterface, 'https://prescription-tokens.vercel.app')
        const id = presentation!.data.id
        const arId = Utils.toArray(id, 'base64')
        
        const tx = new Transaction()
  
        const unlockingScriptTemplate = pushdrop.unlock(
          [0, 'medical prescription'],
          id,
          patientIdentityKey,
          'all', 
          false
        )
        tx.addInput({
          sourceTransaction,
          sourceOutputIndex: 0,
          unlockingScriptTemplate
        })
  
        const timestamp = new Date().toISOString()
        
        const lockingScript = await pushdrop.lock(
          [Utils.toArray('dispensar ' + timestamp, 'utf8'), arId],
          [0, 'medical prescription'],
          id,
          patientIdentityKey,
          false, 
          true,
          'after'
        )
        tx.addOutput({
          lockingScript,
          satoshis: 1
        })
  
        await tx.sign()
  
        const token: Token = {
          data: {
            id,
            timestamp,
            status: 'dispensar'
          },
          txid: tx.id('hex'),
          tx: tx.toBEEF(),
          status: 'dispensed',
          spent: false
        }
  
        setDispensation(null)
        setPresentation(token)
  
        await saveSubmission(token)
        await setSpent(presentation!.txid)
  
      } catch (error) {
        console.error('Error creating prescription:', error)
      } finally {
        setIsSubmitting(false)
      }
    }

  return (
    <Card sx={{
      ...cardContainerSx,
      boxShadow: '0 4px 12px rgba(44, 110, 142, 0.2)',
      borderTop: '4px solid #2c6e8e',
    }}>
      <CardActionArea onClick={pharmacistDispensesMedication}>
        <CardMedia
          component="img"
          image="/images/dispense.png"
          alt="Dispense Prescription"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{
            ...cardTitleSx,
            color: '#2c6e8e'
          }}>
            Dispensar Receta
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Dispensar una receta digital al paciente
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DispensePrescriptionCard;
