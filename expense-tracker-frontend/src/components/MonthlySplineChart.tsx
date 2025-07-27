import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface MonthlySummary {
  year: number;
  month: number;
  total: number;
}

interface MonthlySplineChartProps {
  monthlySummary: MonthlySummary[];
}

const MonthlySplineChart: React.FC<MonthlySplineChartProps> = ({ monthlySummary }) => {
  const categories = monthlySummary.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`);
  const data = monthlySummary.map(item => item.total);

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
      {monthlySummary.length === 0 ? (
        <p>No monthly spending data available for the selected period.</p>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
};

export default MonthlySplineChart;