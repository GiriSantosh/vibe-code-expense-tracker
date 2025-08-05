import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import { ExpenseCategory } from '../types/ExpenseCategory';

// Mock useExpenses hook
const mockUseExpenses = jest.fn();
jest.mock('../hooks/useExpenses', () => ({
  useExpenses: () => mockUseExpenses()
}));

// Mock child components
jest.mock('../components/ExpenseSummary', () => ({
  ExpenseSummary: ({ expenses }: any) => (
    <div data-testid="expense-summary">
      Expense Summary - {expenses.length} expenses
    </div>
  )
}));

jest.mock('../components/CategoryChart', () => ({
  CategoryChart: ({ categorySummary }: any) => (
    <div data-testid="category-chart">
      Category Chart - {categorySummary.length} categories
    </div>
  )
}));

jest.mock('../components/MonthlySplineChart', () => ({
  MonthlySplineChart: ({ monthlySummary }: any) => (
    <div data-testid="monthly-chart">
      Monthly Chart - {monthlySummary.length} months
    </div>
  )
}));

describe('Dashboard', () => {
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

  beforeEach(() => {
    mockUseExpenses.mockReturnValue({
      expenses: mockExpenses,
      monthlySummary: mockMonthlySummary,
      categorySummary: mockCategorySummary,
      loading: false,
      error: null,
      fetchExpenses: jest.fn(),
      fetchMonthlySummary: jest.fn(),
      fetchCategorySummary: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard components when data is loaded', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('expense-summary')).toBeInTheDocument();
    expect(screen.getByTestId('category-chart')).toBeInTheDocument();
    expect(screen.getByTestId('monthly-chart')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseExpenses.mockReturnValueOnce({
      expenses: [],
      monthlySummary: [],
      categorySummary: [],
      loading: true,
      error: null,
      fetchExpenses: jest.fn(),
      fetchMonthlySummary: jest.fn(),
      fetchCategorySummary: jest.fn(),
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    mockUseExpenses.mockReturnValueOnce({
      expenses: [],
      monthlySummary: [],
      categorySummary: [],
      loading: false,
      error: 'Failed to fetch data',
      fetchExpenses: jest.fn(),
      fetchMonthlySummary: jest.fn(),
      fetchCategorySummary: jest.fn(),
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Error loading dashboard: Failed to fetch data')).toBeInTheDocument();
  });

  it('passes correct data to child components', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Expense Summary - 2 expenses')).toBeInTheDocument();
    expect(screen.getByText('Category Chart - 2 categories')).toBeInTheDocument();
    expect(screen.getByText('Monthly Chart - 1 months')).toBeInTheDocument();
  });
});