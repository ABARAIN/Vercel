import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SpatialQuery.css';
import AllSocietiesPopup from './popups/AllSocietiesPopup'; // adjust path if needed
import mapboxgl from 'mapbox-gl'; // Ensure this is imported if not already

const SpatialQuery = ({ map }) => {
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [towns, setTowns] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [plots, setPlots] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedPlot, setSelectedPlot] = useState('');

  const LAYER_ID = 'spatial-query-layer';

  // Load Districts
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/all-soc-dropdowns/?level=district')
      .then(res => setDistricts(res.data))
      .catch(err => console.error('District fetch error:', err));
  }, []);

  // Load Tehsils on District change
  useEffect(() => {
    setTehsils([]);
    setSelectedTehsil('');
    setTowns([]); setSelectedTown('');
    if (selectedDistrict) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=tehsil&district=${selectedDistrict}`)
        .then(res => setTehsils(res.data));
    }
  }, [selectedDistrict]);

  // Load Towns
  useEffect(() => {
    setTowns([]); setSelectedTown('');
    setBlocks([]); setSelectedBlock('');
    if (selectedDistrict && selectedTehsil) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=town_name&district=${selectedDistrict}&tehsil=${selectedTehsil}`)
        .then(res => setTowns(res.data));
    }
  }, [selectedTehsil]);

  // Load Blocks
  useEffect(() => {
    setBlocks([]); setSelectedBlock('');
    setPlots([]); setSelectedPlot('');
    if (selectedDistrict && selectedTehsil && selectedTown) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=block&district=${selectedDistrict}&tehsil=${selectedTehsil}&town_name=${selectedTown}`)
        .then(res => setBlocks(res.data));
    }
  }, [selectedTown]);

  // Load Plots
  useEffect(() => {
    setPlots([]); setSelectedPlot('');
    if (selectedDistrict && selectedTehsil && selectedTown && selectedBlock) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=plot_no&district=${selectedDistrict}&tehsil=${selectedTehsil}&town_name=${selectedTown}&block=${selectedBlock}`)
        .then(res => setPlots(res.data));
    }
  }, [selectedBlock]);

  const handleShow = async () => {
    if (!map) {
      console.error("❌ Map object is not ready yet.");
      return;
    }
  
    const params = {};
    if (selectedDistrict) params.district = selectedDistrict;
    if (selectedTehsil) params.tehsil = selectedTehsil;
    if (selectedTown) params.town_name = selectedTown;
    if (selectedBlock) params.block = selectedBlock;
    if (selectedPlot) params.plot_no = selectedPlot;
  
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/all-soc-geojson/', { params });
      const geojson = response.data;
  
      console.log("📦 Fetched GeoJSON from backend:", geojson);
  
      if (!geojson.features || geojson.features.length === 0) {
        alert("No geometry found for selected filters.");
        return;
      }
  
      // 🔄 Remove previous layer if it exists
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
        map.removeSource(LAYER_ID);
      }
  
      // ➕ Add new source and layer
      map.addSource(LAYER_ID, {
        type: 'geojson',
        data: geojson,
      });
  
      map.addLayer({
        id: LAYER_ID,
        type: 'fill',
        source: LAYER_ID,
        paint: {
          'fill-color': '#1e90ff',
          'fill-opacity': 0.4,
          'fill-outline-color': '#000000',
        },
      });
  
      // 🛰 Fly to geometry bounds
      const bounds = new mapboxgl.LngLatBounds();
      geojson.features.forEach((feature) => {
        const geom = feature.geometry;
  
        if (geom.type === 'Polygon') {
          geom.coordinates[0].forEach((coord) => bounds.extend(coord));
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach((polygon) => {
            polygon[0].forEach((coord) => bounds.extend(coord));
          });
        }
      });
  
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50, duration: 1000 });
        console.log("📍 Map zoomed to geometry bounds.");
      }
  
      // ✅ Show popup only when a geometry is clicked
      let activePopup = null;
      map.on('click', LAYER_ID, async (e) => {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;
        const coordinateString = `lat=${lat}&lon=${lng}`;
  
        try {
          const popupRes = await fetch(`http://127.0.0.1:8000/api/society-parcel/?${coordinateString}`);
          const popupData = await popupRes.json();
  
          if (popupRes.ok && popupData) {
            const popupHTML = AllSocietiesPopup(popupData, lat, lng);
  
            // Close any previous popup
            if (activePopup) activePopup.remove();
  
            activePopup = new mapboxgl.Popup({ offset: 15 })
              .setLngLat([lng, lat])
              .setHTML(popupHTML)
              .addTo(map);
          } else {
            console.warn("⚠ No popup data from land-parcel API for clicked location");
          }
        } catch (err) {
          console.error("❌ Error loading popup on click:", err);
        }
      });
  
    } catch (error) {
      console.error("❌ Error fetching filtered geometry:", error);
    }
  };
  
  
  
  
  // Clear Layer and Reset Dropdowns
  const handleClear = () => {
    if (map.getLayer(LAYER_ID)) {
      map.removeLayer(LAYER_ID);
      map.removeSource(LAYER_ID);
    }

    setSelectedDistrict('');
    setSelectedTehsil('');
    setSelectedTown('');
    setSelectedBlock('');
    setSelectedPlot('');

    setTehsils([]);
    setTowns([]);
    setBlocks([]);
    setPlots([]);
  };



  

  return (
    <div className="spatial-query-container">
      <h3>Spatial Query Filters</h3>

      <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
        <option value="">Select District</option>
        {districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
      </select>

      {tehsils.length > 0 && (
        <select value={selectedTehsil} onChange={e => setSelectedTehsil(e.target.value)}>
          <option value="">Select Tehsil</option>
          {tehsils.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>
      )}

      {towns.length > 0 && (
        <select value={selectedTown} onChange={e => setSelectedTown(e.target.value)}>
          <option value="">Select Town</option>
          {towns.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>
      )}

      {blocks.length > 0 && (
        <select value={selectedBlock} onChange={e => setSelectedBlock(e.target.value)}>
          <option value="">Select Block</option>
          {blocks.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>
      )}

      {plots.length > 0 && (
        <select value={selectedPlot} onChange={e => setSelectedPlot(e.target.value)}>
          <option value="">Select Plot</option>
          {plots.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>
      )}

      <div className="button-group">
        <button onClick={handleShow}>Show</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};

export default SpatialQuery;
