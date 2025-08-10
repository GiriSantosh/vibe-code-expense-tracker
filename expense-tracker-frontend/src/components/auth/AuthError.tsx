import React from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { ErrorOutline, Warning, Info } from '@mui/icons-material';

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
        return <Warning />;
      case 'info':
        return <Info />;
      case 'error':
      default:
        return <ErrorOutline />;
    }
  };

  return (
    <Alert 
      severity={severity}
      icon={showIcon ? getIcon() : false}
      sx={{ 
        mb: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {errors.length === 1 ? (
        <Typography variant="body2">{errors[0]}</Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {errors.map((errorMsg, index) => (
            <Typography component="li" variant="body2" key={index}>
              {errorMsg}
            </Typography>
          ))}
        </Box>
      )}
    </Alert>
  );
};

export default AuthError;