"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { DataEntry } from '../../app/page';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';

interface TransmissionCardProps {
  data: DataEntry;
  onSubmit: (step: string, data: DataEntry) => void;
}

const TransmissionCard: React.FC<TransmissionCardProps> = ({ data, onSubmit }) => {
  return (
    <Card sx={cardContainerSx}>
      <CardActionArea onClick={() => onSubmit('Transmission', data)}>
        <CardMedia
          component="img"
          image="/images/transmission-pipeline.png"
          alt="Transmission Pipeline"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={cardTitleSx}>
            Transmission Pipeline
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Submit transmission pipeline measurements and flow data
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default TransmissionCard;
