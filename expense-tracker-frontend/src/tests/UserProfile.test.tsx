import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../components/UserProfile';

// Mock AuthContext
const mockUpdateUser = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    },
    updateUser: mockUpdateUser,
  })
}));

// Mock apiService
const mockUpdateProfile = jest.fn();
jest.mock('../services/apiService', () => ({
  apiService: {
    updateProfile: mockUpdateProfile,
  }
}));

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateProfile.mockResolvedValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Updated',
      lastName: 'User'
    });
  });

  it('renders user profile information', () => {
    render(<UserProfile />);
    
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('User')).toBeInTheDocument();
  });

  it('allows editing profile fields', async () => {
    render(<UserProfile />);
    
    const firstNameInput = screen.getByDisplayValue('Test');
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    
    expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
  });

  it('submits updated profile information', async () => {
    render(<UserProfile />);
    
    const firstNameInput = screen.getByDisplayValue('Test');
    const saveButton = screen.getByText('Save Changes');
    
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User'
      });
    });
  });

  it('displays success message after successful update', async () => {
    render(<UserProfile />);
    
    const firstNameInput = screen.getByDisplayValue('Test');
    const saveButton = screen.getByText('Save Changes');
    
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('Update failed'));
    
    render(<UserProfile />);
    
    const firstNameInput = screen.getByDisplayValue('Test');
    const saveButton = screen.getByText('Save Changes');
    
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to update profile. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    // Mock a delayed response
    mockUpdateProfile.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Updated',
      lastName: 'User'
    }), 100)));
    
    render(<UserProfile />);
    
    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<UserProfile />);
    
    const firstNameInput = screen.getByDisplayValue('Test');
    const saveButton = screen.getByText('Save Changes');
    
    await userEvent.clear(firstNameInput);
    await userEvent.click(saveButton);
    
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});