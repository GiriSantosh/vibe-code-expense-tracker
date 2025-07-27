import React from 'react';

interface MonthlySummary {
  year: number;
  month: number;
  total: number;
}

interface ExpenseSummaryProps {
  monthlySummary: MonthlySummary[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ monthlySummary }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Monthly Summary</h2>
      {monthlySummary.length === 0 ? (
        <p>No monthly summary available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlySummary.map((summary, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{summary.year}-{String(summary.month).padStart(2, '0')}</h3>
              <p className="text-xl font-bold text-blue-600">${summary.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;