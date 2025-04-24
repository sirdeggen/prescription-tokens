"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { DataEntry } from '../../app/page';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';

interface CollectMedicationCardProps {
  onSubmit: (step: string, data: DataEntry | undefined) => void;
}

const CollectMedicationCard: React.FC<CollectMedicationCardProps> = ({ onSubmit }) => {
  return (
    <Card sx={{
      ...cardContainerSx,
      boxShadow: '0 4px 12px rgba(44, 110, 142, 0.2)',
      borderTop: '4px solid #4b9aaa',
    }}>
      <CardActionArea onClick={() => onSubmit('Collect Medication', undefined)}>
        <CardMedia
          component="img"
          image="/images/medication.png"
          alt="Collect Medication"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{
            ...cardTitleSx,
            color: '#4b9aaa'
          }}>
            Collect Medication
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Process prescription fulfillment and dispense medication to the patient
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CollectMedicationCard;
