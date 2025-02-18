import React, { useState } from 'react';
import '../styles/Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({
  districts, 
  tehsils, 
  mauzas, 
  societies, 
  newdistricts, 
  selectedDistrict, 
  selectedTehsil, 
  selectedMauza, 
  selectedSociety,
  onDistrictChange, 
  onTehsilChange, 
  onMauzaChange, 
  onSocietyChange, 
  onApplyFilters, 
  fetchNewFilteredData
}) => {
  const [showTehsil, setShowTehsil] = useState(false);
  const [showSocietyButton, setShowSocietyButton] = useState(false);
  const [showMauzaButton, setShowMauzaButton] = useState(false);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [showMauzaDropdown, setShowMauzaDropdown] = useState(false);

  const handleDistrictChange = (district) => {
    onDistrictChange(district);
    setShowTehsil(true); 
    setShowSocietyButton(false); 
    setShowMauzaButton(false);
    setShowSocietyDropdown(false); 
    setShowMauzaDropdown(false);
  };

  const handleTehsilChange = (tehsil) => {
    onTehsilChange(tehsil);
    if (tehsil) {
        setShowSocietyButton(true); 
        setShowMauzaButton(true);
    } else {
        setShowSocietyButton(false); 
        setShowMauzaButton(false);
    }
  };

  const handleSocietyButtonClick = () => {
    setShowSocietyDropdown(true);
    setShowMauzaDropdown(false);
  };

  const handleMauzaButtonClick = () => {
    setShowMauzaDropdown(true);
    setShowSocietyDropdown(false);
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
              {showSocietyButton && <button onClick={handleSocietyButtonClick}>Filter by Society</button>}
              {showMauzaButton && <button onClick={handleMauzaButtonClick}>Filter by Mauza</button>}
        

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
      
    </nav>
  );
};

export default Navbar;