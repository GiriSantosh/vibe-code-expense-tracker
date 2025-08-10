import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  Avatar,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  DateRange as DateRangeIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as LogoutIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { User, UserPreferences } from '../types/User';
import { ExpenseCategory } from '../types/ExpenseCategory';

export const UserProfile: React.FC = () => {
  const { user, updateUser, nuclearLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>(user || {});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    );
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedUser = await apiService.updateUserProfile(editForm);
      updateUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async (field: keyof UserPreferences, value: any) => {
    try {
      const updatedPreferences = await apiService.updateUserPreferences({
        [field]: value
      });
      updateUser({
        ...user,
        preferences: { ...(user.preferences || {}), ...updatedPreferences }
      });
      setMessage({ type: 'success', text: 'Preferences updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences.' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar 
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {user.firstName?.[0] || user.username?.[0] || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username
                }
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your account information and preferences
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={user.emailVerified ? <VerifiedIcon /> : <EmailIcon />}
            label={user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
            color={user.emailVerified ? 'success' : 'warning'}
            variant={user.emailVerified ? 'filled' : 'outlined'}
          />
        </Box>
      </Paper>

      {/* Messages */}
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Profile Information */}
        <Box sx={{ flex: 2 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight="semibold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Profile Information
                </Typography>
                {!isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm(user);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              {isEditing ? (
                <Box component="form" onSubmit={handleEditSubmit}>
                  <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      variant="outlined"
                    />
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 3 
                }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Username
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <AccountCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                      {user.username}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <EmailIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                      {apiService.maskEmail(user.email)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      First Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.firstName || 'Not set'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Last Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.lastName || 'Not set'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Member Since
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <DateRangeIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Last Login
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <DateRangeIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* Preferences */}
        <Box sx={{ flex: 1 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" fontWeight="semibold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={user.preferences?.currency || 'USD'}
                    label="Currency"
                    onChange={(e) => handlePreferencesUpdate('currency', e.target.value)}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="INR">INR (₹)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={user.preferences?.dateFormat || 'MM/DD/YYYY'}
                    label="Date Format"
                    onChange={(e) => handlePreferencesUpdate('dateFormat', e.target.value)}
                  >
                    <MenuItem value="MM/dd/yyyy">MM/dd/yyyy</MenuItem>
                    <MenuItem value="dd/MM/yyyy">dd/MM/yyyy</MenuItem>
                    <MenuItem value="yyyy-MM-dd">yyyy-MM-dd</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Default Category</InputLabel>
                  <Select
                    value={user.preferences?.defaultCategory || 'FOOD'}
                    label="Default Category"
                    onChange={(e) => handlePreferencesUpdate('defaultCategory', e.target.value as ExpenseCategory)}
                  >
                    {Object.values(ExpenseCategory).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={user.preferences?.theme || 'light'}
                    label="Theme"
                    onChange={(e) => handlePreferencesUpdate('theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={user.preferences?.enableNotifications || false}
                      onChange={(e) => handlePreferencesUpdate('enableNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable email notifications for expense reminders"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Debug/Testing Section - Remove in production */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mt: 3, 
          bgcolor: 'warning.50', 
          border: '1px solid', 
          borderColor: 'warning.200' 
        }}
      >
        <Typography variant="h6" fontWeight="semibold" color="warning.800" gutterBottom>
          🧪 Logout Testing (Debug)
        </Typography>
        <Typography variant="body2" color="warning.700" paragraph>
          Use these options if you're experiencing SSO session issues when switching between users:
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            color="warning"
            startIcon={<LogoutIcon />}
            onClick={nuclearLogout}
            sx={{ 
              borderColor: 'warning.600',
              color: 'warning.800',
              '&:hover': {
                borderColor: 'warning.700',
                bgcolor: 'warning.100',
              }
            }}
          >
            🚀 Nuclear Logout
          </Button>
          <Typography variant="caption" color="warning.600">
            (Forces complete session termination + cookie clearing)
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};