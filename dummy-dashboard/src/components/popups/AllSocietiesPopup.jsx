const AllSocietiesPopup = (data, lat, lng) => {
    return `
      <div class="custom-popup" style="max-height: 400px; overflow-y: auto; padding: 10px; width: 550px;">
        <h3 style="text-align: center; margin-bottom: 10px;">Society Plot Details</h3>
        <table border="1" style="border-collapse: collapse; width: 110%; text-align: left;">
          <tr><th colspan="2" style="background-color: #f0f0f0;">Basic Information</th></tr>
          
          <tr><td><strong>Town Name</strong></td><td>${data.town_name}</td></tr>
          <tr><td><strong>Landuse</strong></td><td>${data.landuse}</td></tr>
          <tr><td><strong>Plot No</strong></td><td>${data.plotno}</td></tr>
          <tr><td><strong>Society Type</strong></td><td>${data.societytyp}</td></tr>
          <tr><td><strong>Division</strong></td><td>${data.division}</td></tr>
          <tr><td><strong>District</strong></td><td>${data.district}</td></tr>
          <tr><td><strong>Tehsil</strong></td><td>${data.tehsil}</td></tr>
          <tr><td><strong>Block</strong></td><td>${data.block}</td></tr>
          <tr><td><strong>Latitude</strong></td><td>${lat.toFixed(6)}</td></tr>
          <tr><td><strong>Longitude</strong></td><td>${lng.toFixed(6)}</td></tr>
        
        </table>
      </div>
    `;
  };
  
  export default AllSocietiesPopup;
  