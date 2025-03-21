import './DigitizedAreasPopup.css'; // Reusing the same CSS

const AllSocietiesPopup = (data, lat, lng) => {
  const uid = Math.random().toString(36).substring(2, 10);

  return `
    <div class="custom-popup">
      <h3>Society Plot Details</h3>
      <table>

        <!-- Plot Info -->
        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'plotinfo')">
            <th colspan="2">Plot Information ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-plotinfo" class="section-content">
          <tr><td><strong>Town</strong></td><td>${data.town_name}</td></tr>
          <tr><td><strong>Plot No</strong></td><td>${data.plotno}</td></tr>
          <tr><td><strong>Landuse</strong></td><td>${data.landuse}</td></tr>
          <tr><td><strong>Society Type</strong></td><td>${data.societytyp}</td></tr>
          <tr><td><strong>Block</strong></td><td>${data.block}</td></tr>
        </tbody>

        <!-- Administrative Info -->
        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'admininfo')">
            <th colspan="2">Administrative Details ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-admininfo" class="section-content">
          <tr><td><strong>Division</strong></td><td>${data.division}</td></tr>
          <tr><td><strong>District</strong></td><td>${data.district}</td></tr>
          <tr><td><strong>Tehsil</strong></td><td>${data.tehsil}</td></tr>
          <tr><td><strong>Source</strong></td><td>${data.source}</td></tr>
        </tbody>

        <!-- Coordinates -->
        <thead>
          <tr class="section-header" onclick="toggleAccordion('${uid}', 'coordinates')">
            <th colspan="2">Coordinates ⯆</th>
          </tr>
        </thead>
        <tbody id="${uid}-coordinates" class="section-content">
          <tr><td><strong>Latitude</strong></td><td>${lat.toFixed(6)}</td></tr>
          <tr><td><strong>Longitude</strong></td><td>${lng.toFixed(6)}</td></tr>
        </tbody>

      </table>
    </div>
  `;
};

export default AllSocietiesPopup;
