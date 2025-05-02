import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Statistics } from '@/types/housing';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PriceStatsChartProps {
  stats: Statistics;
}

const PriceStatsChart: React.FC<PriceStatsChartProps> = ({ stats }) => {
  const { histogram } = stats;
  
  // Format the bin centers for display (convert to thousands)
  const formattedLabels = histogram.bin_centers.map(value => 
    `$${(value / 1000).toFixed(0)}k`
  );
  
  const chartData: ChartData<'bar'> = {
    labels: formattedLabels,
    datasets: [
      {
        label: 'Number of Properties',
        data: histogram.counts,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `Count: ${context.raw}`;
          },
          title: function(tooltipItems: TooltipItem<'bar'>[]) {
            return tooltipItems[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Price Range'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Properties'
        },
        beginAtZero: true
      }
    }
  };
  
  return <Bar data={chartData} options={options} />;
};

export default PriceStatsChart;