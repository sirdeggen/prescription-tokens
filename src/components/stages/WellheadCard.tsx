"use client"
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { DataEntry } from '../../app/page';
import { cardMediaSx, cardContainerSx, cardTitleSx, cardDescriptionSx } from '../styles/CardStyles';

interface WellheadCardProps {
  data: DataEntry;
  onSubmit: (step: string, data: DataEntry) => void;
}

const WellheadCard: React.FC<WellheadCardProps> = ({ data, onSubmit }) => {
  return (
    <Card sx={cardContainerSx}>
      <CardActionArea onClick={() => onSubmit('Wellhead', data)}>
        <CardMedia
          component="img"
          image="/images/wellhead.png"
          alt="Wellhead"
          sx={cardMediaSx}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={cardTitleSx}>
            Wellhead
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={cardDescriptionSx}>
            Submit data from wellhead measurements including flow rate and composition
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default WellheadCard;
