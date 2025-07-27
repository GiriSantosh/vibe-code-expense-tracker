import React, { useState } from 'react';
import { Expense } from '../types/Expense';
import { ExpenseCategory } from '../types/ExpenseCategory';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  isLoading: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, isLoading }) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FOOD);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      date,
    });

    // Clear form after submission
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Expense</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-gray-700 text-sm font-semibold mb-2">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            step="0.01"
            placeholder="e.g., 49.99"
          />
          {errors.amount && <p className="text-red-500 text-xs italic mt-1">{errors.amount}</p>}
        </div>
        <div>
          <label htmlFor="category" className="block text-gray-700 text-sm font-semibold mb-2">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          >
            {Object.values(ExpenseCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            placeholder="e.g., Monthly Netflix subscription"
          />
          {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="date" className="block text-gray-700 text-sm font-semibold mb-2">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          />
          {errors.date && <p className="text-red-500 text-xs italic mt-1">{errors.date}</p>}
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Adding Expense...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;
