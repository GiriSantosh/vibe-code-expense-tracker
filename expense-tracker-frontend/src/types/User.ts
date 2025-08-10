import { ExpenseCategory } from './ExpenseCategory';

export interface User {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency?: string;
  dateFormat?: string;
  defaultCategory?: ExpenseCategory;
  enableNotifications?: boolean;
  theme?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  nuclearLogout: () => void;
  customLogin: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  customSignup: (signupData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}