const DigitizedAreasPopup = (data, lat, lng) => {
    return `
      <div class="custom-popup" style="max-height: 400px; overflow-y: auto; padding: 10px; width: 550px;">
        <h3 style="text-align: center; margin-bottom: 10px;">Digitized Plot Details</h3>
        <table border="1" style="border-collapse: collapse; width: 110%; text-align: left;">
          <tr><th colspan="2" style="background-color: #f0f0f0;">Basic Information</th></tr>
         
          <tr><td><strong>Block</strong></td><td>${data.block}</td></tr>
          <tr><td><strong>Plot No</strong></td><td>${data.plot_no}</td></tr>
          <tr><td><strong>Landuse</strong></td><td>${data.landuse}</td></tr>
  
          <tr><th colspan="2" style="background-color: #f0f0f0;">Owner Details</th></tr>
          <tr><td><strong>Owner</strong></td><td>${data.owner_na_1}</td></tr>
          <tr><td><strong>Father Name</strong></td><td>${data.fath_name}</td></tr>
          <tr><td><strong>CNIC</strong></td><td>${data.new_cnic}</td></tr>
  
          <tr><th colspan="2" style="background-color: #f0f0f0;">Area Details</th></tr>
          <tr><td><strong>MP Area</strong></td><td>${data.mp_area}</td></tr>
          <tr><td><strong>Sqft Area</strong></td><td>${data.sq_ft_area}</td></tr>
          <tr><td><strong>Property Footprint</strong></td><td>${data.area_digit}</td></tr>
          <tr><td><strong>Plot Area (File)</strong></td><td>${data.plot_area}</td></tr>
          <tr><td><strong>Plot Area (Demarcation)</strong></td><td>${data.plot_area_1}</td></tr>
          <tr><td><strong>Marla</strong></td><td>${data.marla ?? 'N/A'}</td></tr>
  
          <tr><th colspan="2" style="background-color: #f0f0f0;">Commercial Info</th></tr>
          <tr><td><strong>Commercial Status</strong></td><td>${data.commercial}</td></tr>
          <tr><td><strong>Commercial Owner</strong></td><td>${data.owner_name}</td></tr>
          <tr><th colspan="2" style="background-color: #f0f0f0;">Coordinates</th></tr>
          <tr><td><strong>Latitude</strong></td><td>${lat.toFixed(6)}</td></tr>
          <tr><td><strong>Longitude</strong></td><td>${lng.toFixed(6)}</td></tr>
        </table>
      </div>
    `;
  };
  
  export default DigitizedAreasPopup;
  