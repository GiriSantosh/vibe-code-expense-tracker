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
  LinearProgress,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Google as GoogleIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface PasswordStrength {
  score: number;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { customSignup } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    return { score, requirements };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return 'error';
    if (score < 4) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email';
    if (passwordStrength.score < 4) return 'Please choose a stronger password';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.acceptTerms) return 'Please accept the terms and conditions';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await customSignup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // For now, redirect to existing OAuth2 flow as fallback
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/keycloak`;
  };

  const RequirementIcon: React.FC<{ met: boolean }> = ({ met }) => (
    met ? <CheckCircle color="success" sx={{ fontSize: 16 }} /> : <Cancel color="error" sx={{ fontSize: 16 }} />
  );

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us to start tracking your expenses securely"
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            autoFocus
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
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

        {formData.password && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Password strength:
              </Typography>
              <Typography 
                variant="caption" 
                color={`${getPasswordStrengthColor(passwordStrength.score)}.main`}
                fontWeight="bold"
              >
                {getPasswordStrengthText(passwordStrength.score)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(passwordStrength.score / 5) * 100}
              color={getPasswordStrengthColor(passwordStrength.score) as any}
              sx={{ height: 6, borderRadius: 3, mb: 1 }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RequirementIcon met={passwordStrength.requirements.length} />
                <Typography variant="caption">8+ characters</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RequirementIcon met={passwordStrength.requirements.uppercase} />
                <Typography variant="caption">Uppercase</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RequirementIcon met={passwordStrength.requirements.lowercase} />
                <Typography variant="caption">Lowercase</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RequirementIcon met={passwordStrength.requirements.number} />
                <Typography variant="caption">Number</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RequirementIcon met={passwordStrength.requirements.special} />
                <Typography variant="caption">Special char</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={loading}
          error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
          helperText={
            formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
              ? 'Passwords do not match'
              : ''
          }
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              disabled={loading}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="/terms" target="_blank" sx={{ textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" sx={{ textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </Typography>
          }
          sx={{ mb: 3 }}
        />

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          loading={loading}
          disabled={!formData.acceptTerms || passwordStrength.score < 4}
          sx={{ 
            mb: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </LoadingButton>

        <Divider sx={{ mb: 3 }}>
          <Box sx={{ px: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
            Or sign up with
          </Box>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSignup}
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
            to="/login"
            variant="body2"
            sx={{ 
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Already have an account? Sign In
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default SignupPage;