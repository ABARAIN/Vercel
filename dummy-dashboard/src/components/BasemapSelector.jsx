import React, { useState } from 'react';
import streetsIcon from '../assets/icons/street.png'; 
import satelliteIcon from '../assets/icons/satellite.png';
import darkIcon from '../assets/icons/dark.png';
import lightIcon from '../assets/icons/light.png';
import droneIcon from '../assets/icons/drone.png';

function BasemapSelector({ onBasemapChange }) {
  const [selectedBasemap, setSelectedBasemap] = useState('mapbox://styles/mapbox/streets-v11');

  const handleBasemapClick = (style) => {
    setSelectedBasemap(style);
    onBasemapChange(style);
  };

  return (
    <div className="basemap-selector">
      <button 
        className={`basemap-button ${selectedBasemap === 'mapbox://styles/ibrahimmalik2002/cm8cq3smm00jf01sa72lchd2g' ? 'active' : ''}`} 
        onClick={() => handleBasemapClick('mapbox://styles/ibrahimmalik2002/cm8cq3smm00jf01sa72lchd2g')}
      >
        <img src={streetsIcon} alt="Streets" className="basemap-icon" /> Streets
      </button>
      <button 
        className={`basemap-button ${selectedBasemap === 'mapbox://styles/mapbox/satellite-streets-v12' ? 'active' : ''}`} 
        onClick={() => handleBasemapClick('mapbox://styles/mapbox/satellite-streets-v12')}
      >
        <img src={satelliteIcon} alt="Satellite" className="basemap-icon" /> Satellite
      </button>
      <button 
        className={`basemap-button ${selectedBasemap === 'mapbox://styles/mapbox/dark-v10' ? 'active' : ''}`} 
        onClick={() => handleBasemapClick('mapbox://styles/mapbox/dark-v10')}
      >
        <img src={darkIcon} alt="Dark" className="basemap-icon" /> Dark
      </button>
      <button 
        className={`basemap-button ${selectedBasemap === 'mapbox://styles/mapbox/light-v10' ? 'active' : ''}`} 
        onClick={() => handleBasemapClick('mapbox://styles/mapbox/light-v10')}
      >
        <img src={lightIcon} alt="Light" className="basemap-icon" /> Light
      </button>
      <button 
        className={`basemap-button ${selectedBasemap === 'mapbox://styles/ibrahimmalik2002/cm6909iji006b01qzduu40iha' ? 'active' : ''}`} 
        onClick={() => handleBasemapClick('mapbox://styles/ibrahimmalik2002/cm6909iji006b01qzduu40iha')}
      >
        <img src={droneIcon} alt="Drone Imagery" className="basemap-icon" /> Drone Imagery
      </button>
    </div>
  );
}

export default BasemapSelector;