import React, { useState, useRef } from 'react';
import '../styles/App.css';

const SidebarMenu = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sidebar-menu">
      <div className="sidebar-menu-header" onClick={toggleMenu}>
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div 
        className={`sidebar-menu-content ${isOpen ? 'open' : ''}`} 
        ref={contentRef}
        style={{ 
          height: isOpen ? `${contentRef.current.scrollHeight}px` : '0' 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SidebarMenu;