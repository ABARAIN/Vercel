import React, { useState, useEffect } from 'react';
import SidebarMenu from './SidebarMenu';
import BasemapSelector from './BasemapSelector';
import LayerItem from './LayerItem'; 
import LayerSwitcher from './LayerSwitcher';
// import '../styles/LayerSwitcher.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ layers, onBasemapChange, onFileUpload, uploadMessage, onReset, zoomToLayer, toggleLayerVisibility, measurements, toggleLayerVisible }) => {
  const [activeIcon, setActiveIcon] = useState(null);
  const [iconTitle, setIconTitle] = useState('');

  const [showLayers, setShowLayers] = useState(false);
  
  const handleIconClick = (icon, title) => {
    setActiveIcon(icon);
    setIconTitle(title);
    
    // setTimeout(() => {
    //   setIconTitle('');
    // }, 0); 
  };

  const handleFileUpload = (event) => {
    // Immediately reveal the submenu if a file is selected
    if (event.target.files.length > 0) {
        setShowLayers(true); 
    }
    // Parent upload function
    onFileUpload(event);
};

const [towns, setTowns] = useState([]);
const [activeTowns, setActiveTowns] = useState({}); // Tracks which towns are toggled on
// const [activeLayers, setActiveLayers] = useState({});


useEffect(() => {
  // Fetch town names from the backend
  const fetchTowns = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/all-soc/');
      const data = await response.json();
      const uniqueTowns = [...new Set(data.map(society => society.town_name))].sort(); // Sort alphabetically
      setTowns(uniqueTowns);
    } catch (error) {
      console.error('Error fetching town names:', error);
    }
  };

  fetchTowns();
}, []);

const handleToggleTown = (town) => {
  setActiveTowns(prevState => {
    const updatedState = { ...prevState, [town]: !prevState[town] };
    toggleLayerVisible(town, updatedState[town]); // Show/hide layer
    return updatedState;
  });
};
  return (
    <div className="sidebar">
      {iconTitle && <div className="icon-title">{iconTitle}</div>}
      <div className="sidebar-icons">
        <div 
          className={`icon-container ${activeIcon === 'marker' ? 'active' : ''}`} 
          onClick={() => handleIconClick('marker', 'Location Icon')}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} size="1x" />
        </div>
        <div 
          className={`icon-container ${activeIcon === 'layers' ? 'active' : ''}`} 
          onClick={() => handleIconClick('layers', 'Layers Icon')}
        >
          <FontAwesomeIcon icon={faLayerGroup} size="1x" />
        </div>
        <div 
          className={`icon-container ${activeIcon === 'building' ? 'active' : ''}`} 
          onClick={() => handleIconClick('building', 'Building Icon')}
        >
          <FontAwesomeIcon icon={faBuilding} size="1x" />
        </div>
        <div 
          className={`icon-container ${activeIcon === 'users' ? 'active' : ''}`} 
          onClick={() => handleIconClick('users', 'Users Icon')}
        >
          <FontAwesomeIcon icon={faUsers} size="1x" />
        </div>
      </div>
    <SidebarMenu title="Map Layers">
      <LayerItem title="Geodetic Network">
        <div>Layer details or controls for Geodetic Network</div>
      </LayerItem>
      <LayerItem title="Cooperative Society">
        <div>Layer details or controls for Cooperative Society</div>
      </LayerItem>
      <LayerItem title="Regular Approved Societies & Schemes">
        <div className="town-list">
          {towns.map((town, index) => (
            <div key={index} className="town-row">
              <span>{town}</span>
              <button onClick={() => handleToggleTown(town)}>
                {activeTowns[town] ? 'Hide' : 'Show'}
              </button>
              {activeTowns[town] && (
                <button onClick={() => zoomToLayer(town)}>Fly to</button>
              )}
            </div>
          ))}
        </div>
      </LayerItem>
      <LayerItem title="PHATA">
        <div>Layer details or controls for PHATA</div>
      </LayerItem>
      <LayerItem title="Development Authorities">
        <div>Layer details or controls for Development Authorities</div>
      </LayerItem>
      <LayerItem title="State Lands">
        <div>Layer details or controls for State Lands</div>
      </LayerItem>
      <LayerItem title="Cadastral Maps">
        <div>Layer details or controls for Cadastral Maps</div>
      </LayerItem>
      <LayerItem title="Settlement Operations">
        <div>Layer details or controls for Settlement Operations</div>
      </LayerItem>
      <LayerItem title="Upload File">
        <div className="file-upload">
          <input type="file" onChange={handleFileUpload} />
          {uploadMessage && <p>{uploadMessage}</p>}
          {showLayers && (
            <LayerSwitcher 
              layers={layers} 
              onToggleLayer={toggleLayerVisibility} 
            />
          )}
        </div>
      </LayerItem>
    </SidebarMenu>
    <SidebarMenu title="Basemap">
      <BasemapSelector onBasemapChange={onBasemapChange} />
    </SidebarMenu>
    <SidebarMenu title="Legend">
      {/* <div>Legend Item 1</div>
      <div>Legend Item 2</div> */}
    </SidebarMenu>
    
      <button className="reset-button" onClick={onReset}>Reset View</button>
      {/* Display measurements at the bottom */}
      <div style={{ marginTop: '20px' }}>
        <h4>Measurements</h4>
        <ul>
          {measurements.map((m, index) => (
            <li key={index}>{m}</li>
          ))}
        </ul>
      </div>
  </div>
  );
};

export default Sidebar;