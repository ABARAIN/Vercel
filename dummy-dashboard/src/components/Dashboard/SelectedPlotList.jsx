// components/dashboard/SelectedPlotList.jsx
import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const SelectedPlotList = ({ selectedPlots, selectedClass }) => {
  const sortedPlots = [...selectedPlots].sort((a, b) => {
    const plotA = a.plotno ? parseInt(a.plotno) : 0;
    const plotB = b.plotno ? parseInt(b.plotno) : 0;
    return plotA - plotB;
  });

  return (
    <Card
      sx={{
        height: 400,
        width: '100%',
        mt: 2,
        overflowY: 'auto',
        borderRadius: 2,
        boxShadow: 3,
        background: '#fafafa',
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Plots for {selectedClass || 'Selected'} Landuse
        </Typography>
        {sortedPlots.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No plots found for selected landuse.
          </Typography>
        ) : (
          <List dense>
            {sortedPlots.map((plot, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={`Plot No: ${plot.plotno || 'N/A'}`}
                  secondary={plot.block ? `Block: ${plot.block}` : null}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectedPlotList;
