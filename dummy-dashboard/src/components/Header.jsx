// src/components/Header.jsx

import React from 'react';
import '../styles/Header.css'; 

const Header = () => {
  return (
    <header className="header">       
        
        <img 
    src={`LDAlogo.jpeg`} // Reference the logo from the public directory
    alt="LDA Logos" 
    style={{ 
        width: '50px', 
        height: 'auto', 
        marginRight: '10px', 
        border: '2px solid white', // Add a small white border
        borderRadius: '4px', // Optional: add rounded corners
        padding: '0px' // Optional: add padding to create space between the image and border
    }} 
/>
        
        <h3 style={{ fontSize: '25px', font: 'Open Sans, sans-serif' }}>
            Lahore Development Authority
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