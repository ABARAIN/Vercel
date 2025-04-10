import React, { useState, useEffect } from 'react';
import SidebarMenu from './SidebarMenu';
import BasemapSelector from './BasemapSelector';
import LayerItem from './LayerItem'; 
import LayerSwitcher from './LayerSwitcher';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';
import SpatialQuery from './SpatialQuery';
import "./Sidebar.css"

const Sidebar = ({ layers, onBasemapChange, toggleMBlockVisibility, zoomToMBlock, onFileUpload, uploadMessage, onReset, zoomToLayer, toggleLayerVisibility, measurements, toggleLayerVisible, activeTowns, map,
  setActiveTowns }) => {

  const [activeIcon, setActiveIcon] = useState('layers'); // Default selected icon
  const [iconTitle, setIconTitle] = useState('Layers Icon'); // Default title
  const [mBlockVisible, setMBlockVisible] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [towns, setTowns] = useState([]);

  const handleIconClick = (icon, title) => {
    setActiveIcon(icon);
    setIconTitle(title);
  };

  const handleFileUpload = (event) => {
    if (event.target.files.length > 0) {
        setShowLayers(true); 
    }
    onFileUpload(event);
  };

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/all-soc/');
        const data = await response.json();
        const uniqueTowns = [...new Set(data.map(society => society.town_name))].sort();
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
      toggleLayerVisible(town, updatedState[town]);
      return updatedState;
    });
  };

  const handleToggleMBlock = () => {
    setMBlockVisible((prev) => {
      const newState = !prev;
      toggleMBlockVisibility(newState);
      return newState;
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
          <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" />
        </div>
        <div 
          className={`icon-container ${activeIcon === 'layers' ? 'active' : ''}`} 
          onClick={() => handleIconClick('layers', 'Layers Icon')} 
        >
          <FontAwesomeIcon icon={faLayerGroup} size="2x" />
        </div>
        <div 
          className={`icon-container ${activeIcon === 'building' ? 'active' : ''}`} 
          onClick={() => handleIconClick('building', 'Building Icon')}
        >
          <FontAwesomeIcon icon={faBuilding} size="2x" />
        </div>
        <div 
          className={`icon-container ${activeIcon === 'users' ? 'active' : ''}`} 
          onClick={() => handleIconClick('users', 'Users Icon')}
        >
          <FontAwesomeIcon icon={faUsers} size="2x" />
        </div>
      </div>

      {activeIcon === 'layers' && (
        <>
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
            <LayerItem title="PHATA Spatial Query">
              {map ? (
                <SpatialQuery map={map} />
              ) : (
                <p style={{ fontStyle: 'italic', fontSize: '13px' }}>Map not loaded yet.</p>
              )}
            </LayerItem>
            <LayerItem title="Development Authorities">
              <div>Layer details or controls for Development Authorities</div>
            </LayerItem>
            <LayerItem title="State Lands">
              <div>Layer details or controls for State Lands</div>
            </LayerItem>
            <LayerItem title="Digitized Blocks">
              <div className="town-list">
                <div className="town-row">
                  <span>M-Block</span>
                  <button onClick={handleToggleMBlock}>
                    {mBlockVisible ? 'Hide' : 'Show'}
                  </button>
                  {mBlockVisible && (
                    <button onClick={() => zoomToMBlock('M-Block')}>Fly to</button>
                  )}
                </div>
              </div>
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
            {/* Add legend content if needed */}
          </SidebarMenu>
        </>
      )}



      <button className="reset-button" onClick={onReset}>Reset View</button>


     
    </div>
  );
};

export default Sidebar;
