import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import shp from 'shpjs';
import * as d3 from 'd3';
import wkt from 'wkt';
import Sidebar from './components/Sidebar';
import LayerSwitcher from './components/LayerSwitcher';
import './styles/App.css';

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

  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [mauzas, setMauzas] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedMauza, setSelectedMauza] = useState('');

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
      restoreLayersAndInteractions();
      if (selectedDistrict || selectedTehsil || selectedMauza) {
        fetchFilteredData();
      }
    });

    map.on('move', () => {
      const mapCenter = map.getCenter();
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(map.getZoom());
    });

    return () => map.remove();
  }, [basemap]);

  const restoreLayersAndInteractions = () => {
    const map = mapRef.current;
    layers.forEach(({ id, source, layer, relatedLayers, visible }) => {
      if (!map.getSource(id)) {
        map.addSource(id, source);
      }

      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
        map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
      }

      if (relatedLayers) {
        relatedLayers.forEach((relatedLayer) => {
          if (!map.getLayer(relatedLayer.id)) {
            map.addLayer(relatedLayer);
            map.setLayoutProperty(relatedLayer.id, 'visibility', visible ? 'visible' : 'none');
          }
        });
      }

      // Reattach interactions
      addShapefileInteraction(layer.id);
    });
  };
  
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

    const isPointData =
      geojson.features.length > 0 &&
      geojson.features.every((feature) => feature.geometry.type === 'Point');

    const fillLayer = {
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': '#ffd400',
        'fill-opacity': 0.5,
      },
    };

    const lineLayer = {
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': '#000000', // Black boundary
        'line-width': 2,
      },
    };

    const circleLayer = {
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-radius': 6,
        'circle-color': '#FF5722',
        'circle-opacity': 0.8,
      },
    };

    if (!map.getSource(id)) {
      map.addSource(id, source);
    }

    if (isPointData) {
      if (!map.getLayer(id)) {
        map.addLayer(circleLayer);
      }
    } else {
      if (!map.getLayer(fillLayer.id)) {
        map.addLayer(fillLayer);
      }
      if (!map.getLayer(lineLayer.id)) {
        map.addLayer(lineLayer);
      }
    }

    // Add interactions
    if (!isPointData) {
      addShapefileInteraction(fillLayer.id);
    } else {
      addShapefileInteraction(id);
    }

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

    setLayers((prev) => [
      ...prev,
      {
        id,
        name,
        visible: true,
        source,
        layer: isPointData ? circleLayer : fillLayer,
        relatedLayers: isPointData ? [] : [lineLayer],
      },
    ]);
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
  
      // Toggle visibility for the main layer and any related layers
      const layersToToggle = [layer.layer.id, ...(layer.relatedLayers?.map((l) => l.id) || [])];
      layersToToggle.forEach((id) => {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', visibility);
        }
      });
  
      // Update state to reflect the new visibility
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId ? { ...l, visible: !l.visible } : l
        )
      );
    }
  };
  

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
    }
  };

  useEffect(() => {
    // Fetch available districts from the backend
    axios.get('http://localhost:8000/api/joined-mauza-districts/')
      .then((response) => {
        const uniqueDistricts = [
          ...new Set(response.data.map((feature) => feature.district)),
        ];
        setDistricts(uniqueDistricts);
      })
      .catch((error) => console.error('Error fetching districts:', error));
  }, []);

  const fetchFilteredData = () => {
    const params = {};
    if (selectedDistrict) params.district = selectedDistrict;
    if (selectedTehsil) params.tehsil = selectedTehsil;
    if (selectedMauza) params.mauza = selectedMauza;

    axios
      .get('http://localhost:8000/api/joined-mauza-districts/', { params })
      .then((response) => {
        const geojson = {
          type: 'FeatureCollection',
          features: response.data.map((feature) => {
            const geom = feature.geom.replace('SRID=4326;', ''); // Strip SRID
            return {
              type: 'Feature',
              geometry: wkt.parse(geom), 
              properties: feature,
            };
          }),
        };
        addLayer(geojson, 'filtered-layer');
      })
      .catch((error) => console.error('Error fetching filtered data:', error));
  };

  const addLayer = (geojson, layerId) => {
    const map = mapRef.current;

    if (map.getSource(layerId)) {
      map.getSource(layerId).setData(geojson);
    } else {
      map.addSource(layerId, { type: 'geojson', data: geojson });
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: layerId,
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.5,
        },
      });
      map.addLayer({
        id: `${layerId}-line`,
        type: 'line',
        source: layerId,
        paint: {
          'line-color': '#000', // Black color for the boundaries
          'line-width': 2, // Adjust the width as needed
        },
      });
    }

    const bounds = geojson.features.reduce((bounds, feature) => {
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.flat(2).forEach((coord) => bounds.extend(coord));
      }
      return bounds;
    }, new mapboxgl.LngLatBounds());

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 20, maxZoom: 15 });
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedTehsil('');
    setSelectedMauza('');

    axios
      .get('http://localhost:8000/api/joined-mauza-districts/', {
        params: { district },
      })
      .then((response) => {
        const uniqueTehsils = [
          ...new Set(response.data.map((feature) => feature.tehsil)),
        ];
        setTehsils(uniqueTehsils);
      })
      .catch((error) => console.error('Error fetching tehsils:', error));
  };

  const handleTehsilChange = (tehsil) => {
    setSelectedTehsil(tehsil);
    setSelectedMauza('');

    axios
      .get('http://localhost:8000/api/joined-mauza-districts/', {
        params: { district: selectedDistrict, tehsil },
      })
      .then((response) => {
        const uniqueMauzas = [
          ...new Set(response.data.map((feature) => feature.mauza)),
        ];
        setMauzas(uniqueMauzas);
      })
      .catch((error) => console.error('Error fetching mauzas:', error));
  };

  return (
    <>
      <div className="map-title">Central Monitoring Dashboard Map</div>
      <Sidebar
        center={center}
        zoom={zoom}
        onBasemapChange={handleBasemapChange}
        onFileUpload={handleFileUpload}
        uploadMessage={uploadMessage}
        onReset={handleReset}
      />
      <LayerSwitcher layers={layers} onToggleLayer={toggleLayerVisibility} />
      <div className="filters">
      <label>
          District:
          <select onChange={(e) => handleDistrictChange(e.target.value)} value={selectedDistrict}>
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
        {selectedDistrict && (
          <label>
            Tehsil:
            <select onChange={(e) => handleTehsilChange(e.target.value)} value={selectedTehsil}>
              <option value="">Select Tehsil</option>
              {tehsils.map((tehsil) => (
                <option key={tehsil} value={tehsil}>
                  {tehsil}
                </option>
              ))}
            </select>
          </label>
        )}
        {selectedTehsil && (
          <label>
            Mauza:
            <select onChange={(e) => setSelectedMauza(e.target.value)} value={selectedMauza}>
              <option value="">Select Mauza</option>
              {mauzas.map((mauza) => (
                <option key={mauza} value={mauza}>
                  {mauza}
                </option>
              ))}
            </select>
          </label>
        )}
        <button onClick={fetchFilteredData}>Apply Filters</button>
      </div>
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}

export default App;
