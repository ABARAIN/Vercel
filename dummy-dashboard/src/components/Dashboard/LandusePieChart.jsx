import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const landuseColorMap = {
  "Illegal": "#e53935" , "Commercial": "#000000", "Educational": "#2196f3", "Encroachment": "#795548",
  "Graveyard": "#9c27b0", "Health Facility": "#4caf50", "Nullah": "#00bcd4",
  "Open Space": "#cddc39", "Others": "#607d8b", "Park": "#8bc34a",
  "Parking": "#ffc107", "Public Building": "#ff5722", "Recreational Facility": "#3f51b5",
  "Religious": "#673ab7", "Religious Building": "#9575cd", "Residential": "#03a9f4",
  "Road": "#9e9e9e", "Village": "#ff9800", "Unclassified": "#bdbdbd",
};

const LandusePieChart = ({
  geojson,
  selectedClass,
  onClassClick,
  onResetFilter,
  onUpdateChartData
}) => {
  const [chartData, setChartData] = useState([{ name: 'Loading', value: 100 }]);

  useEffect(() => {
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      const loading = [{ name: 'Loading', value: 100 }];
      setChartData(loading);
      onUpdateChartData?.(loading);
      return;
    }

    const counts = {};
    geojson.features.forEach((f) => {
      const lu = f.properties?.landuse || 'Unclassified';
      counts[lu] = (counts[lu] || 0) + 1;
    });

    const parsed = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));

    setChartData(parsed);
    onUpdateChartData?.(parsed);
  }, [geojson]);

  const handleClick = (entry, index) => {
    const clicked = chartData[index]?.name;
    if (clicked && clicked !== 'Loading') {
      onClassClick?.(clicked);
    }
  };

  const getColor = (name) => landuseColorMap[name] || '#999';

  return (
    <div
      style={{
        height: '300px',
        position: 'relative',
      }}
    >
      {selectedClass && (
        <button
          onClick={onResetFilter}
          style={{
            position: 'absolute',
            top: 5,
            right: 10,
            fontSize: '12px',
            padding: '4px 8px',
            backgroundColor: '#eee',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          Reset
        </button>
      )}

      <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ cursor: 'grab' }}
      >
        <PieChart style={{ cursor: 'grab' }}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={55}
            label
            onClick={handleClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(entry.name)}
                stroke={selectedClass === entry.name ? "#000" : undefined}
                strokeWidth={selectedClass === entry.name ? 2 : 1}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LandusePieChart;
