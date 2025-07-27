import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryChart from '../components/CategoryChart';
import { ExpenseCategory } from '@/types/ExpenseCategory';

// Mock Recharts components to avoid actual chart rendering issues in tests
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
}));

describe('CategoryChart', () => {
  it('renders category chart with data', () => {
    const mockCategorySummary = [
      { category: ExpenseCategory.FOOD, total: 150.00 },
      { category: ExpenseCategory.TRANSPORTATION, total: 75.00 },
    ];

    render(<CategoryChart categorySummary={mockCategorySummary} />);

    expect(screen.getByText(/Category Breakdown/i)).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(2);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('displays a message when no category data is available', () => {
    render(<CategoryChart categorySummary={[]} />);

    expect(screen.getByText(/No category data available./i)).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });
});
