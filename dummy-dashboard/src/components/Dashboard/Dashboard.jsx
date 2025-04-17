import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  Box, Grid, Card, CardContent, Typography,
  AppBar, Toolbar, CssBaseline, Container, Paper, Button,
} from '@mui/material';
import simplify from 'simplify-js';
import SpatialQuery from '../SpatialQuery';
import LandusePieChart from './LandusePieChart';
import LanduseLegend from './LanduseLegend';
import PlotInfoPopup from '../popups/PlotInfoPopup';
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [highlightedPlot, setHighlightedPlot] = useState(null);
  const [cornerMarkers, setCornerMarkers] = useState([]);
  const [showCornerPopup, setShowCornerPopup] = useState(true);
  const [showPlotPopup, setShowPlotPopup] = useState(true);
  const legendRef = useRef(null);

  useEffect(() => {
    const baseStyles = {
      Basemaps: {
        url: 'mapbox://styles/mapbox/streets-v11',
        zoom: 11,
        center: [74.3587, 31.5204]
      },
      Streets: {
        url: 'mapbox://styles/ibrahimmalik2002/cm8cq3smm00jf01sa72lchd2g',
        zoom: 11,
        center: [74.1984366152605, 31.406322333747173]
      },
      Satellite: {
        url: 'mapbox://styles/mapbox/satellite-streets-v12',
        zoom: 16,
        center: [74.1984366152605, 31.406322333747173]
      },
      Light: {
        url: 'mapbox://styles/mapbox/light-v11',
        zoom: 12,
        center: [74.1984366152605, 31.406322333747173]
      },
      Dark: {
        url: 'mapbox://styles/mapbox/dark-v11',
        zoom: 12,
        center: [74.3595, 31.5190]
      },
      Drone: {
        url: 'mapbox://styles/ibrahimmalik2002/cm6909iji006b01qzduu40iha',
        zoom: 13,
        center: [74.3600, 31.5200]
      }
    };

    const initialStyle = baseStyles.Basemaps;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: initialStyle.url,
      center: initialStyle.center,
      zoom: initialStyle.zoom,
      attributionControl: false,
      preserveDrawingBuffer:true,
    });


    const attributionControl = new mapboxgl.AttributionControl({
      customAttribution: ''
    });

    map.addControl(attributionControl);

    map.on('load', () => {
      const attrib = document.querySelector('.mapboxgl-ctrl-attrib');
      if (attrib) {
        attrib.innerHTML = `
          <a href="https://www.nespak.com.pk/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
            © Nespak
          </a>
        `;
      }
    });


    setMapInstance(map);

    // Add zoom controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // Custom basemap control
    const styleControl = document.createElement('div');
    styleControl.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const select = document.createElement('select');
    select.style.padding = '4px';
    select.style.fontSize = '14px';
    select.style.border = 'none';
    select.style.outline = 'none';
    select.style.cursor = 'pointer';

    // Populate dropdown
    for (const [name] of Object.entries(baseStyles)) {
      const option = document.createElement('option');
      option.value = name;
      option.text = name;
      select.appendChild(option);
    }

    // Set Basemaps selected option
    select.value = 'Basemaps';

    // Handle basemap change
    select.onchange = (e) => {
      const selected = baseStyles[e.target.value];
      if (!selected) return;

      map.setStyle(selected.url);
      map.once('style.load', () => {
        map.flyTo({
          center: selected.center,
          zoom: selected.zoom,
          speed: 0.8
        });
      });
    };

    styleControl.appendChild(select);

    map.addControl(
      {
        onAdd: () => styleControl,
        onRemove: () => {
          styleControl.parentNode.removeChild(styleControl);
        }
      },
      'top-left'
    );

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




  const handlePrintReport = () => {
    if (!clickedPlotDetails || !mapInstance) {
      alert("No plot selected or map not ready.");
      return;
    }
  
    const doc = new jsPDF();
    const { data, lat, lng } = clickedPlotDetails;
  
    // 📸 1. Map snapshot using Mapbox canvas
    const mapCanvas = mapInstance.getCanvas();
    const mapImage = mapCanvas.toDataURL("image/png");
  
    // 🧩 2. Demarcation data
    const cornersData = cornerMarkers.map(marker => {
      const label = marker.getElement().innerHTML;
      const { lng, lat } = marker.getLngLat();
      return { label, lat: lat.toFixed(6), lng: lng.toFixed(6) };
    });
  
    // 📍 3. Title
    doc.setFontSize(16);
    doc.text("Plot Report", 15, 15);
  
    // 📸 4. Map snapshot
    doc.setFontSize(12);
    doc.text("Plot Map Screenshot", 15, 25);
    doc.addImage(mapImage, 'PNG', 15, 30, 180, 100);
  
    let y = 135;
  
    // 📋 5. Plot Info
    doc.text("Plot Details", 15, y);
    y += 8;
    const info = [
      ["Town", data.town_name],
      ["Block", data.block],
      ["Plot No", data.plotno || data.plot_no],
      ["Division", data.division],
      ["District", data.district],
      ["Tehsil", data.tehsil],
      ["Landuse", data.landuse],
      ["Society Type", data.society_type || data.societytyp],
      ["Source", data.source],
      ["Remarks", data.illegal_remarks || "-"]
    ];
    info.forEach(([key, val]) => {
      doc.text(`${key}: ${val ?? "-"}`, 15, y);
      y += 7;
    });
  
    // 🧱 6. Demarcation table
    y += 8;
    doc.text("Demarcation (Corners)", 15, y);
    y += 6;
    cornersData.forEach(({ label, lat, lng }) => {
      doc.text(`${label}: Latitude ${lat}, Longitude ${lng}`, 15, y);
      y += 6;
    });
  
    // 🗺️ 7. Landuse Legend
    y += 6;
    doc.text("Landuse Legend", 15, y);
    y += 8;
    const colorMap = {
      "Illegal": "#e53935", "Commercial": "#000000", "Educational": "#2196f3",
      "Encroachment": "#795548", "Graveyard": "#9c27b0", "Health Facility": "#4caf50",
      "Nullah": "#00bcd4", "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
      "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
      "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
      "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd"
    };
    const legendKeys = Object.keys(colorMap);
    legendKeys.forEach((lu, index) => {
      const x = 15 + (index % 4) * 50;
      const rowY = y + Math.floor(index / 4) * 8;
  
      // Draw color box
      doc.setFillColor(colorMap[lu]);
      doc.rect(x, rowY, 4, 4, "F");
  
      // Label
      doc.setTextColor(0, 0, 0);
      doc.text(lu, x + 6, rowY + 3.5);
    });
  
    // 💾 Save file
    const plotLabel = data.plotno || data.plot_no || "Unknown";
    doc.save(`Plot_Report_${plotLabel}.pdf`);
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
          const popupContent = AllSocietiesPopup(data, lat, lng);
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
      'Plot No': data.plotno || data.plot_no,
      'Block': data.block,
      'Division': data.division,
      'District': data.district,
      'Tehsil': data.tehsil,
      'Society Type': data.societytyp || data.society_type,
      'Source': data.source,
      'Landuse': data.landuse,
      'Latitude': lat.toFixed(6),
      'Longitude': lng.toFixed(6),
      'Remarks': data.illegal_remarks || '-'
    };

    return (
      <div className="plot-card-container fancy-expanded">

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







  const handleClassClick = (cls) => {
    setSelectedLanduseClass(cls);
    if (!fullGeojsonBackup || !mapInstance) return;

    const filtered = {
      ...fullGeojsonBackup,
      features: fullGeojsonBackup.features.filter(f => f.properties?.landuse === cls)
    };

    if (mapInstance.getLayer('spatial-query-layer')) {
      mapInstance.removeLayer('spatial-query-layer');
      mapInstance.removeSource('spatial-query-layer');
    }

    mapInstance.addSource('spatial-query-layer', { type: 'geojson', data: filtered });
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

    const bounds = new mapboxgl.LngLatBounds();
    filtered.features.forEach(f => {
      const geom = f.geometry;
      if (geom.type === 'Polygon') geom.coordinates[0].forEach(c => bounds.extend(c));
      else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => p[0].forEach(c => bounds.extend(c)));
    });

    if (!bounds.isEmpty()) mapInstance.fitBounds(bounds, { padding: 40, duration: 1000 });
    setGeojsonData(filtered);
  };


  const handleReset = () => {
    setSelectedLanduseClass(null);
    setGeojsonData(null);                     // Clear GeoJSON layer
    setSelectedLanduseClass(null);           // Clear selected chart/legend class
    setHighlightedPlot(null);                // Remove any highlighted plot
    setClickedPlotDetails(null);




    if (!fullGeojsonBackup || !mapInstance) return;

    if (mapInstance.getLayer('spatial-query-layer')) {
      mapInstance.removeLayer('spatial-query-layer');
      mapInstance.removeSource('spatial-query-layer');
    }

    mapInstance.addSource('spatial-query-layer', { type: 'geojson', data: fullGeojsonBackup });
    mapInstance.addLayer({
      id: 'spatial-query-layer',
      type: 'fill',
      source: 'spatial-query-layer',
      paint: {
        'fill-color': [
          'match',
          ['get', 'landuse'],
          "Commercial", "#000000", "Educational", "#2196f3", "Residential", "#03a9f4",
          "Illegal", "#e53935", "Others", "#607d8b", "Park", "#8bc34a", "Open Space", "#cddc39",
          "Graveyard", "#9c27b0", "Public Building", "#ff5722", "Religious", "#673ab7",
          "Encroachment", "#795548", "Recreational Facility", "#3f51b5", "Health Facility", "#4caf50",
          "Nullah", "#00bcd4", "Village", "#ff9800", "Parking", "#ffc107", "Road", "#9e9e9e",
          "Unclassified", "#bdbdbd", "#bdbdbd"
        ],
        'fill-opacity': 0.6,
        'fill-outline-color': '#333'
      }
    });

    setGeojsonData(fullGeojsonBackup);


  };


  function getAngleBetween(p1, p2, p3) {
    const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
    const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);

    const angleRad = Math.acos(dot / (mag1 * mag2));
    return (angleRad * 180) / Math.PI;
  }


  function getSimplifiedCornerLabels(geometry, tolerance = 0.00005, angleThreshold = 160) {
    const coordinates =
      geometry.type === 'Polygon'
        ? geometry.coordinates[0]
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates[0][0]
          : [];

    if (!coordinates.length) return [];

    // Remove duplicated last point if polygon is closed
    const uniqueCoords = [...coordinates];
    if (
      coordinates.length > 1 &&
      coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
      coordinates[0][1] === coordinates[coordinates.length - 1][1]
    ) {
      uniqueCoords.pop();
    }

    const corners = [];

    for (let i = 0; i < uniqueCoords.length; i++) {
      const prev = uniqueCoords[(i - 1 + uniqueCoords.length) % uniqueCoords.length];
      const current = uniqueCoords[i];
      const next = uniqueCoords[(i + 1) % uniqueCoords.length];

      const angle = getAngleBetween(prev, current, next);
      if (angle < angleThreshold) {
        corners.push(current);
      }
    }

    // Always push if there are 4 or fewer points (force label corners)
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (corners.length ? corners : uniqueCoords.slice(0, 6)).map((lngLat, idx) => ({
      label: labels[idx],
      lngLat,
    }));
  }




  const handlePlotClick = (plot) => {
    setHighlightedPlot(plot.properties.plot_no);

    const bounds = new mapboxgl.LngLatBounds();
    const geom = plot.geometry;

    if (geom.type === 'Polygon') {
      geom.coordinates[0].forEach((c) => bounds.extend(c));
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((poly) => poly[0].forEach((c) => bounds.extend(c)));
    }

    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, { padding: 60, duration: 800 });
    }

    let lat = 0, lng = 0;
    if (geom.type === 'Polygon') {
      lat = parseFloat(geom.coordinates[0]?.[0]?.[1]) || 0;
      lng = parseFloat(geom.coordinates[0]?.[0]?.[0]) || 0;
    } else if (geom.type === 'MultiPolygon') {
      lat = parseFloat(geom.coordinates[0]?.[0]?.[0]?.[1]) || 0;
      lng = parseFloat(geom.coordinates[0]?.[0]?.[0]?.[0]) || 0;
    }

    setClickedPlotDetails({ data: plot.properties, lat, lng });

    // 🧠 Add labeled corners
    const corners = getSimplifiedCornerLabels(geom, 0.00005, 160);
    cornerMarkers.forEach((m) => m.remove());

    const newMarkers = corners.map(({ label, lngLat }) => {
      const el = document.createElement('div');
      el.className = 'corner-marker-label';
      el.innerHTML = label;

      return new mapboxgl.Marker(el)
        .setLngLat(lngLat)
        .setPopup(
          new mapboxgl.Popup({ offset: 8 }).setHTML(
            `<strong>Corner ${label}</strong><br/>Lat: ${lngLat[1].toFixed(8)}<br/>Lng: ${lngLat[0].toFixed(8)}`
          )
        )
        .addTo(mapInstance);
    });




    if (showCornerPopup) {
      const corners = getSimplifiedCornerLabels(plot.geometry, 0.00005, 160);
      cornerMarkers.forEach(marker => marker.remove());

      const newMarkers = corners.map(({ label, lngLat }) => {
        const el = document.createElement('div');
        el.className = 'corner-marker-label';
        el.innerHTML = label;

        return new mapboxgl.Marker(el)
          .setLngLat(lngLat)
          .setPopup(
            new mapboxgl.Popup({ offset: 8 }).setHTML(
              `<strong>Corner ${label}</strong><br/>Lat: ${lngLat[1].toFixed(6)}<br/>Lng: ${lngLat[0].toFixed(6)}`
            )
          )
          .addTo(mapInstance);
      });

      setCornerMarkers(newMarkers);
    }


  };


  return (
    <>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 6,
          right: 10,
          zIndex: 1000,
          padding: '8px 6px',
          backgroundColor: '#ffffff',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px', font: 'Open Sans, sans-serif'
        }}
      >
        Back to Home
      </button>

      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: '#003366;', height: '48px' }}>
        <Toolbar sx={{ minHeight: '48px !important', px: 2 }}>
          <Typography variant="subtitle1" sx={{ fontSize: '19px' }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>



      <Container
        maxWidth={false}
        disableGutters
        sx={{
          p: 2, transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', // counteracts scale shrink to fill horizontal
        }}
      >

        <Box height="100%">
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Map - Full Left Side */}
            <Grid item xs={12} md={6}>
            <div id="screenshot-container" style={{ width: '100%', height: '100%' }}>
  <Box ref={mapRef} sx={{ width: '100%', height: '100%', borderRadius: 2 }} />
</div>

              <Button
                variant="contained"
                color="primary"
                onClick={handlePrintReport}
                sx={{ mb: 1 }}
              >
                🖨️ Print Report
              </Button>

              {clickedPlotDetails && showPlotPopup && (
                <PlotInfoPopup
                  plot={clickedPlotDetails}
                  map={mapInstance}
                  showCorners={showCornerPopup}
                  onToggleCorners={() => setShowCornerPopup(prev => !prev)}
                  onClose={() => {
                    setClickedPlotDetails(null);
                    setShowPlotPopup(false);
                    cornerMarkers.forEach((m) => m.remove());
                  }}
                />
              )}

            </Grid>

            {/* Right Side: Chart + Legend + SpatialQuery + Blocks */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Chart + Legend + Block 3 */}
                <Grid item xs={12} md={6}>

                  {/* Chart */}
                  <Card sx={{ height: 290, border: '1px solid #003366', }}>
                    <CardContent sx={{ pt: 1, pb: 1 }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: -4, mt: 1 }}>
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
                  <Card sx={{ height: 310, mt: 2, overflowY: 'auto', border: '1px solid #003366', }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Legend
                      </Typography>
                      <LanduseLegend
                        data={chartData}
                        selectedClass={selectedLanduseClass}
                        onClassClick={handleClassClick}
                        ref={legendRef}
                      />
                    </CardContent>
                  </Card>


                  {/* Block 4 - Selected Plot Numbers */}
                  <Card
                    sx={{
                      height: 210,
                      width: '100%',
                      mt: 2,
                      border: '1px solid #003366',
                      borderRadius: 1,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Fixed Title Section */}
                    <CardContent sx={{ borderBottom: '1px solid #ddd', py: 1.5, px: 2 }}>
                      <Typography variant="h6">
                        Selected Plots – {selectedLanduseClass?.toUpperCase() || "None"}
                      </Typography>
                    </CardContent>

                    {/* Scrollable Plot List */}
                    <Box
                      sx={{
                        flex: 1,
                        overflowY: 'auto',
                        px: 2,
                        py: 1,
                        '&::-webkit-scrollbar': {
                          width: '6px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#ccc',
                          borderRadius: '4px'
                        },
                        '&:hover::-webkit-scrollbar-thumb': {
                          backgroundColor: '#999'
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      {geojsonData?.features?.length && selectedLanduseClass ? (
                        geojsonData.features
                          .filter(f => f.properties.landuse === selectedLanduseClass)
                          .sort((a, b) => parseInt(a.properties.plot_no) - parseInt(b.properties.plot_no))
                          .map((f, i) => (
                            <Box
                              key={i}
                              onClick={() => handlePlotClick(f)}
                              sx={{
                                cursor: 'pointer',
                                backgroundColor: highlightedPlot === f.properties.plot_no ? '#c8e6c9' : '#fff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                mb: 1,
                                fontWeight: 500,
                                fontSize: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                transition: '0.3s',
                                '&:hover': { backgroundColor: '#e3f2fd' }
                              }}
                            >
                              <span>Plot No:</span>
                              <span>{f.properties.plot_no || 'N/A'}</span>
                            </Box>
                          ))
                      ) : (
                        <Typography variant="body2" align="center" color="text.secondary">
                          Select a landuse class to view plot numbers.
                        </Typography>
                      )}
                    </Box>
                  </Card>

                </Grid>

                {/* SpatialQuery + Block 4 */}
                <Grid item xs={12} md={6}>
                  {/* SpatialQuery */}
                  <Card sx={{ height: 420, border: '1px solid #003366' }}>
                    <CardContent sx={{ height: '100%', overflowY: 'auto' }}>
                      <Typography variant="h6" sx={{ marginBottom: '20px' }}>Spatial Query</Typography>

                      {mapInstance && (
                        <SpatialQuery
                          map={mapInstance}
                          landuseFilter={selectedLanduseClass}
                          geojsonData={geojsonData}
                          setGeojsonData={setGeojsonData}
                          setFullGeojsonBackup={setFullGeojsonBackup}
                          setClickedPlotDetails={setClickedPlotDetails}
                        />
                      )}
                    </CardContent>
                  </Card>
                  {/* Block 4: Selected Plots List */}

                  {/* Block 3: Plot Details */}
                  <Card
                    elevation={3}
                    sx={{
                      height: 405, // Fixed height
                      width: '100%',
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',

                      border: '1px solid #003366',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Fixed Header */}
                    <CardContent
                      sx={{
                        borderBottom: '1px solid #ddd',
                        py: 1.5,
                        px: 2,
                        flexShrink: 0, // Ensures header doesn't expand
                      }}
                    >
                      <Typography variant="h6">Plot Details</Typography>
                    </CardContent>

                    {/* Scrollable Body */}
                    <Box
                      sx={{
                        flex: 1, // Fills remaining space
                        overflowY: 'auto',
                        px: 2,
                        py: 1,
                        '&::-webkit-scrollbar': {
                          width: '6px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#ccc',
                          borderRadius: '4px'
                        },
                        '&:hover::-webkit-scrollbar-thumb': {
                          backgroundColor: '#999'
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      <PlotDetailCard plot={clickedPlotDetails} />
                    </Box>
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
