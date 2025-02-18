import React, { useState } from 'react';
import '../styles/Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ districts, tehsils, mauzas, societies, blocks, selectedDistrict, selectedTehsil, selectedMauza, selectedSociety, onDistrictChange, onTehsilChange, onMauzaChange, onSocietyChange, onApplyFilters}) => {
  //const [selectedDivision, setSelectedDivision] = useState('');
 // const [selectedDistrict, setSelectedDistrict] = useState('');
 // const [selectedTehsil, setSelectedTehsil] = useState('');
 // const [selectedSociety, setSelectedSociety] = useState('');
  //const [selectedBlock, setSelectedBlock] = useState('');

  return (
    <nav className="navbar">
     {/*} <div className="dropdown">
        <select onChange={(e) => setSelectedDivision(e.target.value)} value={selectedDivision}>
          <option value="">Select Division</option>
          {divisions.map((division) => (
            <option key={division} value={division}>{division}</option>
          ))}
        </select>
      </div>*/}

<div className="dropdown">
        <select onChange={(e) => onDistrictChange(e.target.value)} value={selectedDistrict}>
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>

      {selectedDistrict && (
        <div className="dropdown">
          <select onChange={(e) => onTehsilChange(e.target.value)} value={selectedTehsil}>
            <option value="">Select Tehsil</option>
            {tehsils.map((tehsil) => (
              <option key={tehsil} value={tehsil}>{tehsil}</option>
            ))}
          </select>
        </div>
      )}

    {selectedTehsil && (
        <div className="dropdown">
          <select onChange={(e) => onSocietyChange(e.target.value)} value={selectedSociety}>
            <option value="">Select Society</option>
            {societies.map((society) => (
              <option key={society} value={society}>{society}</option>
            ))}
          </select>
        </div>
      )}

      {selectedTehsil && (
        <div className="dropdown">
          <select onChange={(e) => onMauzaChange(e.target.value)} value={selectedMauza}>
            <option value="">Select Mauza</option>
            {mauzas.map((mauza) => (
              <option key={mauza} value={mauza}>{mauza}</option>
            ))}
          </select>
        </div>
      )}

     {/* {blocks && (
        <div className="dropdown">
          <select onChange={(e) => setSelectedBlock(e.target.value)} value={selectedBlock}>
            <option value="">Select Block</option>
            {blocks.map((block) => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </div>
      )}*/}
      <button onClick={onApplyFilters}>Apply Filters</button>
    </nav>
  );
};

export default Navbar;