import { useRef, useEffect, useState } from 'react';
import Papa from 'papaparse'; // For CSV parsing
import GeoTIFF from 'geotiff';
import mapboxgl from 'mapbox-gl';
import shp from 'shpjs'; // Library to parse shapefiles
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as turf from '@turf/turf';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
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
      // Add Default Custom Points Layer
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
    
      // Add Defaulter Layer
      map.addSource('defaulter-layer', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.3156, 31.4728],
              },
              properties: {
                title: 'Defaulter Point 1',
                description: 'Defaulter description 1.',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.3317, 31.3677],
              },
              properties: {
                title: 'House 201 - Sector B',
                description: 'Owner: Kashif Khan, Status: Defaulter <a href="http://localhost/sms/admin/individual.php" target="_blank">View Defaulter Details</a>',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.3317, 31.36805],
              },
              properties: {
                title: 'House 303 - Sector B',
                description: 'Owner: Muhammad Ali, Status: Defaulter <a href="http://localhost/sms/admin/defaulter.html" target="_blank">View Defaulter Details</a>',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.3367, 31.3720],
              },
              properties: {
                title: 'House 304 - Sector B',
                description: 'Owner: Abbas Khan, Status: Defaulter <a href="http://localhost/sms/admin/defaulter.html" target="_blank">View Defaulter Details</a>',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [74.3317, 31.3687],
              },
              properties: {
                title: 'House 305 - Sector B',
                description: 'Owner: Subhan Kamran, Status: Defaulter <a href="http://localhost/sms/admin/defaulter.html" target="_blank">View Defaulter Details</a>',
              },
            },
          ],
        },
      });
    
      map.addLayer({
        id: 'defaulter-layer',
        type: 'circle',
        source: 'defaulter-layer',
        paint: {
          'circle-radius': 10,
          'circle-color': '#FF0000', // Red color for defaulters
        },
      });
    
      // Add Popup and Interaction for Custom Layer
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
    
      // Add Popup and Interaction for Defaulter Layer
      map.on('click', 'defaulter-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, description } = e.features[0].properties;
    
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${title}</h3><p>${description}</p>`)
          .addTo(map);
      });
    
      map.on('mouseenter', 'defaulter-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
    
      map.on('mouseleave', 'defaulter-layer', () => {
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
            'fill-color': '#070707',
            'fill-opacity': 0.3,
          },
        });
      }
    });

    // Add Draw Tool
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true,
      },
    });
    map.addControl(draw, 'top-right');

    map.on('draw.create', () => {
      console.log('Drawn features:', draw.getAll());
    });

    map.on('draw.update', () => {
      console.log('Updated features:', draw.getAll());
    });

    // Add Geocoder (Search Bar)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // map.addControl(geocoder, 'top-left');
    map.addControl(geocoder, 'top-right', )
    geocoder.on('result', (e) => {
      const coordinates = e.result.center;
      map.flyTo({ center: coordinates, zoom: 14 });
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
