import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import shp from 'shpjs';
import * as d3 from 'd3';
import * as wkt from 'wkt';
import Sidebar from './components/Sidebar';
import LayerSwitcher from './components/LayerSwitcher';
import './styles/App.css';
import Header from './components/Header';
// import Navbar from './components/Navbar';
import BasemapSelector from './components/BasemapSelector';
import SearchBar from './components/SearchBar';
import MapWithDraw from './components/MapWithDraw';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MergedSocietyPopup from './components/popups/MergedSocietyPopup';
import DigitizedAreasPopup from './components/popups/DigitizedAreasPopup';
import AllSocietiesPopup from './components/popups/AllSocietiesPopup';
import { useNavigate } from 'react-router-dom';



const INITIAL_CENTER = [74.1984366152605, 31.406322333747173];
const INITIAL_ZOOM = 14;

function App() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const drawRef = useRef(null); // Ref for MapboxDraw instance


  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [basemap, setBasemap] = useState('mapbox://styles/mapbox/streets-v11');
  const [layers, setLayers] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [mBlockData, setMBlockData] = useState(null);
  const [mBlockVisible, setMBlockVisible] = useState(false);
  //const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [plot_no, setPlots] = useState([]);
  const [mauzas, setMauzas] = useState([]);
  // const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedSociety, setSelectedSociety] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedPlot, setSelectedPlot] = useState('');
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
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [mapInstance, setMapInstance] = useState(null); // State to hold the map instance


  const [showTehsil, setShowTehsil] = useState(false);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [showMauzaDropdown, setShowMauzaDropdown] = useState(false);

  const [measurements, setMeasurements] = useState([]);
  const metersToFeet = (meters) => meters * 3.28084;

  const selectedDistrictRef = useRef('');
  const selectedTehsilRef = useRef('');
  const selectedSocietyRef = useRef('');
  const [activeTowns, setActiveTowns] = useState({});
  const isVisibleGlobalRef = useRef({});
  const globalVisibilityRef = useRef(false); // default value
  const mBlockVisibleRef = useRef(false); // Initial state
  const mergedSocietyVisibleRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    selectedDistrictRef.current = selectedDistrict;
    selectedTehsilRef.current = selectedTehsil;
    selectedSocietyRef.current = selectedSociety;
  }, [selectedDistrict, selectedTehsil, selectedSociety]);


  const handleBasemapChange = useCallback((style) => {
    setBasemap(style);
  }, []); // useCallback, no dependencies

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';
    let map = null; // Initialize map variable outside
    let draw = null; // Important: Keep a separate draw variable

    const initializeMap = () => {  // Separate function for map initialization
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: basemap,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: false,
        
      });

      mapRef.current = map;
      setMapInstance(map); // Set the map instance in state
      fetchMBlockData(); // Fetch data on mount

      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          line_string: true,
          polygon: true,
          trash: true,
        },
      });
      drawRef.current = draw; // Assign draw instance to the ref
      map.addControl(draw); // Add it to the map

      map.on("draw.create", updateMeasurements);
      map.on("draw.update", updateMeasurements);
      map.on("draw.delete", () => setMeasurements([]));

      map.on('load', () => {
        restoreLayersAndInteractions();
        // if (selectedDistrict || selectedTehsil || selectedMauza) {
        if (selectedDistrict || selectedTehsil || selectedSociety || selectedBlock) {
          fetchFilteredData();
        }
        if (selectedNewdistrict || selectedNewtehsil || selectedMauza || selectedNewblock) {
          fetchNewFilteredData();
        }

      });



      ///////////////////////////////////////////////////////POPUP////////////////////////////////////////////////////////////

      console.log("🔔 Global isVisible state:", globalVisibilityRef.current);

      map.on("click", async (e) => {
        const { lng, lat } = e.lngLat;
        const coordinateString = `lat=${lat}&lon=${lng}`;

        try {
          // Try DigitizedAreas first
          const digitizedRes = await fetch(`https://api.nespaklrms.com/api/digitized-parcel/?${coordinateString}`);
          const digitizedData = await digitizedRes.json();

          if (digitizedRes.ok && mBlockVisibleRef.current === true) {
            const popupContent = DigitizedAreasPopup(digitizedData, lat, lng);
            new mapboxgl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
              .setLngLat([lng, lat])
              .setHTML(popupContent)
              .addTo(map);
            return; // Stop if found
          } else if (!mBlockVisibleRef.current) {
            console.log("🚫 Skipped DigitizedAreas popup because mBlockVisible is FALSE");
          }



          // Try MergedSociety
          const mergedRes = await fetch(`https://api.nespaklrms.com/api/land-parcel/?${coordinateString}`);
          const mergedData = await mergedRes.json();

          if (mergedRes.ok && mergedSocietyVisibleRef.current === true) {
            const popupContent = MergedSocietyPopup(mergedData, lat, lng);
            new mapboxgl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
              .setLngLat([lng, lat])
              .setHTML(popupContent)
              .addTo(map);
            return;
          } else if (!mergedSocietyVisibleRef.current) {
            console.log("🚫 Skipped MergedSociety popup because filters are not applied.");
          }




          // ✅ Fetch Society Parcel API first
          const societyRes = await fetch(`https://api.nespaklrms.com/api/society-parcel/?${coordinateString}`);
          const societyData = await societyRes.json();

          // ✅ Check global visibility before showing popup m
          if (societyRes.ok && globalVisibilityRef.current === true) {
            const popupContent = AllSocietiesPopup(societyData, lat, lng);
            new mapboxgl.Popup({ offset: 15, closeButton: true, closeOnClick: true })
              .setLngLat([lng, lat])
              .setHTML(popupContent)
              .addTo(map);
            return;
          } else {
            console.log("🚫 Skipped AllSocieties popup because global isVisible is FALSE");
          }




          // Nothing found
          console.warn("No parcel found at this location.");
        } catch (err) {
          console.error("Error fetching parcel information:", err);
        }
      });




      ///////////////////////////////////////////////////////POPUP////////////////////////////////////////////////////////////




      map.on('move', () => {
        if (mapRef.current) {
          const mapCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();
          setCenter([mapCenter.lng, mapCenter.lat]);
          setZoom(currentZoom);
        }
      });
    };

    initializeMap(); // Initialize map on the first render


    return () => {
      if (mapRef.current) {
        if (drawRef.current) {
          mapRef.current.removeControl(drawRef.current); // Remove draw control if it exists
        }
        mapRef.current.remove(); // Remove the map
      }
      map = null;
      draw = null;
    };
  }, [basemap]);

  useEffect(() => {
    if (mapRef.current && drawRef.current) {
      mapRef.current.removeControl(drawRef.current);
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          line_string: true,
          polygon: true,
          trash: true,
        },
      });
      mapRef.current.addControl(drawRef.current);
    }
  }, [basemap])

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
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 6,  // At zoom level 10, radius = 6
          15, 12  // At zoom level 15, radius = 12
        ],
        'circle-color': '#FF0000', // Bright red
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ff0000',
        'circle-blur': 0.5,  // Gives a glowing effect
      },
    };

    // Function to animate the pulsating effect
    const animatePulsatingPoints = () => {
      let growing = true;
      let radius = 3;

      setInterval(() => {
        radius = growing ? 12 : 6; // Toggle between 6 and 12

        map.setPaintProperty(id, 'circle-radius', radius);
        map.setPaintProperty(id, 'circle-opacity', growing ? 1 : 0.6);

        growing = !growing;
      }, 700); // Animation speed (700ms)
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
      animatePulsatingPoints();
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
          <div class="custom-popup" style="max-height: 400px; overflow-y: auto; padding: 10px; width: 550px;">
                    <h3 style="text-align: center; margin-bottom: 10px;">Plot Details</h3>

                    <table border="1" style="border-collapse: collapse; width: 110%; text-align: left;">
                        <!-- Basic Information -->
                        <tr>
                            <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Basic Information</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Plot Number</strong></td>
                            <td style="padding: 8px;">${properties.NAME}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Block</strong></td>
                            <td style="padding: 8px;">${properties.Block}</td>
                        </tr>

                        <!-- Ownership Record -->
                        <tr>
                            <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Ownership Record</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Owner</strong></td>
                            <td style="padding: 8px;">${properties.owner_na_1}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Father/Husband Name</strong></td>
                            <td style="padding: 8px;">${properties.fath_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>CNIC</strong></td>
                            <td style="padding: 8px;">${properties.new_CNIC}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Contact</strong></td>
                            <td style="padding: 8px;">${properties.Cell_No}</td>
                        </tr>

                        <!-- File Details -->
                        <tr>
                            <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">File Details</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>File Number</strong></td>
                            <td style="padding: 8px;">${properties.file_no}</td>
                        </tr>

                        <!-- Land-use Details -->
                        <tr>
                            <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Land-use Details</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Landuse</strong></td>
                            <td style="padding: 8px;">${properties.Landuse}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Commercial Entity</strong></td>
                            <td style="padding: 8px;">${properties.Commercial}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Owner (if commercial)</strong></td>
                            <td style="padding: 8px;">${properties.Owner_Name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Contact No (Commercial)</strong></td>
                            <td style="padding: 8px;">${properties.Contact_Nu}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>View Image (if commercial)</strong></td>
                            <td style="padding: 8px;"><a href="${properties.img}" target="_blank">Image</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Property Remarks</strong></td>
                            <td style="padding: 8px;">${properties.remarks}</td>
                        </tr>

                        <!-- Area Details -->
                        <tr>
                            <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Area Details</th>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <table border="1" style="border-collapse: collapse; width: 100%;">
                                    <tr>
                                        <th style="background-color: lightgray; padding: 5px;">Area Units</th>
                                        <td style="padding: 5px;">K-M-Sqft</td>
                                    </tr>
                                    <tr>
                                        <th style="background-color: lightgreen; padding: 5px;">As per Master Plan</th>
                                        <td style="padding: 5px;">${properties.mp_area}</td>
                                    </tr>
                                    <tr>
                                        <th style="background-color: lightblue; padding: 5px;">As per Property File</th>
                                        <td style="padding: 5px;">${properties.plot_area}</td>
                                    </tr>
                                    <tr>
                                        <th style="background-color: yellow; padding: 5px;">As per Demarcation/Part Plan</th>
                                        <td style="padding: 5px;">${properties.plot_area_}</td>
                                    </tr>
                                    <tr>
                                        <th style="background-color: red; padding: 5px;">Property Footprint</th>
                                        <td style="padding: 5px;">${properties.Area_Digit}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Demarcation Plan -->
                        <tr>
                            <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Demarcation Plan</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Coordinates</strong></td>
                            <td style="padding: 8px;">(${coordinates.lng.toFixed(6)}, ${coordinates.lat.toFixed(6)})</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Print Demarcation Plan</strong></td>
                            <td style="padding: 8px;"><a href="demarcation_plan_link" target="_blank">Click Here</a></td>
                        </tr>
                    </table>
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
    // axios.get('https://api.nespaklrms.com/api/joined-mauza-districts/')
    axios.get('https://api.nespaklrms.com/api/societies/')
      .then((response) => {
        const uniqueDistricts = [
          ...new Set(response.data.map((feature) => feature.district)),
        ];
        setDistricts(uniqueDistricts);
      })
      .catch((error) => console.error('Error fetching districts:', error));
  }, []);

  useEffect(() => {
    axios.get('https://api.nespaklrms.com/api/joined-mauza-districts/')
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
    if (selectedSociety) params.society = selectedSociety;
    if (selectedBlock) params.block = selectedBlock;
    if (selectedPlot) params.plot_no = selectedPlot; // Ensure this matches the backend field

    axios
      .get('https://api.nespaklrms.com/api/societies/', { params })
      .then((response) => {
        if (!response.data.length) {
          console.warn('No data returned from the API');
          return;
        }

        const geojson = {
          type: 'FeatureCollection',
          features: response.data.map((feature) => {
            if (!feature.geom) {
              console.warn('Feature missing geometry:', feature);
              return null;
            }

            try {
              const geom = feature.geom.replace('SRID=4326;', ''); // Strip SRID
              return {
                type: 'Feature',
                geometry: wkt.parse(geom),
                properties: feature,
              };
            } catch (error) {
              console.error('Error parsing geometry:', error, feature.geom);
              return null;
            }
          }).filter(Boolean), // Remove any null values
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
      .get('https://api.nespaklrms.com/api/joined-mauza-districts/', { params })
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
          'fill-color': '#FFFF00',
          'fill-opacity': 0,
        },
      });
      map.addLayer({
        id: `${layerId}-line`,
        type: 'line',
        source: layerId,
        paint: {
          'line-color': '#FFFF00', // Black color for the boundaries
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
      // .get('https://api.nespaklrms.com/api/joined-mauza-districts/', {
      .get('https://api.nespaklrms.com/api/societies/', {
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
      .get('https://api.nespaklrms.com/api/joined-mauza-districts/', {
        params: { district },
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
      // .get('https://api.nespaklrms.com/api/joined-mauza-districts/', {
      .get('https://api.nespaklrms.com/api/societies/', {
        params: { district: selectedDistrict, tehsil },
      })
      .then((response) => {
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
      .get('https://api.nespaklrms.com/api/joined-mauza-districts/', {
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

  const handleApplyFilters = () => {
    if (selectedNewdistrict || selectedNewtehsil || selectedMauza) {
      fetchNewFilteredData();
    } else {
      fetchFilteredData();
    }
    setFiltersApplied(true);
    mergedSocietyVisibleRef.current = true; // ✅ Allow popup after filter is applied
    console.log("🔔 mergedSocietyVisibleRef (Apply):", mergedSocietyVisibleRef.current);
  };

  const handleRemoveFilters = () => {
    setSelectedDistrict('');
    setSelectedTehsil('');
    setSelectedSociety('');
    setSelectedBlock('');
    setSelectedPlot('');
    setSelectedMauza('');

    setTehsils([]);
    setSocieties([]);
    setBlocks([]);
    setPlots([]);
    setMauzas([]);

    setFiltersApplied(false);
    setShowTehsil(false);
    setShowSocietyDropdown(false);
    setShowMauzaDropdown(false);

    mergedSocietyVisibleRef.current = false; // ❌ Don't show popup
    console.log("🔕 mergedSocietyVisibleRef (Remove):", mergedSocietyVisibleRef.current);
  };

  const fetchMauzas = (district, tehsil) => {
    axios
      .get('https://api.nespaklrms.com/api/joined-mauza-districts/', {
        params: { district, tehsil },
      })
      .then((response) => {
        const uniqueMauzas = [
          ...new Set(response.data.map((feature) => feature.mauza)),
        ];
        setMauzas(uniqueMauzas);
      })
      .catch((error) => console.error('Error fetching mauzas:', error));
  };

  /*
  const updateMeasurements = () => {
    if (drawRef.current) {
      const data = drawRef.current.getAll();
      const newMeasurements = [];

      data.features.forEach((feature) => {
        const coords = feature.geometry.coordinates;
        let measurementText = '';

        if (feature.geometry.type === 'Point') {
          measurementText = `Point: [${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`;
        } else if (feature.geometry.type === 'LineString') {
          let lengthMeters = 0;
          for (let i = 0; i < coords.length - 1; i++) {
            const from = coords[i];
            const to = coords[i + 1];
            lengthMeters += turf.distance(turf.point(from), turf.point(to), { units: 'meters' });
          }
          measurementText = `Line Length: ${metersToFeet(lengthMeters).toFixed(2)} ft`;
        } else if (feature.geometry.type === 'Polygon') {
          let areaMeters = turf.area(feature); // Get area in square meters
          let areaFeet = areaMeters * 10.7639; // Convert square meters to square feet
          measurementText = `Polygon Area: ${areaFeet.toFixed(2)} sq ft`;
        }

        newMeasurements.push(measurementText);
      });

      setMeasurements(newMeasurements);
    }
  }; 
  */

  const updateMeasurements = () => {
    if (drawRef.current) {
      const data = drawRef.current.getAll();
      const newMeasurements = [];
  
      // Remove previous popups if needed
      document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());
  
      data.features.forEach((feature) => {
        const coords = feature.geometry.coordinates;
        let measurementText = '';
        let popupCoords;
  
        if (feature.geometry.type === 'Point') {
          const [lng, lat] = coords;
          measurementText = `Point: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`;
          popupCoords = [lng, lat];
        } else if (feature.geometry.type === 'LineString') {
          let lengthMeters = 0;
          for (let i = 0; i < coords.length - 1; i++) {
            const from = coords[i];
            const to = coords[i + 1];
            lengthMeters += turf.distance(turf.point(from), turf.point(to), { units: 'meters' });
          }
          measurementText = `Line Length: ${metersToFeet(lengthMeters).toFixed(2)} ft`;
  
          const midIndex = Math.floor(coords.length / 2);
          popupCoords = coords[midIndex];
        } else if (feature.geometry.type === 'Polygon') {
          const areaMeters = turf.area(feature);
          const areaFeet = areaMeters * 10.7639;
          measurementText = `Polygon Area: ${areaFeet.toFixed(2)} sq ft`;
  
          // Calculate centroid for popup
          const centroid = turf.centroid(feature).geometry.coordinates;
          popupCoords = centroid;
        }
  
        newMeasurements.push(measurementText);
  
        // Show popup on the map
        if (popupCoords) {
          new mapboxgl.Popup({ offset: 10, closeButton: true, closeOnClick: false })
            .setLngLat(popupCoords)
            .setHTML(`<div style="font-size: 14px; font-weight: bold;">${measurementText}</div>`)
            .addTo(mapRef.current); // Assuming you have a mapRef pointing to your map
        }
      });
  
      setMeasurements(newMeasurements);
    }
  };
  


  const handleSocietyChange = (society) => {
    setSelectedSociety(society);
    setSelectedBlock('');  // Reset block when society changes

    axios
      .get('https://api.nespaklrms.com/api/societies/', {
        params: { society },  // Use correct parameter name
      })
      .then((response) => {
        const uniqueBlocks = [
          ...new Set(response.data.map((feature) => feature.block)),
        ];
        setBlocks(uniqueBlocks);
      })
      .catch((error) => console.error('Error fetching blocks:', error));
  };

  const handleBlockChange = (block) => {
    setSelectedBlock(block);
    setSelectedPlot('');  // Reset plot when block changes

    axios
      .get('https://api.nespaklrms.com/api/societies/', {
        params: { block },  // Use correct parameter name
      })
      .then((response) => {
        const uniquePlots = [
          ...new Set(response.data.map((feature) => feature.plot_no)),
        ];
        setPlots(uniquePlots);
      })
      .catch((error) => console.error('Error fetching plots:', error));
  };
  const [activeLayers, setActiveLayers] = useState({});
  const activeLayersRef = useRef({});

  const toggleLayerVisible = async (town, isVisible) => {
    const map = mapRef.current;
    const layerId = `town-layer-${town}`;
    const lineLayerId = `town-boundary-${town}`;

    globalVisibilityRef.current = isVisible; // ✅ store current isVisible

    console.log("📍 toggleLayerVisible - Town:", town, "| isVisible:", isVisible);

    if (isVisible) {
      const response = await fetch(`https://api.nespaklrms.com/api/geojson/?town_name=${encodeURIComponent(town)}`);
      const geojson = await response.json();

      if (!map.getSource(layerId)) {
        map.addSource(layerId, { type: 'geojson', data: geojson });

        map.addLayer({
          id: layerId,
          type: 'fill',
          source: layerId,
          paint: { 'fill-color': '#088', 'fill-opacity': 0 }
        });

        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: layerId,
          paint: { 'line-color': '#000000', 'line-width': 2 }
        });
      }
    } else {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getSource(layerId)) map.removeSource(layerId);
    }

    // ✅ Update state and ref simultaneously
    setActiveLayers(prev => {
      const updated = { ...prev, [town]: isVisible };
      activeLayersRef.current = updated;
      return updated;
    });
  };


  window.toggleAccordion = function (uid, sectionId) {
    const allSections = ['plotinfo', 'admininfo', 'coordinates', 'basic', 'location', 'info', 'ownership', 'file', 'landuse', 'area', 'demarcation'];
    allSections.forEach(id => {
      const el = document.getElementById(`${uid}-${id}`);
      if (el) {
        if (id === sectionId) {
          const isActive = el.classList.contains('active');
          el.classList.toggle('active', !isActive);
        } else {
          el.classList.remove('active');
        }
      }
    });
  };


  // Function to zoom to the selected town
  const zoomToLayer = async (town) => {
    const map = mapRef.current;
    const response = await fetch(`https://api.nespaklrms.com/api/bbox/?town_name=${encodeURIComponent(town)}`);
    const { bbox } = await response.json(); // Expecting { bbox: [minLng, minLat, maxLng, maxLat] }

    if (bbox) {
      map.fitBounds(bbox, { padding: 50, duration: 1000 });
    }
  };
  // Fetch all M-Block data once
  const fetchMBlockData = async () => {
    try {
      const response = await fetch('https://api.nespaklrms.com/api/m-block/');
      const geojson = await response.json();
      setMBlockData(geojson);
    } catch (error) {
      console.error('Error fetching M-Block data:', error);
    }
  };
  // Toggle visibility of M-Block layer
  const toggleMBlockVisibility = () => {
    const map = mapRef.current;
    const layerId = 'mblock-layer';
    const lineLayerId = 'mblock-boundary';

    if (!mBlockData) {
      console.warn('M-Block data not loaded yet');
      return;
    }

    if (!mBlockVisible) {
      if (!map.getSource(layerId)) {
        map.addSource(layerId, {
          type: 'geojson',
          data: mBlockData
        });

        // Transparent fill layer
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: layerId,
          paint: {
            'fill-color': '#088',
            'fill-opacity': 0
          }
        });

        // Line layer for boundary
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: layerId,
          paint: {
            'line-color': '#000000',
            'line-width': 2
          }
        });
      }


      setMBlockVisible(true);
      mBlockVisibleRef.current = true;

    } else {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getSource(layerId)) map.removeSource(layerId);

      setMBlockVisible(false);
      mBlockVisibleRef.current = false;
    }
    console.log(mBlockVisible)
  };

  // Zoom to M-Block extent
  const zoomToMBlock = async () => {
    const map = mapRef.current;
    const response = await fetch('https://api.nespaklrms.com/api/m-block-bbox/');
    const { bbox } = await response.json(); // Expecting { bbox: [minLng, minLat, maxLng, maxLat] }

    if (bbox) {
      map.fitBounds(bbox, { padding: 50, duration: 1000 });
    }
  };

  return (
    <div style={{ transform: 'scale(0.735)', transformOrigin: 'top left', width: '135.6vw', height: '135.33vh',overflow: "hidden", }}>

      <button
        onClick={() => navigate('/dashboard')}
        onMouseEnter={() => setIsHovered(true)} // Set hover state to true
        onMouseLeave={() => setIsHovered(false)} // Set hover state to false
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          padding: '11px 10px',
          backgroundColor: '#ffffff',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '20px', // Increase font size for better visibility
          fontFamily: 'Open Sans, sans-serif', // Set font family to Open Sans
          width: '150px', // Optional: set a specific width
          height: '50px', // Optional: set a specific height
          
          
        }}
      >
        Dashboard
      </button>
      {/* <div className="map-title">Central Monitoring Dashboard Map</div> */}
      <Header />




      
      {/* <SearchBar onSearch={handleSearch} /> */}

      <div id="map-container" ref={mapContainerRef} ></div>
      <div>
      
      <Sidebar
        layers={layers}
        onBasemapChange={handleBasemapChange}
        onFileUpload={handleFileUpload}
        onReset={handleReset}
        toggleLayerVisibility={toggleLayerVisibility}
        measurements={measurements}
        toggleLayerVisible={toggleLayerVisible}
        zoomToLayer={zoomToLayer}
        toggleMBlockVisibility={toggleMBlockVisibility}
        zoomToMBlock={zoomToMBlock}
        activeTowns={activeTowns}
        setActiveTowns={setActiveTowns}
        map={mapRef.current}
      />
      </div>
    </div>
  );
}

export default App;





/*

---------------------CODE FOR SELECT DISTRICT (NAVBAR)-----------------------------

      <Navbar
        // divisions={divisions}
        districts={districts}
        tehsils={tehsils}
        mauzas={mauzas}
        societies={societies}
        blocks={blocks}
        plot_no={plot_no}
        newdistricts={newdistricts}
        selectedDistrict={selectedDistrict}
        selectedTehsil={selectedTehsil}
        selectedSociety={selectedSociety}
        selectedBlock={selectedBlock}
        selectedPlot={selectedPlot}
        selectedMauza={selectedMauza}
        selectedNewdistrict={selectedNewdistrict}
        selectedNewtehsil={selectedNewtehsil}
        onDistrictChange={handleDistrictChange}
        onTehsilChange={handleTehsilChange}
        onMauzaChange={handleMauzaChange}
        //onSocietyChange={setSelectedSociety}
        onSocietyChange={handleSocietyChange}
        onBlockChange={handleBlockChange}
        onPlotChange={setSelectedPlot}

        onApplyFilters={handleApplyFilters}
        onNewDistrictChange={handleNewDistrictChange}
        onNewTehsilChange={handleNewTehsilChange}
        fetchNewFilteredData={fetchNewFilteredData}
        fetchMauzas={fetchMauzas}
        onRemoveFilters={handleRemoveFilters}
        showTehsil={showTehsil}
        showSocietyDropdown={showSocietyDropdown}
        showMauzaDropdown={showMauzaDropdown}

      />
*/