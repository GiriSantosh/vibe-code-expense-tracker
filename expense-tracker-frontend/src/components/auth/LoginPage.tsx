import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Link,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google as GoogleIcon,
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

  const handleGoogleLogin = () => {
    // For now, redirect to existing OAuth2 flow as fallback
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/keycloak`;
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

        <Divider sx={{ mb: 3 }}>
          <Box sx={{ px: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
            Or continue with
          </Box>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleLogin}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
          sx={{ 
            mb: 3,
            py: 1.5,
            borderColor: 'rgba(0,0,0,0.2)',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
          }}
        >
          Continue with Google
        </Button>

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