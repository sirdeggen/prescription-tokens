"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { DataEntry } from '../../app/page';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';

interface StorageCardProps {
  data: DataEntry;
  onSubmit: (step: string, data: DataEntry) => void;
}

const StorageCard: React.FC<StorageCardProps> = ({ data, onSubmit }) => {
  return (
    <Card sx={cardContainerSx}>
      <CardActionArea onClick={() => onSubmit('Storage', data)}>
        <CardMedia
          component="img"
          image="/images/storage-facility.png"
          alt="Storage Facility"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={cardTitleSx}>
            Storage Facility
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Submit storage facility status and inventory levels
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default StorageCard;
