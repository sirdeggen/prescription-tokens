import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx, disabledCardSx } from '../styles/CardStyles';
import { Token } from '../types';
import { Transaction, PushDrop, Utils, WalletInterface, Script, OP } from '@bsv/sdk';
import { patient, pharmacyIdentityKey } from '@/utils/wallets';
import { saveSubmission, setSpent } from '@/utils/db';

interface AcknowledgeReceiptCardProps {
  dispensation: Token | null;
  setDispensation: (token: Token | null) => void;
  setAcknowledgement: (token: Token) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const AcknowledgeReceiptCard: React.FC<AcknowledgeReceiptCardProps> = ({ dispensation, setDispensation, setAcknowledgement, setIsSubmitting }) => {

    async function patientAcknowledgesReceipt() {
        try {
          const sourceTransaction = Transaction.fromBEEF(dispensation!.tx)
          setIsSubmitting(true)
          const pushdrop = new PushDrop(patient as WalletInterface, 'https://prescription-tokens.vercel.app')
          const id = dispensation!.data.id
          const arId = Utils.toArray(id, 'base64')
          
          const tx = new Transaction()
    
          const unlockingScriptTemplate = pushdrop.unlock(
            [0, 'medical prescription'],
            id,
            pharmacyIdentityKey,
            'all', 
            false
          )
          tx.addInput({
            sourceTransaction,
            sourceOutputIndex: 0,
            unlockingScriptTemplate
          })
    
          const timestamp = new Date().toISOString()
          
          const lockingScript = new Script()
          lockingScript.writeOpCode(OP.OP_FALSE)
          lockingScript.writeOpCode(OP.OP_RETURN)
          lockingScript.writeBin(Utils.toArray('recibido', 'utf8'))
          lockingScript.writeBin(arId)

          tx.addOutput({
            lockingScript,
            satoshis: 0
          })
    
          await tx.sign()
    
          const token: Token = {
            data: {
              id,
              timestamp,
              status: 'recibido',
            },
            txid: tx.id('hex'),
            tx: tx.toBEEF(),
            status: 'acknowledged',
            spent: true
          }
    
          setDispensation(null)
          setAcknowledgement(token)
    
          await setSpent(dispensation!.txid)
          await saveSubmission(token)

          console.log({ tx: tx.toHexBEEF() })

          const broadcast = async (BEEF: number[]) => {
            const response = await fetch('https://arc.taal.com/v1/tx', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json',
              },
              body: new Blob([new Uint8Array(BEEF)]),
            })
            if (!response.ok) {
              throw new Error('Failed to broadcast transaction')
            }
            const data = await response.json()
            return data
          }

          const arcResponse = await broadcast(tx.toBEEF(false))
          console.info({ arcResponse })    
        } catch (error) {
          console.error('Error creating prescription:', error)
        } finally {
          setIsSubmitting(false)
        }
      }

    
    const cardSx = !dispensation ? disabledCardSx : cardContainerSx

  return (
    <Card sx={cardSx}>
      <CardActionArea disabled={!dispensation} onClick={patientAcknowledgesReceipt}>
        <CardMedia
          component="img"
          image="/images/acknowledge.png"
          alt="Acknowledge Receipt"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{
            ...cardTitleSx,
            color: '#2c6e8e'
          }}>
            Confirmación de Recepción
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            El paciente confirma que recibió el medicamento.
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AcknowledgeReceiptCard;
