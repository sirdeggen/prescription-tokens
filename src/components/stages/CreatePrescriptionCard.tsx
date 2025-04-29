"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';
import { DataEntry, Token } from '../types';
import { doctor, patient } from '@/utils/wallets';
import { saveSubmission } from '@/utils/db';
import prescriptions from '@/utils/prescriptions.json';
import { Utils, PushDrop, Random, Transaction, CreateActionOutput, Hash } from '@bsv/sdk'

interface CreatePrescriptionCardProps {
  setPrescription: (token: Token) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const CreatePrescriptionCard: React.FC<CreatePrescriptionCardProps> = ({ setPrescription, setIsSubmitting }) => {

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

  return (
    <Card sx={{
      ...cardContainerSx,
      boxShadow: '0 4px 12px rgba(44, 110, 142, 0.2)',
      borderTop: '4px solid #2c6e8e',
    }}>
      <CardActionArea onClick={() => onSubmit('Create Prescription')}>
        <CardMedia
          component="img"
          image="/images/prescription.png"
          alt="Create Prescription"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{
            ...cardTitleSx,
            color: '#2c6e8e'
          }}>
            Crear Receta
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Crear una nueva receta digital para un paciente con detalles de medicamento
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CreatePrescriptionCard;
