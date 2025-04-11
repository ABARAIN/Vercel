// import React, { useState } from 'react';
// import Select from 'react-select';
// import '../styles/Navbar.css'; 
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMapMarkerAlt, faLayerGroup, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';

// const Navbar = ({
//   districts, 
//   tehsils, 
//   mauzas, 
//   societies, 
//   blocks,
//   plot_no,
//   selectedDistrict, 
//   selectedTehsil, 
//   selectedMauza, 
//   selectedSociety,
//   selectedBlock,
//   selectedPlot,
//   onDistrictChange, 
//   onTehsilChange, 
//   onMauzaChange, 
//   onSocietyChange, 
//   onBlockChange,
//   onPlotChange,
//   fetchMauzas,
//   onApplyFilters, 
//   onRemoveFilters,
  
// }) => {
//   const [showTehsil, setShowTehsil] = useState(false);
//   const [filterOption, setFilterOption] = useState(''); 
//   const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
//   const [showMauzaDropdown, setShowMauzaDropdown] = useState(false);

  
//   const handleDistrictChange = (district) => {
//     onDistrictChange(district);
//     setShowTehsil(true);
//     setFilterOption(''); 
//   };

//   const handleTehsilChange = (tehsil) => {
//     onTehsilChange(tehsil);
//     if (tehsil) {
//       setFilterOption(''); 
//       fetchMauzas(selectedDistrict, tehsil);
//     } else {
//       setFilterOption(''); 
//     }
//   };

//   const handleFilterOptionChange = (option) => {
//     setFilterOption(option);
//     if (option === 'society') {
//       setShowSocietyDropdown(true);
//       setShowMauzaDropdown(false);
//     } else if (option === 'mauza') {
//       setShowMauzaDropdown(true);
//       setShowSocietyDropdown(false);
//     }
//   };

//   return (
//     <nav className="navbar">
//       <div className="dropdown">
//         <select onChange={(e) => handleDistrictChange(e.target.value)} value={selectedDistrict}>
//           <option value="">Select District</option>
//           {districts.map((district) => (
//             <option key={district} value={district}>{district}</option>
//           ))}
//         </select>
//       </div>

//       {showTehsil && selectedDistrict && (
//         <div className="dropdown">
//           <select onChange={(e) => handleTehsilChange(e.target.value)} value={selectedTehsil}>
//             <option value="">Select Tehsil</option>
//             {tehsils.map((tehsil) => (
//               <option key={tehsil} value={tehsil}>{tehsil}</option>
//             ))}
//           </select>
//         </div>
//       )}

//       {showTehsil && selectedTehsil && (
//         <div className="dropdown">
//           <select onChange={(e) => handleFilterOptionChange(e.target.value)} value={filterOption}>
//             <option value="">Select Filter Option</option>
//             <option value="society">Filter by Society</option>
//             <option value="mauza">Filter by Mauza</option>
//           </select>
//         </div>
//       )}

// {showSocietyDropdown && (
//     <div className="dropdown">
//         <select onChange={(e) => onSocietyChange(e.target.value)} value={selectedSociety}>
//             <option value="">Select Society</option>
//             {societies.map((society) => (
//                 <option key={society} value={society}>{society}</option>
//             ))}
//         </select>
//     </div>
// )}

// {showSocietyDropdown && selectedSociety && (
//     <div className="dropdown">
//         <select onChange={(e) => onBlockChange(e.target.value)} value={selectedBlock}>
//             <option value="">Select Block</option>
//             {blocks
//                 .filter(block => block) // Remove null values
//                 .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
//                 .map((block) => (
//                     <option key={block} value={block}>{block} - Block</option>
//                 ))}
//         </select>
//     </div>
// )}

// {/* {showSocietyDropdown && selectedBlock && (
//     <div className="dropdown">
//         <select onChange={(e) => onPlotChange(e.target.value)} value={selectedPlot}>
//             <option value="">Select Plot No</option>
//             {plots.map((plot_no) => (
//                 <option key={plot_no} value={plot_no}>{plot_no}</option>
//             ))}
//         </select>
//     </div>
// )} */}

// {showSocietyDropdown && selectedBlock && (
//   <div className="dropdown">
//     <Select
//   options={plot_no
//     ?.filter(plot => plot !== null && plot !== undefined) // Ensure valid values
//     .sort((a, b) => Number(a) - Number(b)) // Sort numerically
//     .map(plot_no => ({ value: plot_no, label: plot_no }))
//   }
//   onChange={(selectedOption) => onPlotChange(selectedOption.value)}
//   value={selectedPlot ? { value: selectedPlot, label: selectedPlot } : null}
//   placeholder="Select Plot No"
//   isSearchable
//   styles={{
//     control: (base) => ({
//       ...base,
//       height: '40px',
//       minHeight: '40px',
//       backgroundColor: "#2c2f33",
//       color: "#ffffff",
//       border: "1px solid #ccc",
//       borderRadius: "4px",
//       zIndex: 5,
//       "&:hover": {
//         borderColor: "#0056b3",
//         backgroundColor: "#3a3f43",
//       },
//     }),
//     singleValue: (base) => ({
//       ...base,
//       color: "#ffffff",
//     }),
//     menu: (base) => ({
//       ...base,
//       backgroundColor: "#2c2f33",
//       zIndex: 10,
//     }),
//     option: (base, { isSelected, isFocused }) => ({
//       ...base,
//       backgroundColor: isSelected ? "#007bff" : isFocused ? "#3a3f43" : "#2c2f33",
//       color: "#ffffff",
//       "&:hover": {
//         backgroundColor: "#3a3f43",
//       },
//     }),
//     dropdownIndicator: (base) => ({
//       ...base,
//       color: "#ffffff",
//       "&:hover": {
//         color: "#007bff",
//       },
//     }),
//   }}
// />
//   </div>
// )}



// {showMauzaDropdown && (
//     <div className="dropdown">
//         <select onChange={(e) => onMauzaChange(e.target.value)} value={selectedMauza}>
//             <option value="">Select Mauza</option>
//             {mauzas
//                 .filter(mauza => mauza) // Ensure no null/undefined values
//                 .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
//                 .map((mauza) => (
//                     <option key={mauza} value={mauza}>{mauza}</option>
//                 ))}
//         </select>
//     </div>
// )}


//       {(showSocietyDropdown || showMauzaDropdown) && (
//         <button onClick={onApplyFilters}>Apply Filters</button>
//       )}
      
//       {(showSocietyDropdown || showMauzaDropdown) && (
//         <button onClick={onRemoveFilters}>Remove Filters</button> 
//       )}
//     </nav>
//   );
// };

// export default Navbar;