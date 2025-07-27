import React from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';

interface MonthlySummary {
  year: number;
  month: number;
  total: number;
}

interface MonthlySplineChartProps {
  monthlySummary: MonthlySummary[];
}

const MonthlySplineChart: React.FC<MonthlySplineChartProps> = ({ monthlySummary }) => {
  // Format data for the chart: combine year and month into a single string for X-axis
  const data = monthlySummary.map(item => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    total: item.total,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Monthly Spending Trend</h2>
      {data.length === 0 ? (
        <p>No monthly spending data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{
              top: 10, right: 30, left: 0, bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlySplineChart;
