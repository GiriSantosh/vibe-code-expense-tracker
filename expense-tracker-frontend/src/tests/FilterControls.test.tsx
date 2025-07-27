import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterControls from '../components/FilterControls';
import { ExpenseCategory } from '../types/ExpenseCategory';

describe('FilterControls', () => {
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    mockOnFilter.mockClear();
  });

  it('renders correctly with all filter options', () => {
    render(<FilterControls onFilter={mockOnFilter} />);

    expect(screen.getByLabelText(/Category:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quick Range:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply Filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear Filter/i })).toBeInTheDocument();
  });

  it('calls onFilter with correct values when Apply Filter is clicked', async () => {
    render(<FilterControls onFilter={mockOnFilter} />);

    const categorySelect = screen.getByRole('combobox', { name: /Category:/i });
    const startDateInput = screen.getByLabelText(/Start Date:/i);
    const endDateInput = screen.getByLabelText(/End Date:/i);
    const applyButton = screen.getByRole('button', { name: /Apply Filter/i });

    fireEvent.change(categorySelect, { target: { value: ExpenseCategory.SHOPPING } });
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-01-31' } });

    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledTimes(1);
      expect(mockOnFilter).toHaveBeenCalledWith(ExpenseCategory.SHOPPING, '2023-01-01', '2023-01-31');
    });
  });

  it('calls onFilter with undefined values when Clear Filter is clicked', async () => {
    render(<FilterControls onFilter={mockOnFilter} />);

    const categorySelect = screen.getByRole('combobox', { name: /Category:/i });
    const quickRangeSelect = screen.getByRole('combobox', { name: /Quick Range:/i });
    const startDateInput = screen.getByLabelText(/Start Date:/i);
    const endDateInput = screen.getByLabelText(/End Date:/i);
    const clearButton = screen.getByRole('button', { name: /Clear Filter/i });

    // Set some values first
    fireEvent.change(categorySelect, { target: { value: ExpenseCategory.SHOPPING } });
    fireEvent.change(quickRangeSelect, { target: { value: '7days' } });
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-01-31' } });

    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledTimes(1);
      expect(mockOnFilter).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    // Verify fields are cleared
    expect((categorySelect as HTMLSelectElement).value).toBe('');
    expect((quickRangeSelect as HTMLSelectElement).value).toBe('');
    expect((startDateInput as HTMLInputElement).value).toBe('');
    expect((endDateInput as HTMLInputElement).value).toBe('');
  });

  it('calls onFilter with only category when only category is selected', async () => {
    render(<FilterControls onFilter={mockOnFilter} />);

    const categorySelect = screen.getByRole('combobox', { name: /Category:/i });
    const applyButton = screen.getByRole('button', { name: /Apply Filter/i });

    fireEvent.change(categorySelect, { target: { value: ExpenseCategory.BILLS } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledTimes(1);
      expect(mockOnFilter).toHaveBeenCalledWith(ExpenseCategory.BILLS, undefined, undefined);
    });
  });

  it('calls onFilter with only date range when only date range is selected', async () => {
    render(<FilterControls onFilter={mockOnFilter} />);

    const startDateInput = screen.getByLabelText(/Start Date:/i);
    const endDateInput = screen.getByLabelText(/End Date:/i);
    const applyButton = screen.getByRole('button', { name: /Apply Filter/i });

    fireEvent.change(startDateInput, { target: { value: '2023-05-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-05-31' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledTimes(1);
      expect(mockOnFilter).toHaveBeenCalledWith(undefined, '2023-05-01', '2023-05-31');
    });
  });

  it('calls onFilter with calculated dates for quick range selection', async () => {
    render(<FilterControls onFilter={mockOnFilter} />);

    const quickRangeSelect = screen.getByRole('combobox', { name: /Quick Range:/i });
    const applyButton = screen.getByRole('button', { name: /Apply Filter/i });

    // Mock Date to control the current date for consistent test results
    const mockDate = new Date('2023-07-27T10:00:00.000Z');
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    fireEvent.change(quickRangeSelect, { target: { value: '7days' } });
    userEvent.click(applyButton);

    const expectedStartDate7Days = new Date(mockDate);
    expectedStartDate7Days.setDate(mockDate.getDate() - 7);

    expect(mockOnFilter).toHaveBeenCalledWith(
      undefined,
      expectedStartDate7Days.toISOString().split('T')[0],
      mockDate.toISOString().split('T')[0]
    );

    spy.mockRestore();
  });
});