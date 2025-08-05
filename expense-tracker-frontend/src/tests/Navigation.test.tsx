import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from '../components/Navigation';

// Mock AuthContext
const mockLogout = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com' },
    isAuthenticated: true,
    logout: mockLogout,
  })
}));

describe('Navigation', () => {
  const renderNavigation = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Navigation />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation links', () => {
    renderNavigation();
    
    expect(screen.getByText('Personal Expense Tracker')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('highlights active Dashboard link', () => {
    renderNavigation(['/']);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-blue-700');
  });

  it('highlights active Expenses link', () => {
    renderNavigation(['/expenses']);
    
    const expensesLink = screen.getByText('Expenses').closest('a');
    expect(expensesLink).toHaveClass('bg-blue-700');
  });

  it('highlights active Profile link', () => {
    renderNavigation(['/profile']);
    
    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveClass('bg-blue-700');
  });

  it('calls logout when logout button is clicked', async () => {
    renderNavigation();
    
    const logoutButton = screen.getByText('Logout');
    await userEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('displays user email in navigation', () => {
    renderNavigation();
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', async () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
    await userEvent.click(mobileMenuButton);
    
    // Check if mobile menu items are visible
    const mobileLinks = screen.getAllByText('Dashboard');
    expect(mobileLinks.length).toBeGreaterThan(1); // Should have both desktop and mobile versions
  });
});