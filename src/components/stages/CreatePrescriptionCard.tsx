import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx, disabledCardSx } from '../styles/CardStyles';
import { DataEntry, Token } from '../types';
import { doctorPromise, patientIdentityKey } from '../../utils/wallets';
import { saveSubmission } from '../../utils/db';
import prescriptions from '../../utils/prescriptions.json';
import { Utils, PushDrop, Random, Hash } from '@bsv/sdk'

interface CreatePrescriptionCardProps {
  outstanding: Token | null;
  setPrescription: (token: Token) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const CreatePrescriptionCard: React.FC<CreatePrescriptionCardProps> = ({ outstanding, setPrescription, setIsSubmitting }) => {

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
      const doctor = await doctorPromise
      setIsSubmitting(true)
      const pushdrop = new PushDrop(doctor, 'https://prescription-tokens.vercel.app')
      const prescriptionData = simulateData()
      const jsonBlob = Utils.toArray(JSON.stringify(prescriptionData), 'utf8')
      const documentHash = Hash.sha256(jsonBlob)
      
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
          randomizeOutputs: false,
          acceptDelayedBroadcast: false
        }
      })

      console.log({ action })

      const token: Token = {
        data: { ...prescriptionData, estado: 'creado'},
        txid: action.txid as string,
        tx: action.tx as number[],
        status: 'created',
        spent: false
      }

      setPrescription(token)

      await saveSubmission(token)

    } catch (error) {
      console.error('Error creating prescription:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardSx = outstanding ? disabledCardSx : cardContainerSx

  return (
    <Card sx={cardSx}>
      <CardActionArea disabled={!!outstanding} onClick={doctorCreatesPrescription}>
        <CardMedia
          component="img"
          image={'/prescription.png'}
          alt="Create Prescription"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{
            ...cardTitleSx,
            color: '#2c6e8e'
          }}>
            Emisión de Receta Médica
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            El médico crea y firma la receta digital.
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CreatePrescriptionCard;
