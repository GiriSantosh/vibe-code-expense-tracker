import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  })
}));

// Mock all child components to avoid complex dependencies
jest.mock('../components/Navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>
}));

jest.mock('../components/PrivateRoute', () => ({
  PrivateRoute: ({ children }: any) => <div data-testid="private-route">{children}</div>
}));

jest.mock('../components/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>
}));

jest.mock('../components/ExpenseManagement', () => ({
  ExpenseManagement: () => <div data-testid="expense-management">Expense Management</div>
}));

jest.mock('../components/UserProfile', () => ({
  UserProfile: () => <div data-testid="user-profile">User Profile</div>
}));

describe('App', () => {
  const renderApp = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    );
  };

  it('renders AuthProvider wrapper', () => {
    renderApp();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('renders Navigation component', () => {
    renderApp();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('renders Dashboard on root route', () => {
    renderApp(['/']);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('renders ExpenseManagement on expenses route', () => {
    renderApp(['/expenses']);
    expect(screen.getByTestId('expense-management')).toBeInTheDocument();
  });

  it('renders UserProfile on profile route', () => {
    renderApp(['/profile']);
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  it('redirects to root from unknown route', () => {
    renderApp(['/unknown-route']);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});