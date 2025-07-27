import React from 'react';
import { render, screen } from '@testing-library/react';
import ExpenseList from '../components/ExpenseList';
import { ExpenseCategory } from '@/types/ExpenseCategory';

describe('ExpenseList', () => {
  const mockOnDelete = jest.fn();

  const mockExpenses = [
    {
      id: 1,
      amount: 50.00,
      category: ExpenseCategory.FOOD,
      description: 'Groceries',
      date: '2023-07-20',
      createdAt: '2023-07-20T10:00:00',
    },
    {
      id: 2,
      amount: 25.50,
      category: ExpenseCategory.TRANSPORTATION,
      description: 'Bus fare',
      date: '2023-07-19',
      createdAt: '2023-07-19T15:30:00',
    },
  ];

  it('renders a list of expenses', () => {
    render(<ExpenseList expenses={mockExpenses} onDelete={mockOnDelete} />);

    expect(screen.getByText(/Expense List/i)).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Bus fare')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(mockExpenses.length + 1); // +1 for header row
  });

  it('displays a message when there are no expenses', () => {
    render(<ExpenseList expenses={[]} onDelete={mockOnDelete} />);

    expect(screen.getByText(/No expenses to display./i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
