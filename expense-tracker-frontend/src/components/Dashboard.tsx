import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import ExpenseSummary from './ExpenseSummary';
import CategoryChart from './CategoryChart';
import ExpenseList from './ExpenseList';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../hooks/useExpenses';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    expenses, 
    monthlySummary, 
    categorySummary, 
    loading, 
    error,
    deleteExpense,
    totalElements 
  } = useExpenses();

  // Get recent expenses (first 5)
  const recentExpenses = expenses.slice(0, 5);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigate('/expenses');
        break;
      case 'view':
        navigate('/expenses');
        break;
      case 'export':
        // TODO: Implement export functionality
        alert('Export functionality coming soon!');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" variant="filled">
          <Typography variant="subtitle1" fontWeight="medium">
            Error loading dashboard
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography 
          variant="h3" 
          component="h1" 
          fontWeight="bold" 
          color="primary.main"
          gutterBottom
        >
          Welcome back, {user?.firstName || user?.username || 'User'}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here's your expense overview and analytics
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box mb={4}>
        <ExpenseSummary monthlySummary={monthlySummary} />
      </Box>

      {/* Charts and Analytics */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box sx={{ flex: 2 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Expenses by Category
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <CategoryChart categorySummary={categorySummary} />
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="semibold" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => handleQuickAction('add')}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      Add New Expense
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Record a new expense
                    </Typography>
                  </Box>
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ViewIcon />}
                  onClick={() => handleQuickAction('view')}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      View All Expenses
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      See your complete history ({totalElements} total)
                    </Typography>
                  </Box>
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ExportIcon />}
                  onClick={() => handleQuickAction('export')}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5 }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      Export Data
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Download your expense report
                    </Typography>
                  </Box>
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Expenses */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" fontWeight="semibold" gutterBottom>
            Recent Expenses
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ExpenseList expenses={recentExpenses} onDelete={deleteExpense} />
        </CardContent>
      </Card>
    </Container>
  );
};