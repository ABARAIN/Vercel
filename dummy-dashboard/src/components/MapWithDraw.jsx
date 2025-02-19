import React, { useEffect, useState } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

const MapWithDraw = ({ map }) => {
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    if (!map) return; // Ensure the map is available

    // Initialize draw tools
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true,
      },
    });

    map.addControl(draw);

    // Function to convert meters to feet
    const metersToFeet = (meters) => meters * 3.28084;

    // Update measurements on draw events
    function updateMeasurements() {
      const data = draw.getAll();
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
      map.removeControl(draw);
    };
  }, [map]);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
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
