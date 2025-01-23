import React, { useState } from 'react';

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

export default Sidebar;
