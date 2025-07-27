import React, { useState } from 'react';
import { ExpenseCategory } from '../types/ExpenseCategory';

interface FilterControlsProps {
  onFilter: (category?: ExpenseCategory, startDate?: string, endDate?: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilter }) => {
  const [category, setCategory] = useState<ExpenseCategory | ''>( '');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quickRange, setQuickRange] = useState<string>('');

  const calculateDates = (range: string) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    if (range === '7days') {
      start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (range === '15days') {
      start = new Date(today.setDate(today.getDate() - 15)).toISOString().split('T')[0];
    } else if (range === '1month') {
      start = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
    }
    return { start, end };
  };

  const handleFilter = () => {
    let finalStartDate = startDate || undefined;
    let finalEndDate = endDate || undefined;

    if (quickRange) {
      const { start, end } = calculateDates(quickRange);
      finalStartDate = start;
      finalEndDate = end;
    }

    onFilter(category === '' ? undefined : category, finalStartDate, finalEndDate);
  };

  const handleClear = () => {
    setCategory('');
    setStartDate('');
    setEndDate('');
    setQuickRange('');
    onFilter(undefined, undefined, undefined);
  };

  React.useEffect(() => {
    if (quickRange) {
      setStartDate('');
      setEndDate('');
    }
  }, [quickRange]);

  React.useEffect(() => {
    if (startDate || endDate) {
      setQuickRange('');
    }
  }, [startDate, endDate]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Filter Expenses</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
          <select
            id="filterCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory | '')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">All Categories</option>
            {Object.values(ExpenseCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quickRange" className="block text-gray-700 text-sm font-bold mb-2">Quick Range:</label>
          <select
            id="quickRange"
            value={quickRange}
            onChange={(e) => setQuickRange(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Custom</option>
            <option value="7days">Last 7 Days</option>
            <option value="15days">Last 15 Days</option>
            <option value="1month">Last 1 Month</option>
          </select>
        </div>
        <div>
          <label htmlFor="filterStartDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
          <input
            type="date"
            id="filterStartDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!!quickRange}
          />
        </div>
        <div>
          <label htmlFor="filterEndDate" className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
          <input
            type="date"
            id="filterEndDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!!quickRange}
          />
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleFilter}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Apply Filter
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
};

export default FilterControls;