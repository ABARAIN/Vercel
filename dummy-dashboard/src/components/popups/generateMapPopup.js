// utils/generateMapPopup.js

export const generateMapPopup = (data, lat, lng, toggleFnName = 'toggleCorners') => {
    const content = document.createElement('div');
    content.className = 'map-plot-popup';
  
    content.innerHTML = `
      <div class="popup-header">
        <h4>📍 Plot Details</h4>
        <button class="popup-close" onclick="document.querySelector('.mapboxgl-popup').remove()">×</button>
      </div>
      <div class="popup-content">
        <div><strong>Society:</strong> ${data.town_name || '-'}</div>
        <div><strong>Block:</strong> ${data.block || '-'}</div>
        <div><strong>Plot No:</strong> ${data.plotno || data.plot_no || '-'}</div>
        <div><strong>Landuse:</strong> ${data.landuse || '-'}</div>
        <img class="popup-img" src="https://th.bing.com/th/id/R.838876fc00c30ad0027af2d3267c091d?rik=hRvmukEAwWdnaw&riu=http%3a%2f%2flocallylahore.com%2fwp-content%2fuploads%2fem1.jpg&ehk=%2fv80bp1JbCIjqlg3IrR2ZYZE8WHVfBChqETbnaqmahs%3d&risl=&pid=ImgRaw&r=0" alt="Emporium Mall" />
        <div class="popup-toggle">
          <label>
            <input type="checkbox" id="${toggleFnName}-checkbox" />
            Show Corners
          </label>
        </div>
      </div>
    `;
  
    return new mapboxgl.Popup({ offset: 25, closeOnClick: false })
      .setLngLat([lng, lat])
      .setDOMContent(content);
  };
  