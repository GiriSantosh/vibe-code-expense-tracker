import React, { useState, useEffect } from 'react';
import HealthCheck from './components/HealthCheck';

// Simple local app without authentication
const LocalApp: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/local/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.content || []);
        setError(null);
      } else {
        setError(`Backend returned ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Failed to connect to backend: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/local/health`);
      const data = await response.json();
      alert(`Backend Health: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      alert(`Backend Error: ${(err as Error).message}`);
    }
  };

  const addSampleExpense = async () => {
    try {
      const sampleExpense = {
        amount: 25.50,
        category: 'FOOD',
        description: 'Test expense from frontend',
        date: new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`${API_BASE_URL}/api/local/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleExpense)
      });

      if (response.ok) {
        alert('Expense added successfully!');
        fetchExpenses(); // Refresh the list
      } else {
        alert(`Failed to add expense: ${response.status}`);
      }
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Personal Expense Tracker - Local Mode
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HealthCheck />
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Local Development Tools</h3>
            <div className="space-y-3">
              <button 
                onClick={testBackend}
                className="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Backend Health
              </button>
              
              <button 
                onClick={fetchExpenses}
                className="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Refresh Expenses
              </button>

              <button 
                onClick={addSampleExpense}
                className="block w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Add Sample Expense
              </button>

              <a 
                href={`${API_BASE_URL}/h2-console`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-center"
              >
                Open H2 Database Console
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses</h3>
          
          {loading && <p>Loading expenses...</p>}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <div>
              <p className="text-gray-600 mb-4">
                Found {expenses?.length || 0} expenses
              </p>
              
              {(expenses?.length || 0) > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(expenses || []).map((expense: any, index: number) => (
                        <tr key={expense.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${expense.amount ? expense.amount.toFixed(2) : '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No expenses found. Click "Add Sample Expense" to create one.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Local Mode:</strong> Running without Docker. Backend: {API_BASE_URL}
          <br />
          <strong>Database:</strong> H2 Console available at {API_BASE_URL}/h2-console (JDBC URL: jdbc:h2:mem:testdb, User: sa, Password: empty)
        </div>
      </div>
    </div>
  );
};

export default LocalApp;