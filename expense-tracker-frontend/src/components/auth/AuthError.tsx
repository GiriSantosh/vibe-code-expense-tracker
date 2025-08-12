import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AuthErrorProps {
  error: string | string[] | null;
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  showIcon?: boolean;
}

const AuthError: React.FC<AuthErrorProps> = ({ 
  error, 
  severity = 'error', 
  title,
  showIcon = true 
}) => {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];
  
  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'error':
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    switch (severity) {
      case 'warning':
      case 'info':
        return 'default';
      case 'error':
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      {showIcon && getIcon()}
      <div className="w-full">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>
          {errors.length === 1 ? (
            <span>{errors[0]}</span>
          ) : (
            <ul className="mt-2 ml-4 list-disc space-y-1">
              {errors.map((errorMsg, index) => (
                <li key={index} className="text-sm">
                  {errorMsg}
                </li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default AuthError;