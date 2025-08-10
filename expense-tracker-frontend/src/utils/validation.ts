export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(rule.message);
      continue;
    }

    if (!value) continue; // Skip other validations if value is empty and not required

    const stringValue = value.toString();

    if (rule.minLength && stringValue.length < rule.minLength) {
      errors.push(rule.message);
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors.push(rule.message);
    }

    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors.push(rule.message);
    }

    if (rule.custom && !rule.custom(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Common validation rules
export const emailRules: ValidationRule[] = [
  { required: true, message: 'Email is required' },
  { 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    message: 'Please enter a valid email address' 
  }
];

export const passwordRules: ValidationRule[] = [
  { required: true, message: 'Password is required' },
  { minLength: 8, message: 'Password must be at least 8 characters long' },
  { 
    pattern: /(?=.*[a-z])/, 
    message: 'Password must contain at least one lowercase letter' 
  },
  { 
    pattern: /(?=.*[A-Z])/, 
    message: 'Password must contain at least one uppercase letter' 
  },
  { 
    pattern: /(?=.*\d)/, 
    message: 'Password must contain at least one number' 
  },
  { 
    pattern: /(?=.*[!@#$%^&*(),.?":{}|<>])/, 
    message: 'Password must contain at least one special character' 
  }
];

export const nameRules: ValidationRule[] = [
  { required: true, message: 'This field is required' },
  { minLength: 1, message: 'Name must not be empty' },
  { maxLength: 50, message: 'Name must not exceed 50 characters' }
];

export const createPasswordMatchRule = (password: string): ValidationRule => ({
  custom: (value: string) => value === password,
  message: 'Passwords do not match'
});

// Form validation helper
export const validateForm = (formData: Record<string, any>, rules: Record<string, ValidationRule[]>): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};
  
  Object.keys(rules).forEach(fieldName => {
    results[fieldName] = validateField(formData[fieldName], rules[fieldName]);
  });
  
  return results;
};

// Check if entire form is valid
export const isFormValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};