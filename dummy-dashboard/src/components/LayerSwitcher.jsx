import React from 'react';
import '../styles/LayerSwitcher.css';

const LayerSwitcher = ({ layers, onToggleLayer }) => (
  <div className="layer-switcher">
    <h4>Layers</h4>
    {layers.map((layer) => (
      <div key={layer.id} className="layer-item">
        <input
          type="checkbox"
          checked={layer.visible}
          onChange={() => onToggleLayer(layer.id)}
          id={`layer-${layer.id}`}
        />
        <label htmlFor={`layer-${layer.id}`}>{layer.name}</label>
      </div>
    ))}
  </div>
);

export default LayerSwitcher;
