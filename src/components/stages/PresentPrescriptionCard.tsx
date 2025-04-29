"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';
import { Token, DataEntry } from '../types';
import { PushDrop, Transaction, Hash, Utils, WalletInterface } from '@bsv/sdk';
import { patient, doctorIdentityKey, pharmacyIdentityKey } from '@/utils/wallets';
import { setSpent, saveSubmission } from '@/utils/db';

interface PresentPrescriptionCardProps {
  prescription: Token | null;
  setPrescription: (token: Token | null) => void; 
  setPresentation: (token: Token | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const PresentPrescriptionCard: React.FC<PresentPrescriptionCardProps> = ({ prescription, setPrescription, setPresentation, setIsSubmitting }) => {

  async function patientPresentsPrescriptionAtPharmacy() {
    try {
      const sourceTransaction = Transaction.fromBEEF(prescription!.tx)
      setIsSubmitting(true)
      const pushdrop = new PushDrop(patient as WalletInterface, 'https://prescription-tokens.vercel.app')
      const prescriptionData = prescription?.data as DataEntry
      const jsonBlob = Utils.toArray(JSON.stringify(prescriptionData), 'utf8')
      const documentHash = Hash.sha256(jsonBlob)
      
      const tx = new Transaction()

      const unlockingScriptTemplate = pushdrop.unlock(
        [0, 'medical prescription'],
        prescriptionData.id,
        doctorIdentityKey,
        'all', 
        false,
        3
      )
      tx.addInput({
        sourceTransaction,
        sourceOutputIndex: 0,
        unlockingScriptTemplate
      })

      const timestamp = new Date().toISOString()
      
      const lockingScript = await pushdrop.lock(
        [Utils.toArray('presentar ' + timestamp, 'utf8'), documentHash],
        [0, 'medical prescription'],
        prescriptionData.id,
        pharmacyIdentityKey,
        false, 
        true,
        'after'
      )
      tx.addOutput({
        lockingScript,
        satoshis: 2
      })

      await tx.sign()

      const token: Token = {
        data: {
          id: prescriptionData.id,
          timestamp,
          status: 'presentada'
        },
        txid: tx.id('hex'),
        tx: tx.toBEEF(),
        status: 'presented',
        spent: false
      }

      setPrescription(null)
      setPresentation(token)

      await saveSubmission(token)
      await setSpent(prescription!.txid)

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
      <CardActionArea disabled={!prescription} onClick={patientPresentsPrescriptionAtPharmacy}>
        <CardMedia
          component="img"
          image="/images/present.png"
          alt="Present Prescription"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{
            ...cardTitleSx,
            color: '#2c6e8e'
          }}>
            Presentar Receta
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Presentar una receta digital en la farmacia
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PresentPrescriptionCard;
