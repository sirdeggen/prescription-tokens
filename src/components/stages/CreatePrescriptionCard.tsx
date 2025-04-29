"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';

interface CreatePrescriptionCardProps {
  onSubmit: (step: string) => void;
}

const CreatePrescriptionCard: React.FC<CreatePrescriptionCardProps> = ({ onSubmit }) => {
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
