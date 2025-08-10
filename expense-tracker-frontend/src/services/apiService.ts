import { AxiosRequestConfig } from 'axios';
import { Expense } from '../types/Expense';
import { ExpenseCategory } from '../types/ExpenseCategory';
import { User } from '../types/User';
import apiClient from './axiosConfig';

class ApiService {
  constructor() {
    // Use the pre-configured axios client with Bearer token interceptors
  }

  private handleError(error: any) {
    // Centralized error handling
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/api/me');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put('/api/me', userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<User['preferences']> {
    try {
      const response = await apiClient.get('/api/me/preferences');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<User['preferences']> {
    try {
      const response = await apiClient.put('/api/me/preferences', preferences);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Expense endpoints
  async getAllExpenses(params?: {
    page?: number;
    size?: number;
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
  }): Promise<{ content: Expense[]; totalElements: number; totalPages: number }> {
    try {
      const response = await apiClient.get('/api/expenses', { 
        params: params || {} 
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getExpenseById(id: number): Promise<Expense> {
    try {
      const response = await apiClient.get(`/api/expenses/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const response = await apiClient.post('/api/expenses', expenseData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateExpense(id: number, expenseData: Partial<Expense>): Promise<Expense> {
    try {
      const response = await apiClient.put(`/api/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/expenses/${id}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Analytics endpoints
  async getMonthlySummary(startDate?: string, endDate?: string): Promise<Array<{
    year: number;
    month: number;
    total: number;
  }>> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await apiClient.get('/api/expenses/summary', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getCategorySummary(): Promise<Array<{
    category: string;
    totalAmount: number;
    percentage: number;
  }>> {
    try {
      const response = await apiClient.get('/api/expenses/category-summary');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getRecentExpenses(limit: number = 5): Promise<Expense[]> {
    try {
      const response = await apiClient.get('/api/expenses/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getTotalExpenses(): Promise<{ total: number; count: number }> {
    try {
      const response = await apiClient.get('/api/expenses/total');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Utility method for email masking
  maskEmail(email: string): string {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(0, username.length - 2)) + username.charAt(username.length - 1);
    const maskedDomain = '*'.repeat(domain.length - 4) + domain.slice(-4);
    return `${maskedUsername}@${maskedDomain}`;
  }

  // Generic request method for custom API calls
  async makeRequest(config: AxiosRequestConfig) {
    try {
      const response = await apiClient(config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();