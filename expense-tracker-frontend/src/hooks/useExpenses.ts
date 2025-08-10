import { useState, useEffect } from 'react';
import { Expense } from '../types/Expense';
import { ExpenseCategory } from '../types/ExpenseCategory';
import { MonthlySummary, MonthlySummaryFormatted, CategorySummary } from '../types/Analytics';
import { apiService } from '../services/apiService';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryFormatted[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchExpenses = async (category?: ExpenseCategory, startDate?: string, endDate?: string, page: number = 0, size: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, size };
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.getAllExpenses(params);
      console.log('useExpenses - API response:', response);
      console.log('useExpenses - Setting expenses to:', response.content || []);
      setExpenses(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Failed to fetch expenses.');
      setExpenses([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newExpense = await apiService.createExpense(expense);
      setExpenses((prev) => [...(prev || []), newExpense]);
      return newExpense;
    } catch (err) {
      setError('Failed to add expense.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteExpense(id);
      setExpenses((prev) => (prev || []).filter((exp) => exp.id !== id));
    } catch (err) {
      setError('Failed to delete expense.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Default to last 12 months if no dates provided
      const today = new Date();
      const defaultEndDate = today.toISOString().split('T')[0];
      const defaultStartDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      
      const summary = await apiService.getMonthlySummary(
        startDate || defaultStartDate,
        endDate || defaultEndDate
      );
      console.log('Monthly Summary API Response:', summary);
      
      // Transform API response to match frontend expectations
      const formattedSummary: MonthlySummaryFormatted[] = (summary || []).map((item: MonthlySummary) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          month: `${monthNames[item.month - 1]} ${item.year}`, // Format as "Aug 2025"
          totalAmount: item.total,
          expenseCount: 0 // API doesn't return count, set to 0 for now
        };
      });
      
      setMonthlySummary(formattedSummary);
    } catch (err) {
      setError('Failed to fetch monthly summary.');
      setMonthlySummary([]);
      console.error('Monthly Summary Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await apiService.getCategorySummary();
      setCategorySummary(summary || []);
    } catch (err) {
      setError('Failed to fetch category summary.');
      setCategorySummary([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    
    // Get data for the last 6 months to show meaningful monthly summary
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const startDate = sixMonthsAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    fetchMonthlySummary(startDate, endDate);
    fetchCategorySummary();
  }, []);

  return {
    expenses,
    monthlySummary,
    categorySummary,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
    fetchMonthlySummary,
    fetchCategorySummary,
    totalPages,
    totalElements,
  };
};