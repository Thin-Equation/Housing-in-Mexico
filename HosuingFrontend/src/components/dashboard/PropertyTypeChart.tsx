import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PropertyType } from '@/types/housing';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PropertyTypeChartProps {
  propertyTypes: PropertyType[];
}

const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({ propertyTypes }) => {
  // Generate random colors for each property type
  const generateColors = (count: number) => {
    const backgroundColors = [];
    const borderColors = [];
    
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      
      backgroundColors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
      borderColors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }
    
    return { backgroundColors, borderColors };
  };
  
  const { backgroundColors, borderColors } = generateColors(propertyTypes.length);
  
  const chartData = {
    labels: propertyTypes.map(type => type.property_type),
    datasets: [
      {
        label: 'Number of Properties',
        data: propertyTypes.map(type => type.count),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Property Types Distribution',
      },
    },
  };
  
  return <Pie data={chartData} options={options} />;
};

export default PropertyTypeChart;