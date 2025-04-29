import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';
import { Token } from '../types';

interface DispensePrescriptionCardProps {
  setDispensation: (token: Token) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const DispensePrescriptionCard: React.FC<DispensePrescriptionCardProps> = ({ setDispensation, setIsSubmitting }) => {
  return (
    <Card sx={{
      ...cardContainerSx,
      boxShadow: '0 4px 12px rgba(44, 110, 142, 0.2)',
      borderTop: '4px solid #2c6e8e',
    }}>
      <CardActionArea onClick={() => onSubmit('Dispense Prescription')}>
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
