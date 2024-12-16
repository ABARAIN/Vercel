import React from 'react';

const Sidebar = ({
  center,
  zoom,
  onBasemapChange,
  onFileUpload,
  onRemoveLayer,
  uploadMessage,
  onReset,
}) => (
  <div className="sidebar">
    <div className="info">
      Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
    </div>

    <div className="buttons-container">
      <button className="basemap-button" onClick={() => onBasemapChange('mapbox://styles/mapbox/streets-v11')}>
        Streets
      </button>
      <button className="basemap-button" onClick={() => onBasemapChange('mapbox://styles/mapbox/satellite-v9')}>
        Satellite
      </button>
      <button className="basemap-button" onClick={() => onBasemapChange('mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y')}>
        3D Map
      </button>

      <input type="file" accept=".zip" onChange={onFileUpload} className="upload-input" />

      {/* <button className="remove-button" onClick={onRemoveLayer}>
        Remove Shapefile
      </button> */}
    </div>

    {uploadMessage && <div className="upload-message">{uploadMessage}</div>}

    <button onClick={onReset} className="reset-button">
      Reset
    </button>
  </div>
);

export default Sidebar;
