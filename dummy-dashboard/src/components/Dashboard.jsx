import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  Box, Grid, Card, CardContent, Typography,
  AppBar, Toolbar, CssBaseline, Container, Paper,
} from '@mui/material';

import SpatialQuery from './SpatialQuery';
import LandusePieChart from './LandusePieChart';
import LanduseLegend from './LanduseLegend';

mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';

const Dashboard = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [fullGeojsonBackup, setFullGeojsonBackup] = useState(null);
  const [selectedLanduseClass, setSelectedLanduseClass] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [74.3587, 31.5204],
      zoom: 11,
    });

    setMapInstance(map);

    return () => map.remove();
  }, []);



  const landuseColorMap = {
    "Commercial": "#f44336", "Educational": "#2196f3", "Encroachment": "#795548",
    "Graveyard": "#9c27b0", "Health Facility": "#4caf50", "Nullah": "#00bcd4",
    "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
    "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
    "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
    "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd"
  };
  





  const handleClassClick = (cls) => {
    setSelectedLanduseClass(cls);
  
    if (!fullGeojsonBackup || !mapInstance) return;
  
    const filtered = {
      ...fullGeojsonBackup,
      features: fullGeojsonBackup.features.filter(
        (f) => f.properties?.landuse === cls
      ),
    };
  
    console.log("🧩 Showing only landuse:", cls, "| Features:", filtered.features.length);
  
    // Replace existing layer
    if (mapInstance.getLayer('spatial-query-layer')) {
      mapInstance.removeLayer('spatial-query-layer');
      mapInstance.removeSource('spatial-query-layer');
    }
  
    mapInstance.addSource('spatial-query-layer', {
      type: 'geojson',
      data: filtered,
    });
  
    mapInstance.addLayer({
        id: 'spatial-query-layer',
        type: 'fill',
        source: 'spatial-query-layer',
        paint: {
          'fill-color': landuseColorMap[cls] || '#2196f3',
          'fill-opacity': 0.6,
          'fill-outline-color': '#333'
        }
      });
      
  
    // Zoom to filtered bounds
    const bounds = new mapboxgl.LngLatBounds();
    filtered.features.forEach((feature) => {
      const geom = feature.geometry;
      if (geom.type === 'Polygon') {
        geom.coordinates[0].forEach((c) => bounds.extend(c));
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly) => {
          poly[0].forEach((c) => bounds.extend(c));
        });
      }
    });
  
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, { padding: 40, duration: 1000 });
    }
  
    // Show in chart too
    setGeojsonData(filtered);
  };
  

  const handleReset = () => {
    setSelectedLanduseClass(null);
  
    if (!fullGeojsonBackup || !mapInstance) return;
  
    // Remove existing filtered layer
    if (mapInstance.getLayer('spatial-query-layer')) {
      mapInstance.removeLayer('spatial-query-layer');
      mapInstance.removeSource('spatial-query-layer');
    }
  
    // Re-add full GeoJSON
    mapInstance.addSource('spatial-query-layer', {
      type: 'geojson',
      data: fullGeojsonBackup,
    });
  
    mapInstance.addLayer({
      id: 'spatial-query-layer',
      type: 'fill',
      source: 'spatial-query-layer',
      paint: {
        'fill-color': [
          'match',
          ['get', 'landuse'],
          ...Object.entries({
            Commercial: "#f44336",
            Residential: "#03a9f4",
            Road: "#9e9e9e",
            Park: "#8bc34a",
            Educational: "#2196f3",
            // Add more as needed...
          }).flat(),
          '#bdbdbd'
        ],
        'fill-opacity': 0.6,
        'fill-outline-color': '#333'
      }
    });
  
    setGeojsonData(fullGeojsonBackup);
  };
  
  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6">Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Map + Spatial Query Block */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ display: 'flex', height: '450px' }}>
              <Box ref={mapRef} sx={{ width: '60%', height: '100%' }} />
              <Box sx={{ width: '40%', padding: 2, overflowY: 'auto' }}>
                {mapInstance && (
                  <SpatialQuery
                    map={mapInstance}
                    landuseFilter={selectedLanduseClass}
                    geojsonData={geojsonData}
                    setGeojsonData={setGeojsonData}
                    setFullGeojsonBackup={setFullGeojsonBackup}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Block 1: Doughnut Chart */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: 320 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Landuse Breakdown
                </Typography>
                <LandusePieChart
                  geojson={geojsonData}
                  selectedClass={selectedLanduseClass}
                  onClassClick={handleClassClick}
                  onResetFilter={handleReset}
                  onUpdateChartData={(data) => setChartData(data)}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Block 2: Legend */}
          <Grid item xs={12} sm={6} md={3}>
  <Card sx={{ height: 320, overflowY: 'auto' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Legend
      </Typography>
      <LanduseLegend
        data={chartData}
        selectedClass={selectedLanduseClass}
        onClassClick={handleClassClick}
      />
    </CardContent>
  </Card>
</Grid>


          {/* Blocks 3–5: Empty */}
          {[3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent>
                  <Typography variant="subtitle1" align="center">
                    Block {i} – Empty
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;
