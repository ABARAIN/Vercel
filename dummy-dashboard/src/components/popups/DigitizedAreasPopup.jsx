import './DigitizedAreasPopup.css';

const DigitizedAreasPopup = (data, lat, lng) => {
<<<<<<< Updated upstream
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
  
=======
  const uid = Math.random().toString(36).substring(2, 10);

  return `
    <div class="custom-popup">
      <h3>Plot Details</h3>

      <table>
        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'basic')">
            <th colspan="2">Basic Information ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-basic" class="section-content">
          <tr><td><strong>Plot Number</strong></td><td>${data.plot_no}</td></tr>
          <tr><td><strong>Block</strong></td><td>${data.block}</td></tr>
        </tbody>

        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'ownership')">
            <th colspan="2">Ownership Record ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-ownership" class="section-content">
          <tr><td><strong>Owner</strong></td><td>${data.owner_na_1}</td></tr>
          <tr><td><strong>Father/Husband Name</strong></td><td>${data.fath_name}</td></tr>
          <tr><td><strong>CNIC</strong></td><td>${data.new_cnic}</td></tr>
          <tr><td><strong>Contact</strong></td><td>${data.cell_no}</td></tr>
        </tbody>

        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'file')">
            <th colspan="2">File Details ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-file" class="section-content">
          <tr><td><strong>File Number</strong></td><td>${data.file_no}</td></tr>
        </tbody>

        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'landuse')">
            <th colspan="2">Land-use Details ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-landuse" class="section-content">
          <tr><td><strong>Landuse</strong></td><td>${data.landuse}</td></tr>
          <tr><td><strong>Commercial Entity</strong></td><td>${data.commercial}</td></tr>
          <tr><td><strong>Owner (if commercial)</strong></td><td>${data.owner_name}</td></tr>
          <tr><td><strong>Contact No (Commercial)</strong></td><td>${data.contact_nu}</td></tr>
          <tr><td><strong>Image</strong></td><td><a href="${data.img}" target="_blank">View Image</a></td></tr>
          <tr><td><strong>Remarks</strong></td><td>${data.remarks}</td></tr>
        </tbody>

        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'area')">
            <th colspan="2">Area Details ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-area" class="section-content">
          <tr><td><strong>As per Master Plan</strong></td><td>${data.mp_area}</td></tr>
          <tr><td><strong>As per Property File</strong></td><td>${data.plot_area}</td></tr>
          <tr><td><strong>As per Demarcation</strong></td><td>${data.plot_area_1}</td></tr>
          <tr><td><strong>Property Footprint</strong></td><td>${data.area_digit}</td></tr>
        </tbody>

        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'demarcation')">
            <th colspan="2">Demarcation Plan ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-demarcation" class="section-content">
          <tr><td><strong>Coordinates</strong></td><td>(${lng.toFixed(6)}, ${lat.toFixed(6)})</td></tr>
          <tr><td><strong>Print Plan</strong></td><td><a href="demarcation_plan_link" target="_blank">Click Here</a></td></tr>
        </tbody>
      </table>
    </div>
  `;
};

export default DigitizedAreasPopup;
>>>>>>> Stashed changes
