import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import shp from 'shpjs'; // Library to parse shapefiles

import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

const INITIAL_CENTER = [74.30091848275428, 31.479157820992256];
const INITIAL_ZOOM = 12.9;

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [basemap, setBasemap] = useState('mapbox://styles/mapbox/streets-v11');
  const [shapefileLayer, setShapefileLayer] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: basemap,
      center: center,
      zoom: zoom,
    });

    mapRef.current = map;

    map.on('move', () => {
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();

      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
    });

    map.on('load', () => {
      map.addSource('custom-layer', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.31069294510968, 31.473689494603054],
              },
              properties: {
                title: 'Nespak House',
                description: 'This is the main office of Nespak.',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.30113123415276, 31.479261051114776],
              },
              properties: {
                title: 'Cholistan Office',
                description: 'This is the project office of Nespak.',
              },
            },
          ],
        },
      });

      map.addLayer({
        id: 'custom-layer',
        type: 'circle',
        source: 'custom-layer',
        paint: {
          'circle-radius': 10,
          'circle-color': '#007cbf',
        },
      });

      map.on('click', 'custom-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, description } = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${title}</h3><p>${description}</p>`)
          .addTo(map);
      });

      map.on('mouseenter', 'custom-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'custom-layer', () => {
        map.getCanvas().style.cursor = '';
      });

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
            'fill-color': '#888888',
            'fill-opacity': 0.5,
          },
        });
      }
    });

    return () => map.remove();
  }, [basemap]);

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
      });
    }
  };

  const handleBasemapChange = (style) => {
    setBasemap(style);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);
  
    if (geojson) {
      const map = mapRef.current;
  
      // Remove the existing shapefile layer and source if present
      if (shapefileLayer) {
        map.removeLayer('shapefile-layer');
        map.removeSource('shapefile-layer');
      }
  
      // Add the new shapefile source and layer
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
          'fill-opacity': 0.9,
        },
      });
  
      // Update the state with the new shapefile data
      setShapefileLayer({ id: 'shapefile-layer', data: geojson });
  
      // Display success message
      setUploadMessage('Shapefile uploaded successfully!');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };
  

  const handleRemoveLayer = () => {
    const map = mapRef.current;
  
    if (shapefileLayer) {
      // Remove the shapefile layer and source from the map
      map.removeLayer('shapefile-layer');
      map.removeSource('shapefile-layer');
      setShapefileLayer(null); // Clear the state
    }
  };

  return (
    <>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
      <div className="buttons-container">
        <button className="basemap-button" onClick={() => handleBasemapChange('mapbox://styles/mapbox/streets-v11')}>
          Streets
        </button>
        <button className="basemap-button" onClick={() => handleBasemapChange('mapbox://styles/mapbox/satellite-v9')}>
          Satellite
        </button>
        <button
          className="basemap-button"
          onClick={() => handleBasemapChange('mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y')}
        >
          3D Map
        </button>
        <input type="file" accept=".zip" onChange={handleFileUpload} className="upload-input" />
        <button className="remove-button" onClick={handleRemoveLayer}>
          Remove Shapefile
        </button>
      </div>
      {uploadMessage && <div className="upload-message">{uploadMessage}</div>}
      <button onClick={handleReset} className="reset-button">
        Reset
      </button>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
