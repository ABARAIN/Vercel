import React from 'react';

const LayerSwitcher = ({ layers, onToggleLayer }) => {
  return (
    <div className="layer-switcher">
      <h3>Layer Switcher</h3>
      {layers.map((layer) => (
        <div key={layer.id} className="layer-item">
          <input
            type="checkbox"
            id={layer.id}
            checked={layer.visible}
            onChange={() => onToggleLayer(layer.id)}
          />
          <label htmlFor={layer.id}>{layer.name}</label>
        </div>
      ))}
    </div>
  );
};

export default LayerSwitcher;
