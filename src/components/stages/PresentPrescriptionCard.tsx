import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';
import { Token } from '../types';

interface PresentPrescriptionCardProps {
  setPresentation: (token: Token) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const PresentPrescriptionCard: React.FC<PresentPrescriptionCardProps> = ({ setPresentation, setIsSubmitting }) => {
  return (
    <Card sx={{
      ...cardContainerSx,
      boxShadow: '0 4px 12px rgba(44, 110, 142, 0.2)',
      borderTop: '4px solid #2c6e8e',
    }}>
      <CardActionArea onClick={() => onSubmit('Present Prescription')}>
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
