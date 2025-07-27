import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseCategory } from '../types/ExpenseCategory';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useExpenses', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.delete.mockClear();
  });

  it('fetches expenses on mount', async () => {
    const mockExpenses = [
      { id: 1, amount: 10, category: ExpenseCategory.FOOD, description: 'Lunch', date: '2023-01-01' },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: mockExpenses });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // for monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // for category summary

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.expenses).toEqual(mockExpenses);
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/expenses', {
      params: {},
    });
  });

  it('adds an expense', async () => {
    const newExpense = { amount: 20, category: ExpenseCategory.TRANSPORTATION, description: 'Bus', date: '2023-01-02' };
    const addedExpense = { id: 2, ...newExpense };
    mockedAxios.post.mockResolvedValueOnce({ data: addedExpense });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // initial fetch
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // category summary

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addExpense(newExpense);
    });

    await waitFor(() => {
      expect(result.current.expenses).toContainEqual(addedExpense);
    });
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/api/expenses', newExpense);
  });

  it('deletes an expense', async () => {
    const initialExpenses = [
      { id: 1, amount: 10, category: ExpenseCategory.FOOD, description: 'Lunch', date: '2023-01-01' },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: initialExpenses }); // initial fetch
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // category summary
    mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteExpense(1);
    });

    await waitFor(() => {
      expect(result.current.expenses).not.toContainEqual(initialExpenses[0]);
    });
    expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8080/api/expenses/1');
  });

  it('fetches monthly summary', async () => {
    const mockMonthlySummary = [
      { year: 2023, month: 1, total: 100 },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // initial expenses
    mockedAxios.get.mockResolvedValueOnce({ data: mockMonthlySummary });
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // category summary

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.monthlySummary).toEqual(mockMonthlySummary);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/expenses/summary',
      expect.objectContaining({ params: { startDate: expect.any(String), endDate: expect.any(String) } })
    );
  });

  it('fetches category summary', async () => {
    const mockCategorySummary = [
      { category: ExpenseCategory.FOOD, total: 150 },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // initial expenses
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: mockCategorySummary });

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categorySummary).toEqual(mockCategorySummary);
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/expenses/category-summary');
  });

  it('handles fetch expenses error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // category summary

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to fetch expenses.');
  });

  it('handles add expense error', async () => {
    const newExpense = { amount: 20, category: ExpenseCategory.TRANSPORTATION, description: 'Bus', date: '2023-01-02' };
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // initial fetch
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // category summary

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.addExpense(newExpense)).rejects.toThrow();
    });
    expect(result.current.error).toBe('Failed to add expense.');
  });

  it('handles delete expense error', async () => {
    const initialExpenses = [
      { id: 1, amount: 10, category: ExpenseCategory.FOOD, description: 'Lunch', date: '2023-01-01' },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: initialExpenses }); // initial fetch
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // monthly summary
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // category summary
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.deleteExpense(1)).rejects.toThrow();
    });
    expect(result.current.error).toBe('Failed to delete expense.');
  });
});
