import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute';

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

describe('PrivateRoute', () => {
  const renderPrivateRoute = (initialEntries = ['/protected']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    renderPrivateRoute();
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders login prompt when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    renderPrivateRoute();
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText('Please sign in to access your expense data')).toBeInTheDocument();
    expect(screen.getByText('Sign in with OAuth2')).toBeInTheDocument();
  });

  it('shows loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
    });

    renderPrivateRoute();
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Check for loading spinner instead of text
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });
});