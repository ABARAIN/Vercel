import React from 'react';
import { Box, Typography } from '@mui/material';

const PlotDetailCard = ({ plot }) => {
  if (!plot) {
    return <Typography variant="body2" color="textSecondary">No plot selected.</Typography>;
  }

  const { data, lat, lng } = plot;

  const fieldMap = {
    'Town': data.town_name,
    'Plot No': data.plotno || data.plot_no,
    'Block': data.block,
    'Division': data.division,
    'District': data.district,
    'Tehsil': data.tehsil,
    'Society Type': data.societytyp || data.society_type,
    'Source': data.source,
    'Landuse': data.landuse,
    'Latitude': lat?.toFixed(6),
    'Longitude': lng?.toFixed(6),
    'Remarks': data.illegal_remarks || '-'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Object.entries(fieldMap).map(([label, value], i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight={600}>{label}:</Typography>
          <Typography variant="body2" sx={{ ml: 1 }}>{value ?? '-'}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default PlotDetailCard;
