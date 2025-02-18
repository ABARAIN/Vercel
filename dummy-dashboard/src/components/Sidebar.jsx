import React from 'react';
import SidebarMenu from './SidebarMenu';
import BasemapSelector from './BasemapSelector';
import LayerItem from './LayerItem'; 

const Sidebar = ({ onBasemapChange, onFileUpload, uploadMessage, onReset }) => {
  return (
    <div className="sidebar">
    <SidebarMenu title="Map Layers">
      <LayerItem title="Geodetic Network">
        <div>Layer details or controls for Geodetic Network</div>
      </LayerItem>
      <LayerItem title="Cooperative Society">
        <div>Layer details or controls for Cooperative Society</div>
      </LayerItem>
      <LayerItem title="Private Society">
        <div>Layer details or controls for Private Society</div>
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
    </SidebarMenu>
    <SidebarMenu title="Basemap">
      <BasemapSelector onBasemapChange={onBasemapChange} />
    </SidebarMenu>
    <SidebarMenu title="Legend">
      <div>Legend Item 1</div>
      <div>Legend Item 2</div>
    </SidebarMenu>
    <div className="file-upload">
      <input type="file" onChange={onFileUpload} />
      {uploadMessage && <p>{uploadMessage}</p>}
      
    </div>
    <button className="reset-button" onClick={onReset}>Reset View</button>
  </div>
  );
};

export default Sidebar;

{/*import React, { useState } from 'react';

const Sidebar = ({
  center,
  zoom,
  onBasemapChange,
  onFileUpload,
  uploadMessage,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState('basemaps');
  const basemaps = [
    { label: 'Streets', style: 'mapbox://styles/mapbox/streets-v11' },
    { label: 'Satellite', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { label: 'Dark', style: 'mapbox://styles/mapbox/dark-v10' },
    { label: 'Light', style: 'mapbox://styles/mapbox/light-v10' },
    { label: 'Drone Imagery', style: 'mapbox://styles/ibrahimmalik2002/cm6909iji006b01qzduu40iha' },
  ];

  return (
    <div className="sidebar">
      <div className="tabs">
        <button
          className={activeTab === 'basemaps' ? 'active' : ''}
          onClick={() => setActiveTab('basemaps')}
        >
          Basemaps
        </button>
        <button
          className={activeTab === 'layers' ? 'active' : ''}
          onClick={() => setActiveTab('layers')}
        >
          Layers
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'basemaps' && (
          <div className="basemap-options">
            {basemaps.map((basemap) => (
              <button
                key={basemap.label}
                onClick={() => onBasemapChange(basemap.style)}
              >
                {basemap.label}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'layers' && (
          <div className="layer-options">
            <input type="file" onChange={onFileUpload} />
            {uploadMessage && <p>{uploadMessage}</p>}
          </div>
        )}
      </div>
      <button onClick={onReset}>Reset View</button>
    </div>
  );
};

export default Sidebar;*/}
