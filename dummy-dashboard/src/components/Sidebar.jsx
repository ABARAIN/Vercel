import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Layers as LayersIcon,
  Map as MapIcon,
  LocationCity as BuildingIcon,
  Group as UsersIcon,
  UploadFile as UploadFileIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import SidebarMenu from './SidebarMenu';
import BasemapSelector from './BasemapSelector';
import LayerItem from './LayerItem';
import LayerSwitcher from './LayerSwitcher';
import SpatialQuery from './SpatialQuery';

const Sidebar = ({
  layers,
  onBasemapChange,
  toggleMBlockVisibility,
  zoomToMBlock,
  onFileUpload,
  uploadMessage,
  onReset,
  zoomToLayer,
  toggleLayerVisibility,
  measurements,
  toggleLayerVisible,
  activeTowns,
  map,
  setActiveTowns
}) => {
  const [activeIcon, setActiveIcon] = useState('layers');
  const [mBlockVisible, setMBlockVisible] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [towns, setTowns] = useState([]);

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
      setShowLayers(true);
    }
    onFileUpload(event);
  };

  const handleToggleTown = (town) => {
    setActiveTowns(prev => {
      const updated = { ...prev, [town]: !prev[town] };
      toggleLayerVisible(town, updated[town]);
      return updated;
    });
  };

  const handleToggleMBlock = () => {
    setMBlockVisible(prev => {
      const newState = !prev;
      toggleMBlockVisibility(newState);
      return newState;
    });
  };

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/all-soc/');
        const data = await response.json();
        const uniqueTowns = [...new Set(data.map(s => s.town_name))].sort();
        setTowns(uniqueTowns);
      } catch (error) {
        console.error('Error fetching towns:', error);
      }
    };

    fetchTowns();
  }, []);

  const getButtonHoverStyle = (isActive) => ({
    '&:hover': {
      backgroundColor: isActive ? '#ffcccc' : '#cceeff',
      color: isActive ? 'red' : '#0077cc',
    }
  });

  const greenAccordionSummary = {
    '&.Mui-expanded': {
      backgroundColor: 'rgba(5, 38, 255, 0.2)',
      color: '#000000',
    }
  };

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: 700,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          marginTop: 8.5,
          width: 400,
          height: '135vh',
          boxSizing: 'border-box',
          backgroundColor: '#003366',
          color: '#fff',
          padding: 2,
          overflowY: 'auto'
        }
      }}
    >
      <Box display="flex" justifyContent="space-around" mb={2}>
        <Box textAlign="center">
          <Tooltip title="Basemaps">
            <IconButton
              onClick={() => setActiveIcon('marker')}
              color={activeIcon === 'marker' ? 'success' : 'inherit'}
              sx={{ fontSize: 50 }}
            >
              <MapIcon sx={{ fontSize: 35 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: activeIcon === 'marker' ? 'bold' : 'normal' }}>
            Basemaps
          </Typography>
        </Box>

        <Box textAlign="center">
          <Tooltip title="Layers">
            <IconButton
              onClick={() => setActiveIcon('layers')}
              color={activeIcon === 'layers' ? 'success' : 'inherit'}
              sx={{ fontSize: 50 }}
            >
              <LayersIcon sx={{ fontSize: 35 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: activeIcon === 'layers' ? 'bold' : 'normal' }}>
            Layers
          </Typography>
        </Box>

        <Box textAlign="center">
          <Tooltip title="Building">
            <IconButton
              onClick={() => setActiveIcon('building')}
              color={activeIcon === 'building' ? 'success' : 'inherit'}
              sx={{ fontSize: 50 }}
            >
              <BuildingIcon sx={{ fontSize: 35 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: activeIcon === 'building' ? 'bold' : 'normal' }}>
            Building
          </Typography>
        </Box>

        <Box textAlign="center">
          <Tooltip title="Users">
            <IconButton
              onClick={() => setActiveIcon('users')}
              color={activeIcon === 'users' ? 'success' : 'inherit'}
              sx={{ fontSize: 50 }}
            >
              <UsersIcon sx={{ fontSize: 35 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: activeIcon === 'users' ? 'bold' : 'normal' }}>
            Users
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#ccc', mb: 2 }} />

      {activeIcon === 'marker' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
            <Typography>Basemap</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <BasemapSelector onBasemapChange={onBasemapChange} />
          </AccordionDetails>
        </Accordion>
      )}

      {activeIcon === 'layers' && (
        <>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Geodetic Network</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Layer controls or details</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Cooperative Society</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Layer controls or details</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Approved Societies</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {towns.map((town, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemText primary={town} />
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      onClick={() => handleToggleTown(town)}
                      sx={getButtonHoverStyle(activeTowns[town])}
                    >
                      {activeTowns[town] ? 'Hide' : 'Show'}
                    </Button>
                    {activeTowns[town] && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => zoomToLayer(town)}
                      >
                        Fly to
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography> Spatial Query</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {map ? <SpatialQuery map={map} /> : <Typography fontStyle="italic">Map not loaded yet.</Typography>}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Development Authorities</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Details or controls for Development Authorities</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>State Lands</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Details or controls for State Lands</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Digitized Blocks</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ListItem disableGutters>
                <ListItemText primary="M-Block" />
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleToggleMBlock}
                  sx={getButtonHoverStyle(mBlockVisible)}
                >
                  {mBlockVisible ? 'Hide' : 'Show'}
                </Button>
                {mBlockVisible && (
                  <Button
                    variant="contained"
                    sx={{ ml: 1 }}
                    onClick={() => zoomToMBlock('M-Block')}
                  >
                    Fly to
                  </Button>
                )}
              </ListItem>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Settlement Operations</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Details or controls for Settlement Operations</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={greenAccordionSummary}>
              <Typography>Upload File</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                >
                  Upload
                  <input type="file" hidden onChange={handleFileUpload} />
                </Button>
                {uploadMessage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {uploadMessage}
                  </Typography>
                )}
                {showLayers && (
                  <Box mt={2}>
                    <LayerSwitcher
                      layers={layers}
                      onToggleLayer={toggleLayerVisibility}
                    />
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      )}

      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ResetIcon />}
          onClick={onReset}
        >
          Reset View
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
