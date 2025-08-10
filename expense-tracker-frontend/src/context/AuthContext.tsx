import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/User';
import { apiService } from '../services/apiService';

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
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};