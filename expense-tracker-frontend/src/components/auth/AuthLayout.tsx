import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', minHeight: '80vh' }}>
          {/* Left Side - Branding (hidden on mobile) */}
          {!isMobile && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                px: 4,
              }}
            >
              <AccountBalance sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Personal Expense Tracker
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 400 }}>
                Take control of your finances with secure, encrypted expense tracking
              </Typography>
              <Box sx={{ mt: 4, opacity: 0.7 }}>
                <Typography variant="body2">
                  ✓ AES-256-GCM Encryption
                </Typography>
                <Typography variant="body2">
                  ✓ Real-time Analytics
                </Typography>
                <Typography variant="body2">
                  ✓ Secure OAuth2 Authentication
                </Typography>
              </Box>
            </Box>
          )}

          {/* Right Side - Auth Form */}
          <Box sx={{ flex: isMobile ? 1 : 1, minHeight: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                px: { xs: 2, md: 4 },
              }}
            >
              <Paper
                elevation={isMobile ? 0 : 12}
                sx={{
                  p: { xs: 3, md: 6 },
                  backgroundColor: isMobile ? 'rgba(255,255,255,0.95)' : 'white',
                  borderRadius: 3,
                  backdropFilter: isMobile ? 'blur(10px)' : 'none',
                }}
              >
                {/* Mobile Logo */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <AccountBalance 
                      sx={{ 
                        fontSize: 48, 
                        color: theme.palette.primary.main,
                        mb: 1 
                      }} 
                    />
                    <Typography 
                      variant="h5" 
                      component="h1" 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 'bold'
                      }}
                    >
                      Expense Tracker
                    </Typography>
                  </Box>
                )}

                {/* Auth Form Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography variant="body1" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                </Box>

                {/* Auth Form Content */}
                {children}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;