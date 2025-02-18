// LayerItem.jsx
import React, { useState } from 'react';

const LayerItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLayer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className="layer-header" onClick={toggleLayer}>
        <span>{isOpen ? '▼' : '►'}</span> {/* Arrow for toggle */}
        <strong>{title}</strong>
      </div>
      {isOpen && <div className="layer-content">{children}</div>}
    </div>
  );
};

export default LayerItem;