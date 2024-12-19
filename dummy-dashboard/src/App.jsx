import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import shp from 'shpjs';
import * as d3 from 'd3';
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
    mapboxgl.accessToken =
      'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: basemap,
      center,
      zoom,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Restore uploaded layers on map load
      layers.forEach(({ id, source, layer }) => {
        if (!map.getSource(id)) {
          map.addSource(id, source);
        }
        if (!map.getLayer(id)) {
          map.addLayer(layer);
          addShapefileInteraction(id); // Re-add click event for restored shapefile layers
        }
      });
    });

    map.on('move', () => {
      const mapCenter = map.getCenter();
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(map.getZoom());
    });

    return () => map.remove();
  }, [basemap]);

  const handleBasemapChange = (style) => {
    setBasemap(style);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    try {
      if (fileType === 'zip') {
        const arrayBuffer = await file.arrayBuffer();
        const geojson = await shp(arrayBuffer);
        addShapefileLayer(geojson, file.name);
      } else if (fileType === 'csv') {
        const text = await file.text();
        const csvData = d3.csvParse(text);
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

  const addShapefileLayer = (geojson, name) => {
    const map = mapRef.current;
    const id = `shapefile-${name}`;
    const source = { type: 'geojson', data: geojson };

    const layer = {
      id,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': '#070707',
        'fill-opacity': 0.5,
      },
    };

    if (!map.getSource(id)) {
      map.addSource(id, source);
    }

    if (!map.getLayer(id)) {
      map.addLayer(layer);
    }

    // Add popup interaction for attributes
    addShapefileInteraction(id);

    // Fit bounds to shapefile
    const bounds = geojson.features.reduce((bounds, feature) => {
      if (feature.geometry.type === 'Point') {
        bounds.extend(feature.geometry.coordinates);
      } else if (
        feature.geometry.type === 'Polygon' ||
        feature.geometry.type === 'MultiPolygon'
      ) {
        const coordinates =
          feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates]
            : feature.geometry.coordinates;
        coordinates.flat(2).forEach((coord) => bounds.extend(coord));
      }
      return bounds;
    }, new mapboxgl.LngLatBounds());

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 20, maxZoom: 15 });
    }

    setLayers((prev) => [...prev, { id, name, visible: true, source, layer }]);
  };

  const addShapefileInteraction = (id) => {
    const map = mapRef.current;

    map.on('click', id, (e) => {
      const properties = e.features[0].properties;
      const coordinates = e.lngLat;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          Object.keys(properties)
            .map((key) => `<div><strong>${key}:</strong> ${properties[key]}</div>`)
            .join('')
        )
        .addTo(map);
    });

    map.on('mouseenter', id, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', id, () => {
      map.getCanvas().style.cursor = '';
    });
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
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}

export default App;
