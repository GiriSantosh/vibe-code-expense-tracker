import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryChart from '../components/CategoryChart';
import { ExpenseCategory } from '../types/ExpenseCategory';

// Mock Highcharts components to avoid actual chart rendering issues in tests
jest.mock('highcharts-react-official', () => {
  return function MockHighchartsReact() {
    return <div data-testid="highcharts-chart">Mock Highcharts Chart</div>;
  };
});

jest.mock('highcharts', () => ({
  chart: jest.fn(),
}));

jest.mock('highcharts/highcharts-more', () => ({}));
jest.mock('highcharts/modules/solid-gauge', () => ({}));

describe('CategoryChart', () => {
  it('renders category chart with data', () => {
    const mockCategorySummary = [
      { category: ExpenseCategory.FOOD, total: 150.00 },
      { category: ExpenseCategory.TRANSPORTATION, total: 75.00 },
    ];

    render(<CategoryChart categorySummary={mockCategorySummary} />);

    expect(screen.getByTestId('highcharts-chart')).toBeInTheDocument();
    expect(screen.getByText('Mock Highcharts Chart')).toBeInTheDocument();
  });

  it('displays a message when no category data is available', () => {
    render(<CategoryChart categorySummary={[]} />);

    expect(screen.getByText(/No category data available./i)).toBeInTheDocument();
    expect(screen.queryByTestId('highcharts-chart')).not.toBeInTheDocument();
  });
});
