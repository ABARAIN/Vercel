import React from 'react';
import '../styles/App.css';

function Buttons({ onReset, onBasemapChange, onRemoveLayer }) {
  return (
    <div className="buttons-container">
      <button
        className="basemap-button"
        onClick={() => onBasemapChange('mapbox://styles/mapbox/streets-v11')}
      >
        Streets
      </button>
      <button
        className="basemap-button"
        onClick={() => onBasemapChange('mapbox://styles/mapbox/satellite-v9')}
      >
        Satellite
      </button>
      <button
        className="basemap-button"
        onClick={() =>
          onBasemapChange('mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y')
        }
      >
        3D Map
      </button>
      <button className="remove-button" onClick={onRemoveLayer}>
        Remove Shapefile
      </button>
      <button onClick={onReset} className="reset-button">
        Reset
      </button>
    </div>
  );
}

export default Buttons;
