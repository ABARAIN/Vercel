import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import shp from 'shpjs';
import GeoTIFF from 'geotiff';
import * as d3 from 'd3'; // For parsing CSV
import Sidebar from './components/Sidebar';
import LayerSwitcher from './components/LayerSwitcher';
import './App.css';

const INITIAL_CENTER = [74.3218, 31.3668];
const INITIAL_ZOOM = 12.25;

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [basemap, setBasemap] = useState('mapbox://styles/mapbox/streets-v11');
  const [layers, setLayers] = useState([]);
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

    return () => map.remove();
  }, [basemap]);

  const handleBasemapChange = (style) => setBasemap(style);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    try {
      if (fileType === 'zip') {
        // Shapefile upload
        const arrayBuffer = await file.arrayBuffer();
        const geojson = await shp(arrayBuffer);
        addLayer(geojson, 'shapefile', file.name);
      } else if (fileType === 'csv') {
        // CSV upload
        const text = await file.text();
        const csvData = await d3.csvParse(text);
        const geojson = {
          type: 'FeatureCollection',
          features: csvData.map((row) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(row.lng), parseFloat(row.lat)],
            },
            properties: row,
          })),
        };
        addLayer(geojson, 'csv', file.name);
      } else if (fileType === 'tiff' || fileType === 'tif') {
        // Raster upload (GeoTIFF)
        addRasterLayer(file);
      } else {
        setUploadMessage('Unsupported file type.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadMessage('Failed to upload file. Please try again.');
    } finally {
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const addLayer = (geojson, type, name) => {
    const map = mapRef.current;
    const id = `${type}-${name}`;
    map.addSource(id, { type: 'geojson', data: geojson });
  
    map.addLayer({
      id,
      type: type === 'csv' ? 'circle' : 'fill',
      source: id,
      paint: {
        ...(type === 'csv'
          ? {
              'circle-radius': 6,
              'circle-color': '#ff5722',
            }
          : {
              'fill-color': '#070707',
              'fill-opacity': 0.5,
            }),
      },
    });
  
    // Pan and zoom to the extent of the new GeoJSON data
    const bounds = geojson.features
      ? geojson.features.reduce(
          (bounds, feature) => {
            const coordinates = feature.geometry.coordinates;
            if (feature.geometry.type === 'Point') {
              return bounds.extend(coordinates);
            } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
              const coords = feature.geometry.type === 'Polygon' ? [coordinates] : coordinates;
              coords.flat(2).forEach((coord) => bounds.extend(coord));
            }
            return bounds;
          },
          new mapboxgl.LngLatBounds()
        )
      : null;
  
    if (bounds && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 20, maxZoom: 15 });
    }
  
    setLayers((prev) => [...prev, { id, name, visible: true }]);
  };
  
  const addRasterLayer = async (file) => {
    const map = mapRef.current;
    const id = `raster-${file.name}`;
  
    try {
      // Read the GeoTIFF file
      const tiff = await GeoTIFF.fromFile(file);
      const image = await tiff.getImage();
  
      const [minX, minY, maxX, maxY] = image.getBoundingBox(); // Get the GeoTIFF's bounding box
      const width = image.getWidth();
      const height = image.getHeight();
      const rasters = await image.readRasters();
  
      // Create a canvas to render the raster
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(width, height);
  
      // Populate the canvas with raster data (assuming single-band grayscale)
      for (let i = 0; i < rasters[0].length; i++) {
        const value = rasters[0][i];
        imageData.data[i * 4] = value; // Red
        imageData.data[i * 4 + 1] = value; // Green
        imageData.data[i * 4 + 2] = value; // Blue
        imageData.data[i * 4 + 3] = 255; // Alpha
      }
      ctx.putImageData(imageData, 0, 0);
  
      // Convert canvas to a data URL for raster display
      const rasterURL = canvas.toDataURL();
  
      // Add the raster as an image source to Mapbox
      map.addSource(id, {
        type: 'image',
        url: rasterURL,
        coordinates: [
          [minX, maxY], // Top-left
          [maxX, maxY], // Top-right
          [maxX, minY], // Bottom-right
          [minX, minY], // Bottom-left
        ],
      });
  
      map.addLayer({
        id,
        source: id,
        type: 'raster',
        paint: {
          'raster-opacity': 0.8,
        },
      });
  
      // Zoom to the raster bounds
      map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 20 });
  
      setLayers((prev) => [...prev, { id, name: file.name, visible: true }]);
    } catch (error) {
      console.error('Error loading GeoTIFF:', error);
      setUploadMessage('Failed to upload GeoTIFF. Please try again.');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const toggleLayerVisibility = (layerId) => {
    const map = mapRef.current;
    const layer = layers.find((l) => l.id === layerId);

    if (layer) {
      const visibility = layer.visible ? 'none' : 'visible';
      map.setLayoutProperty(layerId, 'visibility', visibility);
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
      );
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
        uploadMessage={uploadMessage}
        onReset={handleReset}
      />
      <LayerSwitcher layers={layers} onToggleLayer={toggleLayerVisibility} />
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
