// /components/popups/AllSocietiesPopup.jsx
const AllSocietiesPopup = (data, lat, lng) => {
    return `
      <div class="custom-popup" style="padding: 10px; width: 550px;">
        <h3>Society Plot Details</h3>
        <table border="1" style="width: 100%;">
          <tr><td><strong>Latitude</strong></td><td>${lat.toFixed(6)}</td></tr>
          <tr><td><strong>Longitude</strong></td><td>${lng.toFixed(6)}</td></tr>
          <tr><td><strong>Town</strong></td><td>${data.town_name}</td></tr>
          <tr><td><strong>Plot No</strong></td><td>${data.plotno}</td></tr>
          <tr><td><strong>Landuse</strong></td><td>${data.landuse}</td></tr>
          <tr><td><strong>Society Type</strong></td><td>${data.societytyp}</td></tr>
          <tr><td><strong>Division</strong></td><td>${data.division}</td></tr>
          <tr><td><strong>District</strong></td><td>${data.district}</td></tr>
          <tr><td><strong>Tehsil</strong></td><td>${data.tehsil}</td></tr>
          <tr><td><strong>Block</strong></td><td>${data.block}</td></tr>
          <tr><td><strong>Source</strong></td><td>${data.source}</td></tr>
        </table>
      </div>
    `;
  };
  
  export default AllSocietiesPopup;
  