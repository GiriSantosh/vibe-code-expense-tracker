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
    // Redirect to OAuth2 login endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/keycloak`;
  };

  const logout = () => {
    setUser(null);
    
    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Use the proper OIDC logout endpoint - Spring Security + OidcClientInitiatedLogoutSuccessHandler will handle:
    // 1. Local session invalidation
    // 2. Cookie clearing
    // 3. Redirect to Keycloak logout
    // 4. Keycloak SSO session termination
    // 5. Redirect back to frontend
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/logout`;
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