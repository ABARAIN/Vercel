import './DigitizedAreasPopup.css'; // Reusing the same CSS

const MergedSocietyPopup = (data, lat, lng) => {
<<<<<<< Updated upstream
    return `
      <div class="custom-popup" style="max-height: 400px; overflow-y: auto; padding: 10px; width: 550px;">
        <h3 style="text-align: center; margin-bottom: 10px;">Merged Society Plot Details</h3>
        <table border="1" style="border-collapse: collapse; width: 110%; text-align: left;">
        <div class="custom-popup" style="max-height: 400px; overflow-y: auto; padding: 10px; width: 550px;">
        <h3 style="text-align: center; margin-bottom: 10px;">Plot Details</h3>
    
        <table border="1" style="border-collapse: collapse; width: 110%; text-align: left;">
            <!-- Basic Information -->
            <tr>
                <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Basic Information</th>
            </tr>
            <tr>
                <td style="padding: 8px;"><strong>Society</strong></td>
                <td style="padding: 8px;">${data.society}</td>
            </tr>
            <tr>
                <td style="padding: 8px;"><strong>Landuse</strong></td>
                <td style="padding: 8px;">${data.landuse}</td>
            </tr>
            <tr>
                <td style="padding: 8px;"><strong>Plot Number</strong></td>
                <td style="padding: 8px;">${data.plot_no}</td>
            </tr>
            <tr>
                <td style="padding: 8px;"><strong>District</strong></td>
                <td style="padding: 8px;">${data.district}</td>
            </tr>
            <tr>
                <td style="padding: 8px;"><strong>Tehsil</strong></td>
                <td style="padding: 8px;">${data.tehsil}</td>
            </tr>
    
            <!-- Location & Details -->
            <tr>
                <th colspan="2" style="background-color: #f0f0f0; text-align: center; padding: 8px;">Location & Details</th>
            </tr>
            <tr><td><strong>Latitude</strong></td><td>${lat.toFixed(6)}</td></tr>
            <tr><td><strong>Longitude</strong></td><td>${lng.toFixed(6)}</td></tr>
            <tr>
            <td style="padding: 8px;"><strong>View Property Details</strong></td>
            <td style="padding: 8px;"><a href="http://localhost:3000/login">Click Here</a></td>
        </tr>
        </table>
      </div>
    `;
  };
  
  export default MergedSocietyPopup;
  
=======
  const uid = Math.random().toString(36).substring(2, 10);

  return `
    <div class="custom-popup">
      <h3>Merged Society Plot Details</h3>
      <table>

        <!-- Basic Information -->
        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'info')">
            <th colspan="2">Basic Information ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-info" class="section-content">
          <tr><td><strong>Society</strong></td><td>${data.society}</td></tr>
          <tr><td><strong>Landuse</strong></td><td>${data.landuse}</td></tr>
          <tr><td><strong>Plot Number</strong></td><td>${data.plot_no}</td></tr>
          <tr><td><strong>District</strong></td><td>${data.district}</td></tr>
          <tr><td><strong>Tehsil</strong></td><td>${data.tehsil}</td></tr>
        </tbody>

        <!-- Location & Details -->
        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'location')">
            <th colspan="2">Location & Details ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-location" class="section-content">
          <tr><td><strong>Latitude</strong></td><td>${lat.toFixed(6)}</td></tr>
          <tr><td><strong>Longitude</strong></td><td>${lng.toFixed(6)}</td></tr>
          <tr><td><strong>View Property Details</strong></td>
              <td><a href="http://localhost:3000/login" target="_blank">Click Here</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

export default MergedSocietyPopup;
>>>>>>> Stashed changes
