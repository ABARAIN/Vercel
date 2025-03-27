import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import './SpatialQuery.css';
import AllSocietiesPopup from './popups/AllSocietiesPopup';

const SpatialQuery = ({ map, geojsonData, setGeojsonData, landuseFilter, setFullGeojsonBackup }) => {
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

  const landuseColorMap = {
    "Commercial": "#f44336", "Educational": "#2196f3", "Encroachment": "#795548",
    "Graveyard": "#9c27b0", "Health Facility": "#4caf50", "Nullah": "#00bcd4",
    "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
    "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
    "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
    "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd"
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/all-soc-dropdowns/?level=district')
      .then(res => setDistricts(res.data));
  }, []);

  useEffect(() => {
    setTehsils([]); setSelectedTehsil('');
    setTowns([]); setSelectedTown('');
    if (selectedDistrict) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=tehsil&district=${selectedDistrict}`)
        .then(res => setTehsils(res.data));
    }
  }, [selectedDistrict]);

  useEffect(() => {
    setTowns([]); setSelectedTown('');
    setBlocks([]); setSelectedBlock('');
    if (selectedDistrict && selectedTehsil) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=town_name&district=${selectedDistrict}&tehsil=${selectedTehsil}`)
        .then(res => setTowns(res.data));
    }
  }, [selectedTehsil]);

  useEffect(() => {
    setBlocks([]); setSelectedBlock('');
    setPlots([]); setSelectedPlot('');
    if (selectedDistrict && selectedTehsil && selectedTown) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=block&district=${selectedDistrict}&tehsil=${selectedTehsil}&town_name=${selectedTown}`)
        .then(res => setBlocks(res.data));
    }
  }, [selectedTown]);

  useEffect(() => {
    setPlots([]);
    setSelectedPlot('');
    if (selectedDistrict && selectedTehsil && selectedTown && selectedBlock) {
      axios.get(`http://127.0.0.1:8000/api/all-soc-dropdowns/?level=plot_no&district=${selectedDistrict}&tehsil=${selectedTehsil}&town_name=${selectedTown}&block=${selectedBlock}`)
        .then(res => {
          const sortedPlots = res.data.sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b); // fallback for non-numeric
          });
          setPlots(sortedPlots);
        });
    }
  }, [selectedBlock]);
  

  const handleShow = async () => {
    if (!map) return;

    const params = {};
    if (selectedDistrict) params.district = selectedDistrict;
    if (selectedTehsil) params.tehsil = selectedTehsil;
    if (selectedTown) params.town_name = selectedTown;
    if (selectedBlock) params.block = selectedBlock;
    if (selectedPlot) params.plot_no = selectedPlot;

    try {
      const res = await axios.get('http://127.0.0.1:8000/api/all-soc-geojson/', { params });
      let geojson = res.data;

      // Backup full geojson for reset
      if (setFullGeojsonBackup) {
        setFullGeojsonBackup(geojson);
      }

      // Apply filter from chart click
      if (landuseFilter) {
        geojson = {
          ...geojson,
          features: geojson.features.filter(
            (f) => f.properties?.landuse === landuseFilter
          )
        };
        console.log("🎯 Filter applied from chart:", landuseFilter, "Features:", geojson.features.length);
      }

      if (setGeojsonData) {
        setGeojsonData(geojson);
      }

      // Render on map
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
        map.removeSource(LAYER_ID);
      }

      map.addSource(LAYER_ID, {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: LAYER_ID,
        type: 'fill',
        source: LAYER_ID,
        paint: {
          'fill-color': [
            'match',
            ['get', 'landuse'],
            ...Object.entries(landuseColorMap).flat(),
            '#bdbdbd'
          ],
          'fill-opacity': 0.6,
          'fill-outline-color': '#333'
        }
      });

      const bounds = new mapboxgl.LngLatBounds();
      geojson.features.forEach((f) => {
        const geom = f.geometry;
        if (geom.type === 'Polygon') {
          geom.coordinates[0].forEach(c => bounds.extend(c));
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach(p => p[0].forEach(c => bounds.extend(c)));
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50, duration: 1000 });
      }

      // Popup handler
      // let activePopup = null;
      // map.on('click', LAYER_ID, async (e) => {
      //   const lng = e.lngLat.lng;
      //   const lat = e.lngLat.lat;
      //   const coordinateString = `lat=${lat}&lon=${lng}`;

      //   try {
      //     const popupRes = await fetch(`http://127.0.0.1:8000/api/society-parcel/?${coordinateString}`);
      //     const popupData = await popupRes.json();

      //     if (popupRes.ok && popupData) {
      //       const popupHTML = AllSocietiesPopup(popupData, lat, lng);
      //       if (activePopup) activePopup.remove();

      //       activePopup = new mapboxgl.Popup({ offset: 15 })
      //         .setLngLat([lng, lat])
      //         .setHTML(popupHTML)
      //         .addTo(map);
      //     }
        } catch (err) {
          console.error("❌ Popup error:", err);
        }
      // });
  //   } catch (err) {
  //     console.error("❌ Fetch error:", err);
  //   }
  };

  const handleClear = () => {
    if (map.getLayer(LAYER_ID)) {
      map.removeLayer(LAYER_ID);
      map.removeSource(LAYER_ID);
    }

    if (setGeojsonData) {
      setGeojsonData(null);
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
