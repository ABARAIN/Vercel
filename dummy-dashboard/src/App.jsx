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
import Header from './components/Header'; 
import Navbar from './components/Navbar';
import BasemapSelector from './components/BasemapSelector';
import SearchBar from './components/SearchBar'; 

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

  //const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [mauzas, setMauzas] = useState([]);
 // const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedSociety, setSelectedSociety] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
   const [selectedMauza, setSelectedMauza] = useState('');

  //const [newdivisions, setNewdivisions] = useState([]);
  const [newdistricts, setNewdistricts] = useState([]);
  const [newtehsils, setNewtehsils] = useState([]);
  const [newblocks, setNewblocks] = useState([]);

  //const [mauzas, setMauzas] = useState([]);
  const [selectedNewdivision, setSelectedNewdivision] = useState('');
  const [selectedNewdistrict, setSelectedNewdistrict] = useState('');
  const [selectedNewtehsil, setSelectedNewtehsil] = useState('');
  const [selectedNewblock, setSelectedNewblock] = useState('');

  //const [selectedMauza, setSelectedMauza] = useState('');

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
      // if (selectedDistrict || selectedTehsil || selectedMauza) {
      if ( selectedDistrict || selectedTehsil || selectedSociety || selectedBlock) {
        fetchFilteredData();
      }
      if ( selectedNewdistrict || selectedNewtehsil || selectedMauza || selectedNewblock) {
        fetchNewFilteredData();
      }

     // map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const controlWrapper = createControlWrapper();
      map.addControl(controlWrapper, 'top-right');

    });
       // Add click event listener
   map.on("click", async (e) => {
    const { lng, lat } = e.lngLat; // Get clicked coordinates
    console.log("Clicked coordinates:", lng, lat);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/land-parcel/?lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (response.ok) {
        console.log("Land Parcel Data:", data);

        // Display popup with information
        new mapboxgl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
          .setLngLat([lng, lat])
          .setHTML(`
            <div class="custom-popup">
              <h3>${data.society}</h3>
              <p><strong>Town Name:</strong> ${data.town_name}</p>
              <p><strong>Landuse:</strong> ${data.landuse}</p>
              <p><strong>Plot Number:</strong> ${data.plotno}</p>
              <p><strong>Society Type:</strong> ${data.societytyp}</p>
              <p><strong>District:</strong> ${data.district}</p>
              <p><strong>Tehsil:</strong> ${data.tehsil}</p>
              <p><strong>Source:</strong> ${data.source}</p>
              <p><strong>Coordinates:</strong> ${data.geom}</p>
              <p><stromg>Property Details: <a href="http://localhost:3000/login">View Property Details</a></strong></p>
            </div>
          `)
          .addTo(map);
      } else {
        console.warn("No data found:", data.error);
      }
    } catch (error) {
      console.error("Error fetching parcel data:", error);
    }
  });

    map.on('move', () => {
      const mapCenter = map.getCenter();
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(map.getZoom());
    });

    return () => map.remove();
  }, [basemap]);

  const createControlWrapper = () => {
    class ControlWrapper {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "control-wrapper";

        
        const navControl = new mapboxgl.NavigationControl();
        this._container.appendChild(navControl.onAdd(map));

        
        const customControl = createCustomControl();
        this._container.appendChild(customControl.onAdd(map));

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    return new ControlWrapper();
  };

  const createCustomControl = () => {
    class CustomControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "custom-control"; 
  
        const actions = [
          { icon: "fa-map-marker-alt", tooltip: "Draw Point (m)", onClick: () => alert("Draw Point") },
          { icon: "fa-grip-lines", tooltip: "Draw Line (l)", onClick: () => alert("Draw Line") },
          { icon: "fa-draw-polygon", tooltip: "Draw Polygon (p)", onClick: () => alert("Draw Polygon") },
          { icon: "fa-vector-square", tooltip: "Draw Rectangular (r)", onClick: () => alert("Draw Rectangle") },
          { icon: "fa-circle", tooltip: "Draw Circle (c)", onClick: () => alert("Draw Circle") },
          { icon: "fa-edit", tooltip: "Edit Geometries", onClick: () => alert("Edit Mode") },
        ];
  
        actions.forEach(action => {
          const button = document.createElement("button");
          button.className = "custom-control-button"; 
          button.onclick = action.onClick;
  
          const icon = document.createElement("i");
          icon.className = `fas ${action.icon}`;
  
          // Tooltip element
          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.innerText = action.tooltip;
          tooltip.style.display = "none"; 
  
          button.appendChild(icon);
          button.appendChild(tooltip);
          this._container.appendChild(button);
  
          // Show tooltip on mouse over
          button.addEventListener('mouseenter', () => {
            tooltip.style.display = "block";
            const rect = button.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
          });
  
          // Hide tooltip on mouse leave
          button.addEventListener('mouseleave', () => {
            tooltip.style.display = "none";
          });
        });
  
        return this._container;
      }
  
      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }
  
    return new CustomControl();
  };
  
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
    if (mapRef.current) {
      mapRef.current.setStyle(style); 
    }
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
        'fill-opacity': 0,
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
  
      new mapboxgl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
        .setLngLat(coordinates)
        .setHTML(`
          <div class="custom-popup">
            <h3>Landuse Details</h3>
            
              <p><strong>Landuse:</strong> ${properties.Landuse}</p>
              <p><strong>Plot Number:</strong> ${properties.NAME}</p>
              <p><strong>Block:</strong> ${properties.Block}</p>
              <p><strong>Owner:</strong> ${properties.Owner_Name}</p>
              <p><strong>Contact:</strong> ${properties.Cell_No}</p>
            
          </div>
        `)
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
    // axios.get('http://localhost:8000/api/joined-mauza-districts/')
    axios.get('http://localhost:8000/api/societies/')
      .then((response) => {
        const uniqueDistricts = [
          ...new Set(response.data.map((feature) => feature.district)),
        ];
        setDistricts(uniqueDistricts);
      })
      .catch((error) => console.error('Error fetching districts:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/api/joined-mauza-districts/')
    .then((response) => {
      const newUniqueDistricts = [
        ...new Set(response.data.map((feature) => feature.district)),
      ];
      setNewdistricts(newUniqueDistricts);
    })
    .catch((error) => console.error('Error fetching districts:', error));
  }, []);
  const fetchFilteredData = () => {
    const params = {};
    if (selectedDistrict) params.district = selectedDistrict;
    if (selectedTehsil) params.tehsil = selectedTehsil;
    // if (selectedMauza) params.mauza = selectedMauza;
    if (selectedSociety) params.society = selectedSociety;

    axios
      // .get('http://localhost:8000/api/joined-mauza-districts/', { params })
      .get('http://localhost:8000/api/societies/', { params })
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

  const fetchNewFilteredData = () => {
    const params = {};
    if (selectedNewdistrict) params.district = selectedNewdistrict;
    if (selectedNewtehsil) params.tehsil = selectedNewtehsil;
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
          'fill-color': '#007bff',
          'fill-opacity': 0.3,
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
    // setSelectedMauza('');
    setSelectedSociety('');

    axios
      // .get('http://localhost:8000/api/joined-mauza-districts/', {
      .get('http://localhost:8000/api/societies/',{
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

  const handleNewDistrictChange = (district) => {
    setSelectedNewdistrict(district);
    setSelectedNewtehsil('');
    setSelectedMauza('');

    axios
    .get('http://localhost:8000/api/joined-mauza-districts/', {
      params: {district},
    })
    .then((response) => {
      const newUniqueTehsils = [
        ...new Set(response.data.map((feature) => feature.tehsil)),
      ];
      setNewtehsils(newUniqueTehsils);
    })
    .catch((error) => console.error('Error fetching tehsils:', error));
  };

  const handleTehsilChange = (tehsil) => {
    setSelectedTehsil(tehsil);
    // setSelectedMauza('');
    setSelectedSociety('');

    axios
      // .get('http://localhost:8000/api/joined-mauza-districts/', {
      .get('http://localhost:8000/api/societies/', {
        params: { district: selectedDistrict, tehsil },
      })
      .then((response) => {
        // const uniqueMauzas = [
        //   ...new Set(response.data.map((feature) => feature.mauza)),
        // ];
        // setMauzas(uniqueMauzas);
        const uniqueSocieties = [
          ...new Set(response.data.map((feature) => feature.society)),
        ];
        setSocieties(uniqueSocieties);
      })
      .catch((error) => console.error('Error fetching soc:', error));
  };

  const handleNewTehsilChange = (tehsil) => {
    setSelectedNewtehsil(tehsil);
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
  const handleSearch = (query) => {
    
    console.log('Searching for:', query);
    
  };

  const handleMauzaChange = (mauza) => {
    setSelectedMauza(mauza);
  };

  // const handleApplyFilters = () => {
    
  //   fetchFilteredData();
  // };

  const handleApplyFilters = () => {
    if (selectedNewdistrict || selectedNewtehsil || selectedMauza) {
      fetchNewFilteredData(); 
    } else {
      fetchFilteredData(); 
    }
  };
  return (
    <>
      {/* <div className="map-title">Central Monitoring Dashboard Map</div> */}
      <Header />
      <Navbar 
       // divisions={divisions}
       districts={districts}
       tehsils={tehsils}
       mauzas={mauzas} 
       societies={societies}
      // blocks={blocks}
       selectedDistrict={selectedDistrict}
       selectedTehsil={selectedTehsil}
       selectedMauza={selectedMauza}
       selectedSociety={selectedSociety} 
       onDistrictChange={handleDistrictChange}
       onTehsilChange={handleTehsilChange}
       onMauzaChange={handleMauzaChange}
       onSocietyChange={setSelectedSociety}
       onApplyFilters={handleApplyFilters}
       
     />
       <SearchBar onSearch={handleSearch} />
      <div id="map-container" ref={mapContainerRef}></div>
      <Sidebar
       onBasemapChange={handleBasemapChange} />


     {/*   center={center}
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
            Society:
            <select onChange={(e) => setSelectedSociety(e.target.value)} value={selectedSociety}>
              <option value="">Select Society</option>
              {societies.map((society) => (
                <option key={society} value={society}>
                  {society}
                </option>
              ))}
            </select>
          </label>
        )}
        <button onClick={fetchFilteredData}>Apply Society Filters</button>
      </div>
      <div className="filters2">
      <label>
          District:
          <select onChange={(e) => handleNewDistrictChange(e.target.value)} value={selectedNewdistrict}>
            <option value="">Select District</option>
            {newdistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
        {selectedNewdistrict && (
          <label>
            Tehsil:
            <select onChange={(e) => handleNewTehsilChange(e.target.value)} value={selectedNewtehsil}>
              <option value="">Select Tehsil</option>
              {newtehsils.map((tehsil) => (
                <option key={tehsil} value={tehsil}>
                  {tehsil}
                </option>
              ))}
            </select>
          </label>
        )}
        {selectedNewtehsil && (
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
        <button onClick={fetchNewFilteredData}>Apply Mauza Filters</button>
      </div>*/}
      
    </>
  );
}

export default App;
