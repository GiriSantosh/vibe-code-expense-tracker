import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Expense } from '../types/Expense';
import { ExpenseCategory } from '../types/ExpenseCategory';
import { User } from '../types/User';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add any additional headers or authentication logic here
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Don't auto-redirect on 401 for auth status checks - let PrivateRoute handle it
        const isAuthCheck = error.config?.url?.includes('/api/me');
        if (error.response?.status === 401 && !isAuthCheck) {
          // Only redirect to login for non-auth-check API calls
          window.location.href = `${API_BASE_URL}/oauth2/authorization/keycloak`;
        }
        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/api/me');
    return response.data;
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put('/api/me', userData);
    return response.data;
  }

  async getUserPreferences(): Promise<User['preferences']> {
    const response = await this.api.get('/api/me/preferences');
    return response.data;
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<User['preferences']> {
    const response = await this.api.put('/api/me/preferences', preferences);
    return response.data;
  }

  // Expense endpoints
  async getAllExpenses(params?: {
    page?: number;
    size?: number;
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
  }): Promise<{ content: Expense[]; totalElements: number; totalPages: number }> {
    const response = await this.api.get('/api/expenses', { params });
    console.log('API Response:', response.data);
    console.log('Response keys:', Object.keys(response.data || {}));
    console.log('Content:', response.data?.content);
    console.log('Content length:', response.data?.content?.length);
    return response.data;
  }

  async getExpenseById(id: number): Promise<Expense> {
    const response = await this.api.get(`/api/expenses/${id}`);
    return response.data;
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const response = await this.api.post('/api/expenses', expense);
    return response.data;
  }

  async deleteExpense(id: number): Promise<void> {
    await this.api.delete(`/api/expenses/${id}`);
  }

  async getMonthlySummary(startDate: string, endDate: string): Promise<any[]> {
    const response = await this.api.get('/api/expenses/summary', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getCategorySummary(): Promise<any[]> {
    const response = await this.api.get('/api/expenses/category-summary');
    return response.data;
  }

  // Authentication endpoints
  async logout(): Promise<void> {
    await this.api.post('/logout');
  }

  // Utility method to mask email for privacy
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 1 
      ? username[0] + '*'.repeat(Math.max(username.length - 2, 0)) + (username.length > 1 ? username[username.length - 1] : '')
      : username;
    
    const [domainName, tld] = domain.split('.');
    const maskedDomain = domainName.length > 1
      ? domainName[0] + '*'.repeat(Math.max(domainName.length - 2, 0)) + (domainName.length > 1 ? domainName[domainName.length - 1] : '')
      : domainName;
    
    return `${maskedUsername}@${maskedDomain}.${tld}`;
  }
}

export const apiService = new ApiService();