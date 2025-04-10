import React, { useEffect, useState } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MapWithDraw = ({ map, draw }) => {  // Receive draw as a prop
    const [measurements, setMeasurements] = useState([]);
  
    useEffect(() => {
      if (!map || !draw) return; // Ensure both map and draw are available
  
       const metersToFeet = (meters) => meters * 3.28084;
  
      function updateMeasurements() {
        const data = draw.getAll(); // Use the draw instance passed as a prop
        const newMeasurements = [];
  
        data.features.forEach((feature) => {
          const coords = feature.geometry.coordinates;
          let measurementText = "";
  
          if (feature.geometry.type === "Point") {
            measurementText = `Point: [${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`;
          } else if (feature.geometry.type === "LineString") {
            let lengthMeters = 0;
            for (let i = 0; i < coords.length - 1; i++) {
              const from = coords[i];
              const to = coords[i + 1];
              lengthMeters += turf.distance(turf.point(from), turf.point(to), { units: "meters" });
            }
            measurementText = `Line Length: ${metersToFeet(lengthMeters).toFixed(2)} ft`;
          } else if (feature.geometry.type === "Polygon") {
            let areaMeters = turf.area(feature);
            measurementText = `Polygon Area: ${metersToFeet(metersToFeet(areaMeters)).toFixed(2)} sq ft`;
          }
  
          newMeasurements.push(measurementText);
        });
  
        setMeasurements(newMeasurements);
      }
  
      map.on("draw.create", updateMeasurements);
      map.on("draw.update", updateMeasurements);
      map.on("draw.delete", () => setMeasurements([]));
  
      return () => {
        map.off("draw.create", updateMeasurements);
        map.off("draw.update", updateMeasurements);
        map.off("draw.delete", updateMeasurements);
        // Do NOT remove the draw control here. It's handled in App.jsx
      };
    }, [map, draw]); // Add draw to the dependency array

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 10,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        border: "2px solid black", 
        zIndex: 1000,
      }}
    >
      <h4>Measurements</h4>
      <ul>
        {measurements.map((m, index) => (
          <li key={index}>{m}</li>
        ))}
      </ul>
    </div>
  );
};


export default MapWithDraw;
