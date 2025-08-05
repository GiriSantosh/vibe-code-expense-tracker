import React from 'react';
import { Expense } from '../types/Expense';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: number) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onDelete }) => {
  const handleDelete = () => {
    if (expense.id) {
      onDelete(expense.id);
    }
  };

  return (
    <tr className="bg-white border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {expense.date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {expense.description}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {expense.category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
        ${expense.amount ? expense.amount.toFixed(2) : '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 font-semibold py-1 px-3 rounded-md border border-red-600 hover:border-red-800 transition duration-150 ease-in-out"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ExpenseItem;
