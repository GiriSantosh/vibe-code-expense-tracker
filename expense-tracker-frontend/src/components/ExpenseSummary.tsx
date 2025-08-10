import React from 'react';
import { MonthlySummary } from '../types/Analytics';

interface ExpenseSummaryProps {
  monthlySummary: MonthlySummary[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ monthlySummary }) => {
  // Defensive check for undefined/null monthlySummary
  const safeMonthlySummary = monthlySummary || [];
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Summary</h2>
      {safeMonthlySummary.length === 0 ? (
        <p className="text-gray-600">No monthly summary available.</p>
      ) : (
        <div className="flex-grow grid grid-cols-1 gap-4 overflow-y-auto pr-2">
          {safeMonthlySummary.map((summary, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm border border-blue-200 flex justify-between items-center transform transition duration-300 hover:scale-105 hover:shadow-md"
            >
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  {summary.month}
                </h3>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">${summary.totalAmount ? summary.totalAmount.toFixed(2) : '0.00'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;