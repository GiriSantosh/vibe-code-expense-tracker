import React from 'react';
import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import CategoryChart from './components/CategoryChart';
import FilterControls from './components/FilterControls';
import MonthlySplineChart from './components/MonthlySplineChart'; // New import
import { ExpenseCategory } from './types/ExpenseCategory';

function App() {
  const { expenses, monthlySummary, categorySummary, loading, error, fetchExpenses, addExpense, deleteExpense, fetchMonthlySummary } = useExpenses();

  const handleAddExpense = async (expense: any) => {
    try {
      await addExpense(expense);
      fetchExpenses(); // Refresh list after adding
    } catch (err) {
      // Error handled in hook, can add more specific UI feedback here if needed
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleFilterExpenses = (category?: ExpenseCategory, startDate?: string, endDate?: string) => {
    fetchExpenses(category, startDate, endDate);
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