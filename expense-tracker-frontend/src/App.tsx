import React, { useState, useEffect } from 'react';
import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import CategoryChart from './components/CategoryChart';
import FilterControls from './components/FilterControls';
import MonthlySplineChart from './components/MonthlySplineChart'; // New import
import { ExpenseCategory } from './types/ExpenseCategory';

function App() {
  const { expenses, monthlySummary, categorySummary, loading, error, fetchExpenses, addExpense, deleteExpense, fetchMonthlySummary, totalPages, totalElements } = useExpenses();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleAddExpense = async (expense: any) => {
    try {
      await addExpense(expense);
      fetchExpenses(undefined, undefined, undefined, currentPage, pageSize); // Refresh list after adding
    } catch (err) {
      // Error handled in hook, can add more specific UI feedback here if needed
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
      fetchExpenses(undefined, undefined, undefined, currentPage, pageSize); // Refresh list after deleting
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleFilterExpenses = (category?: ExpenseCategory, startDate?: string, endDate?: string) => {
    setCurrentPage(0); // Reset to first page on filter change
    fetchExpenses(category, startDate, endDate, 0, pageSize);
    // Also update monthly summary based on the filtered date range
    if (startDate && endDate) {
      fetchMonthlySummary(startDate, endDate);
    } else {
      // If no date filter, fetch for current month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      fetchMonthlySummary(firstDayOfMonth, lastDayOfMonth);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0); // Reset to first page when page size changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="container mx-auto bg-white rounded-xl shadow-lg p-6 my-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Personal Expense Tracker</h1>

        {loading && <p className="text-center text-blue-600 font-semibold">Loading data...</p>}
        {error && <p className="text-center text-red-600 font-semibold">Error: {error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ExpenseForm onSubmit={handleAddExpense} isLoading={loading} />
          </div>
          <div className="lg:col-span-1">
            <ExpenseSummary monthlySummary={monthlySummary} />
          </div>
        </div>

        <FilterControls onFilter={handleFilterExpenses} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
          <div className="flex justify-between items-center mt-4">
            <div>
              Page {currentPage + 1} of {totalPages} (Total: {totalElements} items)
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-gray-700">Items per page:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
          </div>
          <div className="lg:col-span-1">
            <CategoryChart categorySummary={categorySummary} />
          </div>
        </div>

        {/* New Spline Area Chart for Monthly Trend */}
        <MonthlySplineChart monthlySummary={monthlySummary} />

      </div>
    </div>
  );
}

export default App;