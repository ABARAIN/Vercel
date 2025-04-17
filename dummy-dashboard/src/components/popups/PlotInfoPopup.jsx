import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PlotInfoPopup = ({ plot, map, showCorners, onToggleCorners, onClose }) => {
  if (!plot || !map) return null;

  const { data, lat, lng } = plot;

  // 🎯 Get map pixel position
  const pixel = map.project([lng, lat]);

  return (
    <Card
      sx={{
        position: 'absolute',
        left: pixel.x,
        top: pixel.y,
        transform: 'translate(-50%, -100%)',
        width: 260,
        zIndex: 1000,
        backgroundColor: '#fefefe',
        borderRadius: 2,
        boxShadow: 5,
        border: '1px solid #ccc',
        padding: '6px 8px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          📍 Plot Info
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <CardContent sx={{ p: 0 }}>
        <Box sx={{ mb: 1 }}><strong>Society:</strong> {data.town_name || '-'}</Box>
        <Box sx={{ mb: 1 }}><strong>Block:</strong> {data.block || '-'}</Box>
        <Box sx={{ mb: 1 }}><strong>Plot #:</strong> {data.plotno || data.plot_no || '-'}</Box>
        <Box sx={{ mb: 1 }}><strong>Landuse:</strong> {data.landuse || '-'}</Box>

       
      </CardContent>
    </Card>
  );
};

export default PlotInfoPopup;
