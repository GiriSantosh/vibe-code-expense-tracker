import React, { useState, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseSummary from './ExpenseSummary';
import CategoryChart from './CategoryChart';
import FilterControls from './FilterControls';
import MonthlySplineChart from './MonthlySplineChart';
import { ExpenseCategory } from '../types/ExpenseCategory';

export const ExpenseManagement: React.FC = () => {
  const { 
    expenses, 
    monthlySummary, 
    categorySummary, 
    loading, 
    error, 
    fetchExpenses, 
    addExpense, 
    deleteExpense, 
    fetchMonthlySummary, 
    totalPages, 
    totalElements 
  } = useExpenses();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleAddExpense = async (expense: any) => {
    try {
      await addExpense(expense);
      fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
      fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleFilterExpenses = (category?: ExpenseCategory, startDate?: string, endDate?: string) => {
    setCurrentPage(0);
    fetchExpenses(category, startDate, endDate, 0, pageSize);
    fetchMonthlySummary(startDate, endDate);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
        <p className="text-gray-600 mt-2">
          Track, categorize, and analyze your personal expenses
        </p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-blue-600 font-semibold mt-4">Loading data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Add Expense Form and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Expense</h2>
            <ExpenseForm onSubmit={handleAddExpense} isLoading={loading} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h2>
            <ExpenseSummary monthlySummary={monthlySummary} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Expenses</h2>
        <FilterControls onFilter={handleFilterExpenses} />
      </div>

      {/* Expense List and Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Expense List</h2>
            </div>
            <div className="p-6">
              <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
            </div>
            
            {/* Pagination */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-gray-700 font-medium">
                  Page {currentPage + 1} of {totalPages} (Total: {totalElements} items)
                </div>
                <div className="flex items-center space-x-3">
                  <label htmlFor="pageSize" className="text-gray-700">Items per page:</label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
            <CategoryChart categorySummary={categorySummary} />
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
        <MonthlySplineChart monthlySummary={monthlySummary} />
      </div>
    </div>
  );
};