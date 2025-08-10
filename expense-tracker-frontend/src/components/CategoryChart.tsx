import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// Import modules for side effects
import 'highcharts/highcharts-more';
import 'highcharts/modules/solid-gauge';

import { ExpenseCategory } from '../types/ExpenseCategory';
import { CategorySummary } from '../types/Analytics';

interface CategoryChartProps {
  categorySummary: CategorySummary[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ categorySummary }) => {
  // Defensive check for undefined/null categorySummary
  const safeCategorySummary = categorySummary || [];
  console.log('CategoryChart received data:', safeCategorySummary);
  const data = safeCategorySummary.map(item => ({
    name: item.category,
    y: item.totalAmount,
  }));
  console.log('CategoryChart processed data for Highcharts:', data);

  const options = {
    chart: {
      type: 'pie',
      height: 300,
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Category Breakdown',
      style: {
        color: '#374151',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      },
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    },
    accessibility: {
      point: {
        valueSuffix: '%',
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        size: '80%', // Make the pie chart larger
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          distance: -30, // Adjust distance for better readability with larger pie
          style: {
            color: 'white',
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: 'Expenses',
        colorByPoint: true,
        data: data,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md h-full flex flex-col">
      {data.length === 0 ? (
        <p className="text-gray-600 text-center">No category data available.</p>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
};

export default CategoryChart;