import React from 'react';
import '../styles/App.css';

function FileUpload({ onFileUpload }) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Pass the file to the parent component for processing
    onFileUpload(file);
  };

  return (
    <input
      type="file"
      accept=".zip,.csv,.tif,.tiff"
      onChange={handleFileChange}
      className="upload-input"
    />
  );
}

export default FileUpload;
