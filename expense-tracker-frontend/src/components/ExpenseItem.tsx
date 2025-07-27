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
    <tr className="border-b">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {expense.date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {expense.description}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {expense.category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${expense.amount.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ExpenseItem;