"use client"
import { SxProps, Theme } from '@mui/material';

// Common styles for card media to maintain consistent aspect ratio
export const cardMediaSx: SxProps<Theme> = {
  aspectRatio: '1.67',
  width: '100%',
  height: 'auto',
  objectFit: 'cover'
};

// Common styles for card container
export const cardContainerSx: SxProps<Theme> = {
  width: '100%',
  height: 'auto',
  borderRadius: 2,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(44, 110, 142, 0.15)'
  }
};

// Disabled card style
export const disabledCardSx: SxProps<Theme> = {
  opacity: 0.7,
  cursor: 'not-allowed',
  '&:hover': {
    transform: 'none',
    boxShadow: 'none'
  }
};

// Typography styles
export const cardTitleSx: SxProps<Theme> = {
  fontSize: 20,
  fontWeight: 600,
  color: '#2c6e8e'
};

export const cardDescriptionSx: SxProps<Theme> = {
  fontSize: 15,
  color: '#607d8b'
};
