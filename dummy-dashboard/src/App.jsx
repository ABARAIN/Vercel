import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import shp from 'shpjs';
import Sidebar from './components/Sidebar';
import './App.css';

const INITIAL_CENTER = [74.3218, 31.3668];
const INITIAL_ZOOM = 12.25;

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [basemap, setBasemap] = useState('mapbox://styles/mapbox/streets-v11');
  const [shapefileLayer, setShapefileLayer] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: basemap,
      center,
      zoom,
    });

    mapRef.current = map;

    map.on('move', () => {
      const mapCenter = map.getCenter();
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(map.getZoom());
    });

    map.on('load', () => {
      if (shapefileLayer) {
        map.addSource('shapefile-layer', {
          type: 'geojson',
          data: shapefileLayer.data,
        });

        map.addLayer({
          id: 'shapefile-layer',
          type: 'fill',
          source: 'shapefile-layer',
          paint: {
            'fill-color': '#070707',
            'fill-opacity': 0.3,
          },
        });
      }
    });

    return () => map.remove();
  }, [basemap]);

  const handleBasemapChange = (style) => setBasemap(style);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    try {
      const geojson = await shp(arrayBuffer);

      if (geojson) {
        const map = mapRef.current;

        if (shapefileLayer) {
          map.removeLayer('shapefile-layer');
          map.removeSource('shapefile-layer');
        }

        map.addSource('shapefile-layer', {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: 'shapefile-layer',
          type: 'fill',
          source: 'shapefile-layer',
          paint: {
            'fill-color': '#070707',
            'fill-opacity': 0.5,
          },
        });

        setShapefileLayer({ id: 'shapefile-layer', data: geojson });
        setUploadMessage('Shapefile uploaded successfully!');
      }
    } catch (error) {
      console.error('Error processing shapefile:', error);
      setUploadMessage('Failed to upload shapefile. Please try again.');
    } finally {
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const handleRemoveLayer = () => {
    const map = mapRef.current;

    if (shapefileLayer) {
      map.removeLayer('shapefile-layer');
      map.removeSource('shapefile-layer');
      setShapefileLayer(null);
    }
  };

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
    }
  };

  return (
    <>
      <Sidebar
        center={center}
        zoom={zoom}
        onBasemapChange={handleBasemapChange}
        onFileUpload={handleFileUpload}
        onRemoveLayer={handleRemoveLayer}
        uploadMessage={uploadMessage}
        onReset={handleReset}
      />
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
