import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseCategory } from '@/types/ExpenseCategory';

// Mock the useExpenses hook
jest.mock('../hooks/useExpenses', () => ({
  useExpenses: jest.fn(),
}));

const mockUseExpenses = useExpenses as jest.Mock;

describe('App', () => {
  const mockExpenses = [
    { id: 1, amount: 50, category: ExpenseCategory.FOOD, description: 'Lunch', date: '2023-07-20' },
    { id: 2, amount: 30, category: ExpenseCategory.TRANSPORTATION, description: 'Bus', date: '2023-07-19' },
  ];

  const mockMonthlySummary = [
    { year: 2023, month: 7, total: 80 },
  ];

  const mockCategorySummary = [
    { category: ExpenseCategory.FOOD, total: 50 },
    { category: ExpenseCategory.TRANSPORTATION, total: 30 },
  ];

  const mockAddExpense = jest.fn();
  const mockDeleteExpense = jest.fn();
  const mockFetchExpenses = jest.fn();
  const mockFetchMonthlySummary = jest.fn();
  const mockFetchCategorySummary = jest.fn();

  beforeEach(() => {
    mockUseExpenses.mockReturnValue({
      expenses: mockExpenses,
      monthlySummary: mockMonthlySummary,
      categorySummary: mockCategorySummary,
      loading: false,
      error: null,
      fetchExpenses: mockFetchExpenses,
      addExpense: mockAddExpense,
      deleteExpense: mockDeleteExpense,
      fetchMonthlySummary: mockFetchMonthlySummary,
      fetchCategorySummary: mockFetchCategorySummary,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main application title', () => {
    render(<App />);
    expect(screen.getByText(/Personal Expense Tracker/i)).toBeInTheDocument();
  });

  it('renders ExpenseForm, ExpenseList, ExpenseSummary, CategoryChart, and FilterControls', () => {
    render(<App />);
    expect(screen.getByText(/Add New Expense/i)).toBeInTheDocument();
    expect(screen.getByText(/Expense List/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Category Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Filter Expenses/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseExpenses.mockReturnValueOnce({
      expenses: [],
      monthlySummary: [],
      categorySummary: [],
      loading: true,
      error: null,
      fetchExpenses: mockFetchExpenses,
      addExpense: mockAddExpense,
      deleteExpense: mockDeleteExpense,
      fetchMonthlySummary: mockFetchMonthlySummary,
      fetchCategorySummary: mockFetchCategorySummary,
    });
    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    mockUseExpenses.mockReturnValueOnce({
      expenses: [],
      monthlySummary: [],
      categorySummary: [],
      loading: false,
      error: 'Failed to fetch data',
      fetchExpenses: mockFetchExpenses,
      addExpense: mockAddExpense,
      deleteExpense: mockDeleteExpense,
      fetchMonthlySummary: mockFetchMonthlySummary,
      fetchCategorySummary: mockFetchCategorySummary,
    });
    render(<App />);
    expect(screen.getByText(/Error: Failed to fetch data/i)).toBeInTheDocument();
  });

  it('calls addExpense and fetchExpenses on form submission', async () => {
    render(<App />);

    const amountInput = screen.getByLabelText(/Amount:/i);
    const descriptionInput = screen.getByLabelText(/Description:/i);
    const categorySelect = screen.getByLabelText(/Category:/i, { selector: 'select#filterCategory' });
    const dateInput = screen.getByLabelText(/Date:/i);
    const submitButton = screen.getByRole('button', { name: /Add Expense/i });

    userEvent.type(amountInput, '100');
    userEvent.type(descriptionInput, 'New Book');
    userEvent.selectOptions(categorySelect, ExpenseCategory.SHOPPING);
    userEvent.type(dateInput, '2023-07-25');

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddExpense).toHaveBeenCalledTimes(1);
      expect(mockAddExpense).toHaveBeenCalledWith({
        amount: 100,
        category: ExpenseCategory.SHOPPING,
        description: 'New Book',
        date: '2023-07-25',
      });
      expect(mockFetchExpenses).toHaveBeenCalledTimes(1); // Called after add
    });
  });

  it('calls deleteExpense on ExpenseItem delete button click', async () => {
    render(<App />);

    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalledTimes(1);
      expect(mockDeleteExpense).toHaveBeenCalledWith(mockExpenses[0].id);
    });
  });

  it('calls fetchExpenses with filters when Apply Filter is clicked', async () => {
    render(<App />);

    const categorySelect = screen.getByLabelText(/Category:/i, { selector: 'select#filterCategory' });
    const startDateInput = screen.getByLabelText(/Start Date:/i);
    const endDateInput = screen.getByLabelText(/End Date:/i);
    const applyButton = screen.getByRole('button', { name: /Apply Filter/i });

    userEvent.selectOptions(categorySelect, ExpenseCategory.FOOD);
    userEvent.type(startDateInput, '2023-07-01');
    userEvent.type(endDateInput, '2023-07-31');

    userEvent.click(applyButton);

    await waitFor(() => {
      expect(mockFetchExpenses).toHaveBeenCalledWith(ExpenseCategory.FOOD, '2023-07-01', '2023-07-31');
    });
  });

  it('calls fetchExpenses with no filters when Clear Filter is clicked', async () => {
    render(<App />);

    const clearButton = screen.getByRole('button', { name: /Clear Filter/i });
    userEvent.click(clearButton);

    await waitFor(() => {
      expect(mockFetchExpenses).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });
});
