import React, { useState } from 'react';
import '../styles/Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({
  districts, 
  tehsils, 
  mauzas, 
  societies, 
  selectedDistrict, 
  selectedTehsil, 
  selectedMauza, 
  selectedSociety,
  onDistrictChange, 
  onTehsilChange, 
  onMauzaChange, 
  onSocietyChange, 
  fetchMauzas,
  onApplyFilters, 
  onRemoveFilters,
  
}) => {
  const [showTehsil, setShowTehsil] = useState(false);
  const [filterOption, setFilterOption] = useState(''); 
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [showMauzaDropdown, setShowMauzaDropdown] = useState(false);

  const handleDistrictChange = (district) => {
    onDistrictChange(district);
    setShowTehsil(true);
    setFilterOption(''); 
  };

  const handleTehsilChange = (tehsil) => {
    onTehsilChange(tehsil);
    if (tehsil) {
      setFilterOption(''); 
      fetchMauzas(selectedDistrict, tehsil);
    } else {
      setFilterOption(''); 
    }
  };

  const handleFilterOptionChange = (option) => {
    setFilterOption(option);
    if (option === 'society') {
      setShowSocietyDropdown(true);
      setShowMauzaDropdown(false);
    } else if (option === 'mauza') {
      setShowMauzaDropdown(true);
      setShowSocietyDropdown(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="dropdown">
        <select onChange={(e) => handleDistrictChange(e.target.value)} value={selectedDistrict}>
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>

      {showTehsil && selectedDistrict && (
        <div className="dropdown">
          <select onChange={(e) => handleTehsilChange(e.target.value)} value={selectedTehsil}>
            <option value="">Select Tehsil</option>
            {tehsils.map((tehsil) => (
              <option key={tehsil} value={tehsil}>{tehsil}</option>
            ))}
          </select>
        </div>
      )}

      {showTehsil && selectedTehsil && (
        <div className="dropdown">
          <select onChange={(e) => handleFilterOptionChange(e.target.value)} value={filterOption}>
            <option value="">Select Filter Option</option>
            <option value="society">Filter by Society</option>
            <option value="mauza">Filter by Mauza</option>
          </select>
        </div>
      )}

      {showSocietyDropdown && (
        <div className="dropdown">
          <select onChange={(e) => onSocietyChange(e.target.value)} value={selectedSociety}>
            <option value="">Select Society</option>
            {societies.map((society) => (
              <option key={society} value={society}>{society}</option>
            ))}
          </select>
        </div>
      )}

      {showMauzaDropdown && (
        <div className="dropdown">
          <select onChange={(e) => onMauzaChange(e.target.value)} value={selectedMauza}>
            <option value="">Select Mauza</option>
            {mauzas.map((mauza) => (
              <option key={mauza} value={mauza}>{mauza}</option>
            ))}
          </select>
        </div>
      )}

      {(showSocietyDropdown || showMauzaDropdown) && (
        <button onClick={onApplyFilters}>Apply Filters</button>
      )}
      
      {(showSocietyDropdown || showMauzaDropdown) && (
        <button onClick={onRemoveFilters}>Remove Filters</button> 
      )}
    </nav>
  );
};

export default Navbar;