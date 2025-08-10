import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MonthlySummary } from '../types/Analytics';

interface MonthlySplineChartProps {
  monthlySummary: MonthlySummary[];
}

const MonthlySplineChart: React.FC<MonthlySplineChartProps> = ({ monthlySummary }) => {
  // Defensive check for undefined/null monthlySummary
  const safeMonthlySummary = monthlySummary || [];
  const categories = safeMonthlySummary.map(item => item.month);
  const data = safeMonthlySummary.map(item => item.totalAmount);

  const options = {
    chart: {
      type: 'spline',
    },
    title: {
      text: 'Monthly Spending Trend',
    },
    xAxis: {
      categories: categories,
      title: {
        text: 'Month',
      },
    },
    yAxis: {
      title: {
        text: 'Total Spending ($)',
      },
    },
    series: [
      {
        name: 'Spending',
        data: data,
        color: '#8884d8',
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      {safeMonthlySummary.length === 0 ? (
        <p>No monthly spending data available for the selected period.</p>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
};

export default MonthlySplineChart;