import React from 'react';

const colorMap = {
  "Commercial": "#f44336", "Educational": "#2196f3", "Encroachment": "#795548",
  "Graveyard": "#9c27b0", "Health Facility": "#4caf50", "Nullah": "#00bcd4",
  "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
  "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
  "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
  "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd"
};

const LanduseLegend = ({ data, selectedClass, onClassClick }) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontSize: '17px',
    }}>
      {data.map((entry, index) => {
        const isSelected = selectedClass === entry.name;
        return (
          <div
            key={index}
            onClick={() => onClassClick?.(entry.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: isSelected ? '#e3f2fd' : '#fff',
              borderRadius: '6px',
              border: isSelected ? '1px solid #2196f3' : '1px solid #eee',
              cursor: 'pointer',
              boxShadow: isSelected ? '0 0 3px #2196f3' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 14,
                height: 14,
                backgroundColor: colorMap[entry.name] || "#999",
                marginRight: 10,
                borderRadius: 2
              }}></div>
              <span>{entry.name}</span>
            </div>
            <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LanduseLegend;
