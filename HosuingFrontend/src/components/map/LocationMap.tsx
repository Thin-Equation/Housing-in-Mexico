'use client';

import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { LocationData } from '@/types/housing';

// Function to determine color based on price
const getPriceMarkerIcon = (price: number) => {
  // Color scale from affordable (green) to expensive (red)
  let color = '#22c55e'; // Default: green for affordable
  
  if (price > 5000000) {
    color = '#ef4444'; // Red for very expensive
  } else if (price > 3000000) {
    color = '#f97316'; // Orange for expensive
  } else if (price > 1000000) {
    color = '#facc15'; // Yellow for medium
  }
  
  return L.divIcon({
    className: "custom-marker-icon",
    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  });
};

interface LocationMapProps {
  locations: LocationData[];
  height?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  locations,
  height = '600px'
}) => {
  // Find center of all points or default to Mexico City coordinates
  const getMapCenter = () => {
    if (!locations || locations.length === 0) {
      // Default to Mexico City
      return [19.4326, -99.1332];
    }
    
    // Calculate average of all points
    const totalPoints = locations.length;
    const sumLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const sumLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    
    return [sumLat / totalPoints, sumLng / totalPoints];
  };
  
  const mapCenter = getMapCenter();
  
  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={[mapCenter[0] as number, mapCenter[1] as number] as [number, number]} 
        zoom={11} 
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location, index) => (
          <Marker 
            key={index} 
            position={[location.latitude, location.longitude] as [number, number]}
            icon={getPriceMarkerIcon(location.price)}
          >
            <Popup>
              <div className="popup-content">
                <p><strong>Price:</strong> ${location.price.toLocaleString()}</p>
                <p><strong>Area:</strong> {location.area} m²</p>
                <p><strong>Type:</strong> {location.property_type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LocationMap;