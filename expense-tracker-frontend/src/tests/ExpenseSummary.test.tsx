import React from 'react';
import { render, screen } from '@testing-library/react';
import ExpenseSummary from '../components/ExpenseSummary';

describe('ExpenseSummary', () => {
  it('renders monthly summary correctly', () => {
    const mockMonthlySummary = [
      { year: 2023, month: 1, total: 150.00 },
      { year: 2023, month: 2, total: 200.50 },
    ];

    render(<ExpenseSummary monthlySummary={mockMonthlySummary} />);

    expect(screen.getByText(/Monthly Summary/i)).toBeInTheDocument();
    expect(screen.getByText('2023-01')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('2023-02')).toBeInTheDocument();
    expect(screen.getByText('$200.50')).toBeInTheDocument();
  });

  it('displays a message when no monthly summary is available', () => {
    render(<ExpenseSummary monthlySummary={[]} />);

    expect(screen.getByText(/No monthly summary available./i)).toBeInTheDocument();
  });
});
