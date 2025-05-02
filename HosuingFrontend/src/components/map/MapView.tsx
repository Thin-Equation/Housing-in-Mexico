'use client';

import React, { useState, useEffect } from 'react';
import { housingApi } from '@/services/api';
import { LocationData } from '@/types/housing';
import dynamic from 'next/dynamic';
import CountrySelector from '../dashboard/CountrySelector';

// Import the LocationMap component dynamically with ssr disabled
const LocationMap = dynamic(
  () => import('./LocationMap'),
  { ssr: false } // This ensures the component only renders on client-side
);

const MapView: React.FC = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 1000]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  
  // Available property types
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  
  // Fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      try {
        const locationData = await housingApi.getLocations(selectedCountry);
        setLocations(locationData);
        setFilteredLocations(locationData);
        
        // Extract unique property types
        const types = Array.from(
          new Set(locationData.map((loc: LocationData) => loc.property_type))
        ) as string[];
        setPropertyTypes(types);
        
        // Calculate price range
        if (locationData.length > 0) {
          const minPrice = Math.min(...locationData.map((loc: LocationData) => loc.price));
          const maxPrice = Math.max(...locationData.map((loc: LocationData) => loc.price));
          setPriceRange([minPrice, maxPrice]);
          
          const minArea = Math.min(...locationData.map((loc: LocationData) => loc.area));
          const maxArea = Math.max(...locationData.map((loc: LocationData) => loc.area));
          setAreaRange([minArea, maxArea]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching location data', err);
        setError('Failed to load location data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocationData();
  }, [selectedCountry]);

  // Handle country change
  const handleCountryChange = (country: string | null) => {
    setSelectedCountry(country);
  };
  
  // Apply filters when filter values change
  useEffect(() => {
    if (locations.length === 0) return;
    
    const filtered = locations.filter(location => {
      // Filter by price range
      const priceInRange = location.price >= priceRange[0] && location.price <= priceRange[1];
      
      // Filter by area range
      const areaInRange = location.area >= areaRange[0] && location.area <= areaRange[1];
      
      // Filter by property type
      const typeMatches = selectedPropertyType === 'all' || location.property_type === selectedPropertyType;
      
      return priceInRange && areaInRange && typeMatches;
    });
    
    setFilteredLocations(filtered);
  }, [priceRange, areaRange, selectedPropertyType, locations]);
  
  // Handle price range change
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPriceRange([value, priceRange[1]]);
  };
  
  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPriceRange([priceRange[0], value]);
  };
  
  // Handle area range change
  const handleAreaMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAreaRange([value, areaRange[1]]);
  };
  
  const handleAreaMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAreaRange([areaRange[0], value]);
  };
  
  // Handle property type change
  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPropertyType(e.target.value);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading map data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Property Locations</h1>
        <div className="mt-4 md:mt-0">
          <CountrySelector selectedCountry={selectedCountry} onCountryChange={handleCountryChange} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Properties</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Range Filter */}
          <div>
            <h3 className="text-md font-medium mb-2">Price Range</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Min Price"
                value={priceRange[0]}
                onChange={handlePriceMinChange}
              />
              <span>to</span>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Max Price"
                value={priceRange[1]}
                onChange={handlePriceMaxChange}
              />
            </div>
          </div>
          
          {/* Area Range Filter */}
          <div>
            <h3 className="text-md font-medium mb-2">Area Range (m²)</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Min Area"
                value={areaRange[0]}
                onChange={handleAreaMinChange}
              />
              <span>to</span>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Max Area"
                value={areaRange[1]}
                onChange={handleAreaMaxChange}
              />
            </div>
          </div>
          
          {/* Property Type Filter */}
          <div>
            <h3 className="text-md font-medium mb-2">Property Type</h3>
            <select
              className="w-full p-2 border rounded"
              value={selectedPropertyType}
              onChange={handlePropertyTypeChange}
            >
              <option value="all">All Property Types</option>
              {propertyTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLocations.length} of {locations.length} properties
          {selectedCountry && <span> in {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}</span>}
        </div>
      </div>
      
      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="h-[600px]">
          <LocationMap locations={filteredLocations} />
        </div>
        
        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#22c55e] mr-2"></div>
            <span>Affordable (Less than 1M)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#facc15] mr-2"></div>
            <span>Medium (1M - 3M)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#f97316] mr-2"></div>
            <span>Expensive (3M - 5M)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] mr-2"></div>
            <span>Very Expensive (Over 5M)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;