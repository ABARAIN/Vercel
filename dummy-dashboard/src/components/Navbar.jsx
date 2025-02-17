import React, { useState } from 'react';
import '../styles/Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ districts, tehsils, societies, blocks }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedSociety, setSelectedSociety] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  return (
    <nav className="navbar">
      <div className="dropdown">
        <select onChange={(e) => setSelectedDistrict(e.target.value)} value={selectedDistrict}>
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>

      <div className="dropdown">
        <select onChange={(e) => setSelectedTehsil(e.target.value)} value={selectedTehsil}>
          <option value="">Select Tehsil</option>
          {tehsils.map((tehsil) => (
            <option key={tehsil} value={tehsil}>{tehsil}</option>
          ))}
        </select>
      </div>
  
      <div className="dropdown">
        <select onChange={(e) => setSelectedSociety(e.target.value)} value={selectedSociety}>
          <option value="">Select Society</option>
          {societies.map((society) => (
            <option key={society} value={society}>{society}</option>
          ))}
        </select>
      </div>

      <div className="dropdown">
        <select onChange={(e) => setSelectedBlock(e.target.value)} value={selectedBlock}>
          <option value="">Select Block</option>
          {blocks.map((block) => (
            <option key={block} value={block}>{block}</option>
          ))}
        </select>
      </div>
    </nav>
  );
};

export default Navbar;