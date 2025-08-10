import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/User';
import { apiService } from '../services/apiService';
import axios from 'axios';

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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    if (isLoggingIn) return; // Prevent double-clicks
    
    setIsLoggingIn(true);
    // Redirect to OAuth2 login endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/keycloak`;
  };

  const logout = () => {
    setUser(null);
    
    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Create a hidden form and submit it to properly handle Spring Security logout
    // This will follow all redirects: Backend logout -> Keycloak logout -> Frontend
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/logout`;
    form.style.display = 'none';
    
    document.body.appendChild(form);
    form.submit();
  };
  
  // Nuclear logout for testing (fallback)
  const nuclearLogout = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    
    // Use the nuclear logout endpoint for manual session clearing
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/auth/nuclear-logout`;
  };

  // Custom authentication methods for Material-UI login
  const customLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`, {
        email,
        password,
        rememberMe
      }, {
        withCredentials: true
      });

      if (response.data.success && response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          displayName: response.data.user.displayName
        };
        setUser(userData);
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
        signupData, 
        { withCredentials: true }
      );

      if (response.data.success && response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          displayName: response.data.user.displayName
        };
        setUser(userData);
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