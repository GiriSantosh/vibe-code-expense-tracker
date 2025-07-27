import React, { useState, useEffect } from 'react';
import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import CategoryChart from './components/CategoryChart';
import FilterControls from './components/FilterControls';
import MonthlySplineChart from './components/MonthlySplineChart';
import { ExpenseCategory } from './types/ExpenseCategory';

function App() {
  const { expenses, monthlySummary, categorySummary, loading, error, fetchExpenses, addExpense, deleteExpense, fetchMonthlySummary, totalPages, totalElements } = useExpenses();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

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
    fetchMonthlySummary(startDate, endDate); // Always update monthly summary based on filter
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0); // Reset to first page when page size changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 my-8 border border-gray-200">
        <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          💰 Personal Expense Tracker
        </h1>

        {loading && <p className="text-center text-blue-600 font-semibold text-lg">Loading data...</p>}
        {error && <p className="text-center text-red-600 font-semibold text-lg">Error: {error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
            <ExpenseForm onSubmit={handleAddExpense} isLoading={loading} />
          </div>
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
            <ExpenseSummary monthlySummary={monthlySummary} />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100 mb-8">
          <FilterControls onFilter={handleFilterExpenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
            <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
            <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-100">
              <div className="text-gray-700 font-medium">
                Page {currentPage + 1} of {totalPages} (Total: {totalElements} items)
              </div>
              <div className="flex items-center space-x-3">
                <label htmlFor="pageSize" className="text-gray-700">Items per page:</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="shadow-sm border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
            <CategoryChart categorySummary={categorySummary} />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-100">
          <MonthlySplineChart monthlySummary={monthlySummary} />
        </div>

      </div>
    </div>
  );
}

export default App;
