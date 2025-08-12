import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

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
    if (score < 2) return 'text-red-600';
    if (score < 4) return 'text-yellow-600';
    return 'text-green-600';
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
    met ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  );

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us to start tracking your expenses securely"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                required
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter your first name"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter your last name"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter your email"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Create a strong password"
              className="pl-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {formData.password && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Password strength:</span>
              <span className={`text-sm font-bold ${getPasswordStrengthColor(passwordStrength.score)}`}>
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
            </div>
            <Progress 
              value={(passwordStrength.score / 5) * 100} 
              className="h-2"
            />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <RequirementIcon met={passwordStrength.requirements.length} />
                <span>8+ characters</span>
              </div>
              <div className="flex items-center gap-1">
                <RequirementIcon met={passwordStrength.requirements.uppercase} />
                <span>Uppercase</span>
              </div>
              <div className="flex items-center gap-1">
                <RequirementIcon met={passwordStrength.requirements.lowercase} />
                <span>Lowercase</span>
              </div>
              <div className="flex items-center gap-1">
                <RequirementIcon met={passwordStrength.requirements.number} />
                <span>Number</span>
              </div>
              <div className="flex items-center gap-1">
                <RequirementIcon met={passwordStrength.requirements.special} />
                <span>Special char</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Confirm your password"
              className={`pl-10 pr-10 ${
                formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {formData.confirmPassword !== '' && formData.password !== formData.confirmPassword && (
            <p className="text-sm text-red-600">Passwords do not match</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, acceptTerms: !!checked }))
            }
            disabled={loading}
          />
          <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed">
            I agree to the{' '}
            <a 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!formData.acceptTerms || passwordStrength.score < 4 || loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="text-center">
          <a
            href="/login"
            className="text-sm text-primary hover:underline font-medium"
          >
            Already have an account? Sign In
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;