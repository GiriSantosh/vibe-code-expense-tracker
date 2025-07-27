import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from '../components/ExpenseForm';
import { ExpenseCategory } from '@/types/ExpenseCategory';

describe('ExpenseForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly with all fields', () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/Amount:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Expense/i })).toBeInTheDocument();
  });

  it('updates input values correctly', () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={false} />);

    const amountInput = screen.getByLabelText(/Amount:/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description:/i) as HTMLInputElement;
    const categorySelect = screen.getByLabelText(/Category:/i) as HTMLSelectElement;
    const dateInput = screen.getByLabelText(/Date:/i) as HTMLInputElement;

    fireEvent.change(amountInput, { target: { value: '123.45' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(categorySelect, { target: { value: ExpenseCategory.HEALTHCARE } });
    fireEvent.change(dateInput, { target: { value: '2023-01-15' } });

    expect(amountInput.value).toBe('123.45');
    expect(descriptionInput.value).toBe('Test Description');
    expect(categorySelect.value).toBe(ExpenseCategory.HEALTHCARE);
    expect(dateInput.value).toBe('2023-01-15');
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={false} />);

    const amountInput = screen.getByLabelText(/Amount:/i);
    const descriptionInput = screen.getByLabelText(/Description:/i);
    const categorySelect = screen.getByLabelText(/Category:/i);
    const dateInput = screen.getByLabelText(/Date:/i);
    const submitButton = screen.getByRole('button', { name: /Add Expense/i });

    fireEvent.change(amountInput, { target: { value: '50.00' } });
    fireEvent.change(descriptionInput, { target: { value: 'Groceries' } });
    fireEvent.change(categorySelect, { target: { value: ExpenseCategory.FOOD } });
    fireEvent.change(dateInput, { target: { value: '2023-03-10' } });

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 50.00,
        category: ExpenseCategory.FOOD,
        description: 'Groceries',
        date: '2023-03-10',
      });
    });
  });

  it('shows validation errors for empty description', async () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={false} />);

    const amountInput = screen.getByLabelText(/Amount:/i);
    const submitButton = screen.getByRole('button', { name: /Add Expense/i });

    fireEvent.change(amountInput, { target: { value: '10.00' } });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation errors for invalid amount', async () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={false} />);

    const descriptionInput = screen.getByLabelText(/Description:/i);
    const submitButton = screen.getByRole('button', { name: /Add Expense/i });

    fireEvent.change(descriptionInput, { target: { value: 'Valid Description' } });
    fireEvent.change(screen.getByLabelText(/Amount:/i), { target: { value: '-5' } });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Amount must be a positive number/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears form fields after successful submission', async () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={false} />);

    const amountInput = screen.getByLabelText(/Amount:/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description:/i) as HTMLInputElement;
    const dateInput = screen.getByLabelText(/Date:/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Add Expense/i });

    fireEvent.change(amountInput, { target: { value: '25.00' } });
    fireEvent.change(descriptionInput, { target: { value: 'Books' } });
    fireEvent.change(dateInput, { target: { value: '2023-04-01' } });

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(amountInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
    // Date input might reset to today's date, so check if it's not the old value
    expect(dateInput.value).not.toBe('2023-04-01');
  });

  it('disables submit button when isLoading is true', () => {
    render(<ExpenseForm onSubmit={mockOnSubmit} isLoading={true} />);
    const submitButton = screen.getByRole('button', { name: /Adding.../i });
    expect(submitButton).toBeDisabled();
  });
});
