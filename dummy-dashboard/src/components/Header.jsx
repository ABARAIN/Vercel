// src/components/Header.jsx

import React from 'react';
import '../styles/Header.css'; 

const Header = () => {
  return (
    <header className="header">       
        <h3 style={{ fontSize: '25px', font: 'Open Sans, sans-serif' }}>
            LDA - Lahore Development Authority
        </h3>
    </header>
);
};

export default Header;


/*
<img 
src={`LDA.png`} // Reference the logo from the public directory
alt="LDA Logo" 
style={{ width: '50px', height: 'auto', marginRight: '10px' }} // Adjust size and margin as needed
/>
*/