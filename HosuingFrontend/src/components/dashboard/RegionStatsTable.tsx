import React, { useState } from 'react';
import { RegionStat } from '@/types/housing';

interface RegionStatsTableProps {
  regions: RegionStat[];
}

const RegionStatsTable: React.FC<RegionStatsTableProps> = ({ regions }) => {
  const [sortField, setSortField] = useState<keyof RegionStat>('price_count');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Sort regions based on current sort field and direction
  const sortedRegions = [...regions].sort((a, b) => {
    if (a[sortField] < b[sortField]) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Handle column header click for sorting
  const handleSortClick = (field: keyof RegionStat) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Render sort indicator arrow
  const renderSortArrow = (field: keyof RegionStat) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th 
              className="py-2 px-3 text-left cursor-pointer"
              onClick={() => handleSortClick('region')}
            >
              Region {renderSortArrow('region')}
            </th>
            <th 
              className="py-2 px-3 text-right cursor-pointer"
              onClick={() => handleSortClick('price_count')}
            >
              Count {renderSortArrow('price_count')}
            </th>
            <th 
              className="py-2 px-3 text-right cursor-pointer"
              onClick={() => handleSortClick('price_mean')}
            >
              Avg Price {renderSortArrow('price_mean')}
            </th>
            <th 
              className="py-2 px-3 text-right cursor-pointer"
              onClick={() => handleSortClick('area_mean')}
            >
              Avg Area {renderSortArrow('area_mean')}
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {sortedRegions.map((region, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-3 text-left">{region.region}</td>
              <td className="py-2 px-3 text-right">{region.price_count}</td>
              <td className="py-2 px-3 text-right">
                ${region.price_mean.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
              <td className="py-2 px-3 text-right">
                {region.area_mean.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegionStatsTable;