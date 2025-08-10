import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/User';
import { apiService } from '../services/apiService';
import axios from 'axios';

// Token storage utilities
const TOKEN_STORAGE_KEY = 'expense_tracker_token';
const USER_STORAGE_KEY = 'expense_tracker_user';

const tokenStorage = {
  getToken: () => sessionStorage.getItem(TOKEN_STORAGE_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_STORAGE_KEY, token),
  removeToken: () => sessionStorage.removeItem(TOKEN_STORAGE_KEY),
  getUser: () => {
    const userData = sessionStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user: User) => sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)),
  removeUser: () => sessionStorage.removeItem(USER_STORAGE_KEY),
  clearAll: () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Initialize from stored token and user data
    const storedUser = tokenStorage.getUser();
    const storedToken = tokenStorage.getToken();
    
    if (storedUser && storedToken) {
      setUser(storedUser);
      // Verify token is still valid
      verifyStoredToken();
    } else {
      setIsLoading(false);
    }

    // Listen for token expiration events from axios interceptor
    const handleTokenExpired = () => {
      console.log('Token expired event received - logging out user');
      handleLogoutCleanup();
    };

    window.addEventListener('token-expired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, []);

  const verifyStoredToken = async () => {
    try {
      setIsLoading(true);
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      tokenStorage.setUser(userData);
    } catch (error) {
      // Token invalid or expired, clear storage
      console.log('Stored token invalid, clearing storage');
      handleLogoutCleanup();
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    await verifyStoredToken();
  };

  const login = () => {
    if (isLoggingIn) return; // Prevent double-clicks
    
    setIsLoggingIn(true);
    // Redirect to OAuth2 login endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/keycloak`;
  };

  const handleLogoutCleanup = () => {
    setUser(null);
    tokenStorage.clearAll();
    localStorage.clear();
  };

  const logout = () => {
    handleLogoutCleanup();
    
    // In stateless mode, just clear local storage and redirect to login
    // No need for server-side session cleanup
    window.location.href = '/login';
  };
  
  // Nuclear logout for testing (fallback) - still useful for Remember Me cookie cleanup
  const nuclearLogout = () => {
    handleLogoutCleanup();
    
    // Use the nuclear logout endpoint for complete cleanup including refresh token cookies
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/auth/nuclear-logout`;
  };

  // Custom authentication methods for Material-UI login - Stateless with Bearer tokens
  const customLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`, {
        email,
        password,
        rememberMe
      }, {
        withCredentials: rememberMe // Only send cookies if remember me is enabled (for refresh tokens)
      });

      if (response.data.success && response.data.user && response.data.accessToken) {
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          displayName: response.data.user.displayName
        };
        
        // Store access token and user data
        tokenStorage.setToken(response.data.accessToken);
        tokenStorage.setUser(userData);
        setUser(userData);
        
        console.log('Login successful - token stored');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const customSignup = async (signupData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/auth/signup`, 
        signupData
      );

      if (response.data.success && response.data.user && response.data.accessToken) {
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          displayName: response.data.user.displayName
        };
        
        // Store access token and user data (same as login)
        tokenStorage.setToken(response.data.accessToken);
        tokenStorage.setUser(userData);
        setUser(userData);
        
        console.log('Signup successful - token stored');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    nuclearLogout,
    customLogin,
    customSignup,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};