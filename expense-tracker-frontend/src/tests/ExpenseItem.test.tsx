import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseItem from '../components/ExpenseItem';
import { ExpenseCategory } from '../types/ExpenseCategory';

describe('ExpenseItem', () => {
  const mockExpense = {
    id: 1,
    amount: 50.00,
    category: ExpenseCategory.FOOD,
    description: 'Groceries',
    date: '2023-07-20',
    createdAt: '2023-07-20T10:00:00',
  };

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it('renders expense details correctly', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem expense={mockExpense} onDelete={mockOnDelete} />
        </tbody>
      </table>
    );

    expect(screen.getByText('2023-07-20')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('FOOD')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });

  it('calls onDelete with expense id when delete button is clicked', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem expense={mockExpense} onDelete={mockOnDelete} />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockExpense.id);
  });

  it('does not call onDelete if expense id is undefined', () => {
    const expenseWithoutId = { ...mockExpense, id: undefined };
    render(
      <table>
        <tbody>
          <ExpenseItem expense={expenseWithoutId} onDelete={mockOnDelete} />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});