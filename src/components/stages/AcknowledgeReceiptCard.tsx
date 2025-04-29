import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';
import { Token } from '../types';

interface AcknowledgeReceiptCardProps {
  setAcknowledgement: (token: Token) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const AcknowledgeReceiptCard: React.FC<AcknowledgeReceiptCardProps> = ({ setAcknowledgement, setIsSubmitting }) => {
  return (
    <Card sx={{
      ...cardContainerSx,
      boxShadow: '0 4px 12px rgba(44, 110, 142, 0.2)',
      borderTop: '4px solid #2c6e8e',
    }}>
      <CardActionArea onClick={() => onSubmit('Acknowledge Receipt')}>
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
            Confirmar Recibo
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Confirmar el recibo de la receta digital
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AcknowledgeReceiptCard;
