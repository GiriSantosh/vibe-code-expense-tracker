import React from 'react';
import { useNavigate } from 'react-router-dom';
import ExpenseSummary from './ExpenseSummary';
import CategoryChart from './CategoryChart';
import ExpenseList from './ExpenseList';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../hooks/useExpenses';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    expenses, 
    monthlySummary, 
    categorySummary, 
    loading, 
    error,
    deleteExpense,
    totalElements 
  } = useExpenses();

  // Get recent expenses (first 5)
  const recentExpenses = expenses.slice(0, 5);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigate('/expenses');
        break;
      case 'view':
        navigate('/expenses');
        break;
      case 'export':
        // TODO: Implement export functionality
        alert('Export functionality coming soon!');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || user?.username || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your expense overview for this month
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <ExpenseSummary monthlySummary={monthlySummary} />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h2>
          <CategoryChart categorySummary={categorySummary} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => handleQuickAction('add')}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Add New Expense</div>
                  <div className="text-sm text-gray-500">Record a new expense</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('view')}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">View All Expenses</div>
                  <div className="text-sm text-gray-500">See your complete expense history ({totalElements} total)</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('export')}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Export Data</div>
                  <div className="text-sm text-gray-500">Download your expense report</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>
        <ExpenseList expenses={recentExpenses} onDelete={deleteExpense} />
      </div>
    </div>
  );
};