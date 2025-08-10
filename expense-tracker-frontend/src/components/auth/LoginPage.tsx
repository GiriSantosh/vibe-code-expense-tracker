import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { customLogin } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await customLogin(formData.email, formData.password, formData.rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={loading}
                color="primary"
              />
            }
            label="Remember me"
          />
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            sx={{ textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </Box>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          loading={loading}
          disabled={!formData.email || !formData.password}
          sx={{ 
            mb: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </LoadingButton>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component={RouterLink}
            to="/signup"
            variant="body2"
            sx={{ 
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Don't have an account? Sign Up
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;