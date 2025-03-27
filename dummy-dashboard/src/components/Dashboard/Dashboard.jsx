import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  Box, Grid, Card, CardContent, Typography,
  AppBar, Toolbar, CssBaseline, Container, Paper,
} from '@mui/material';

import SpatialQuery from '../SpatialQuery';
import LandusePieChart from './LandusePieChart';
import LanduseLegend from './LanduseLegend';
import SelectedPlotList from './SelectedPlotList';
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css"

mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';

const Dashboard = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [fullGeojsonBackup, setFullGeojsonBackup] = useState(null);
  const [selectedLanduseClass, setSelectedLanduseClass] = useState(null);
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();
  const [clickedPlotDetails, setClickedPlotDetails] = useState(null);


  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [74.3587, 31.5204],
      zoom: 11,
      attributionControl: false // ❌ Hide bottom-right attribution

    });

    setMapInstance(map);


    return () => map.remove();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // cleanup
    };
  }, []);

  const landuseColorMap = {
    "Commercial": "#000000", "Educational": "#2196f3", "Encroachment": "#795548",
    "Graveyard": "#9c27b0", "Health Facility": "#4caf50", "Nullah": "#00bcd4",
    "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
    "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
    "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
    "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd", "Illegal": "#e53935"
  };


  useEffect(() => {
    if (!mapInstance) return;

    const handleClick = async (e) => {
      const { lng, lat } = e.lngLat;
      const coordinateString = `lat=${lat}&lon=${lng}`;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/society-parcel/?${coordinateString}`);
        const data = await res.json();

        if (res.ok) {
          console.log("✅ Plot detail fetched:", data);
          setClickedPlotDetails({ data, lat, lng });
        }
      } catch (error) {
        console.error("❌ Error fetching plot info:", error);
      }
    };

    mapInstance.on('click', handleClick);
    return () => mapInstance.off('click', handleClick);
  }, [mapInstance]);

  const PlotDetailCard = ({ plot }) => {
    if (!plot) {
      return <div className="plot-card-empty">No plot selected.</div>;
    }

    const { data, lat, lng } = plot;

    const fieldMap = {
      'Town': data.town_name,
      'Plot No': data.plotno,
      'Block': data.block,
      'Division': data.division,
      'District': data.district,
      'Tehsil': data.tehsil,
      'Society Type': data.societytyp,
      'Source': data.source,
      'Landuse': data.landuse,
      'Latitude': lat.toFixed(6),
      'Longitude': lng.toFixed(6),
      'Remarks': data.illegal_remarks || '-'
    };

    return (
      <div className="plot-card-container fancy-expanded">
        <div className="plot-card-header">📍 Plot Details</div>
        <div className="plot-card-scroll">
          {Object.entries(fieldMap).map(([label, value], index) => (
            <div key={index} className="plot-card-block">
              <div className="plot-card-label">{label}</div>
              <div className={`plot-card-value ${label === 'Remarks' && value !== '-' ? 'highlight' : ''}`}>
                {value ?? '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };



  const InfoRow = ({ label, value, highlight = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 500, color: '#555' }}>{label}:</span>
      <span style={{
        fontWeight: highlight ? 600 : 400,
        color: highlight ? '#d32f2f' : '#333'
      }}>
        {value ?? '-'}
      </span>
    </div>
  );




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
            "Commercial": "#000000", "Educational": "#2196f3", "Encroachment": "#795548",
            "Graveyard": "#9c27b0", "Health Facility": "#4caf50", "Nullah": "#00bcd4",
            "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
            "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
            "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
            "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd", "Illegal": "#e53935"
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
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 15,
          right: 10,
          zIndex: 1000,
          padding: '8px 12px',
          backgroundColor: '#444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        ← Back to Home
      </button>

      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h8">Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          p: 2, transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', // counteracts scale shrink to fill horizontal
        }}
      >

        <Box height="calc(100vh - 64px)">
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Map - Full Left Side */}
            <Grid item xs={12} md={6}>
              <Box ref={mapRef} sx={{ width: '100%', height: '100%', borderRadius: 2 }} />
            </Grid>

            {/* Right Side: Chart + Legend + SpatialQuery + Blocks */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Chart + Legend + Block 3 */}
                <Grid item xs={12} md={6}>
                  {/* Chart */}
                  <Card sx={{ height: 320 }}>
                    <CardContent sx={{ pt: 1, pb: 1 }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: -4 }}>
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


                  {/* Legend */}
                  <Card sx={{ height: 300, mt: 2, overflowY: 'auto' }}>
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

                  {/* Block 3: Plot Details */}
                  <Card
                    sx={{
                      height: 225,
                      width: '100%',
                      mt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CardContent sx={{ height: '100%' }}>
                      <PlotDetailCard plot={clickedPlotDetails} />
                    </CardContent>
                  </Card>
                </Grid>

                {/* SpatialQuery + Block 4 */}
                <Grid item xs={12} md={6}>
                  {/* SpatialQuery */}
                  <Card sx={{ height: 460 }}>
                    <CardContent sx={{ height: '100%', overflowY: 'auto' }}>
                      {mapInstance && (
                        <SpatialQuery
                          map={mapInstance}
                          landuseFilter={selectedLanduseClass}
                          geojsonData={geojsonData}
                          setGeojsonData={setGeojsonData}
                          setFullGeojsonBackup={setFullGeojsonBackup}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Block 4: Selected Plots List */}
                  {/* Block 4 - Selected Plot Numbers */}
                  <Card
                    sx={{
                      height: 400,
                      width: '100%',
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: 2,
                      padding: 2,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Selected Plots – {selectedLanduseClass?.toUpperCase() || "None"}
                    </Typography>

                    {geojsonData && geojsonData.features && selectedLanduseClass ? (
                      <>
                        {geojsonData.features
  .filter(f => f.properties.landuse === selectedLanduseClass)
  .sort((a, b) => {
    const numA = parseInt(a.properties.plot_no);
    const numB = parseInt(b.properties.plot_no);
    return numA - numB;
  })
  .map((f, index) => (
    <Box
      key={index}
      sx={{
        backgroundColor: '#fff',
        padding: '6px 12px',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        mb: 1,
        fontWeight: 500,
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>Plot No:</span>
      <span>{f.properties.plot_no || 'N/A'}</span>
    </Box>
  ))}


                      </>
                    ) : (
                      <Typography variant="body2" align="center" color="text.secondary">
                        Select a landuse class from the chart or legend to view related plots.
                      </Typography>
                    )}
                  </Card>

                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );



};

export default Dashboard;
