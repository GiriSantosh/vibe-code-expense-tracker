import { useState, useEffect } from 'react';
import axios from 'axios';
import { Expense } from '../types/Expense';
import { ExpenseCategory } from '../types/ExpenseCategory';

interface MonthlySummary {
  year: number;
  month: number;
  total: number;
}

interface CategorySummary {
  category: ExpenseCategory;
  total: number;
}

const API_BASE_URL = 'http://localhost:8080/api/expenses';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
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

      const response = await axios.get<any>(API_BASE_URL, { params });
      setExpenses(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError('Failed to fetch expenses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<Expense>(API_BASE_URL, expense);
      setExpenses((prev) => [...prev, response.data]);
      return response.data;
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
      await axios.delete(`${API_BASE_URL}/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
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
      const response = await axios.get<MonthlySummary[]>(`${API_BASE_URL}/summary`, {
        params: { startDate, endDate },
      });
      setMonthlySummary(response.data);
    } catch (err) {
      setError('Failed to fetch monthly summary.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CategorySummary[]>(`${API_BASE_URL}/category-summary`);
      setCategorySummary(response.data);
    } catch (err) {
      setError('Failed to fetch category summary.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    fetchMonthlySummary(firstDayOfMonth, lastDayOfMonth);
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