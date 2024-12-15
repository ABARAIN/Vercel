import React from 'react';
import shp from 'shpjs';
import '../styles/App.css';

function FileUpload({ onFileUpload }) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);
    onFileUpload(geojson);
  };

  return <input type="file" accept=".zip" onChange={handleFileChange} className="upload-input" />;
}

export default FileUpload;
