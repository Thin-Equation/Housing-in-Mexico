import { useEffect, useState } from 'react';
import { housingApi } from '@/services/api';
import { Statistics, PropertyType, RegionStat } from '@/types/housing';
import PriceStatsChart from './PriceStatsChart';
import AreaStatsChart from './AreaStatsChart';
import PropertyTypeChart from './PropertyTypeChart';
import RegionStatsTable from './RegionStatsTable';
import CountrySelector from './CountrySelector';

const Dashboard = () => {
  // State for various statistics
  const [priceStats, setPriceStats] = useState<Statistics | null>(null);
  const [areaStats, setAreaStats] = useState<Statistics | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [priceStatsData, areaStatsData, propertyTypesData, regionStatsData] = await Promise.all([
          housingApi.getPriceStats(selectedCountry),
          housingApi.getAreaStats(selectedCountry),
          housingApi.getPropertyTypes(selectedCountry),
          housingApi.getRegionStats(selectedCountry)
        ]);

        setPriceStats(priceStatsData);
        setAreaStats(areaStatsData);
        setPropertyTypes(propertyTypesData);
        setRegionStats(regionStatsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedCountry]);

  const handleCountryChange = (country: string | null) => {
    setSelectedCountry(country);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
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
        <h1 className="text-3xl font-bold">Real Estate Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <CountrySelector selectedCountry={selectedCountry} onCountryChange={handleCountryChange} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Price Statistics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Price Distribution</h2>
          {priceStats && <PriceStatsChart stats={priceStats} />}
          {priceStats && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="font-medium">Average:</span> ${priceStats.mean.toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Median:</span> ${priceStats.median.toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Min:</span> ${priceStats.min.toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Max:</span> ${priceStats.max.toLocaleString()}
              </div>
            </div>
          )}
        </div>
        
        {/* Area Statistics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Area Distribution</h2>
          {areaStats && <AreaStatsChart stats={areaStats} />}
          {areaStats && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="font-medium">Average:</span> {areaStats.mean.toFixed(2)} m²
              </div>
              <div className="text-sm">
                <span className="font-medium">Median:</span> {areaStats.median.toFixed(2)} m²
              </div>
              <div className="text-sm">
                <span className="font-medium">Min:</span> {areaStats.min.toFixed(2)} m²
              </div>
              <div className="text-sm">
                <span className="font-medium">Max:</span> {areaStats.max.toFixed(2)} m²
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Property Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Property Types</h2>
          {propertyTypes.length > 0 && <PropertyTypeChart propertyTypes={propertyTypes} />}
        </div>
        
        {/* Region Statistics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Regional Analysis</h2>
          {regionStats.length > 0 && <RegionStatsTable regions={regionStats} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;