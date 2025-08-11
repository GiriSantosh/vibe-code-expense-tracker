import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Chip,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import ExpenseSummary from './ExpenseSummary';
import CategoryChart from './CategoryChart';
import ExpenseAnalytics from './ExpenseAnalytics';
import ExpenseList from './ExpenseList';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../hooks/useExpenses';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'primary' 
}) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#d32f2f', 0.05)} 0%, ${alpha(color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#d32f2f', 0.1)} 100%)`,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: (theme) => theme.shadows[8],
      },
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="between">
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
            {value}
          </Typography>
          {change && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {trend === 'up' ? (
                <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography 
                variant="caption" 
                color={trend === 'up' ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {change}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}.main`,
            color: `${color}.contrastText`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

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

  // Calculate metrics with proper null checks
  const totalExpenseAmount = monthlySummary?.reduce((sum, month) => sum + (month?.totalAmount || 0), 0) || 0;
  const currentMonth = monthlySummary?.[monthlySummary.length - 1];
  const previousMonth = monthlySummary?.[monthlySummary.length - 2];
  const monthlyChange = currentMonth?.totalAmount && previousMonth?.totalAmount 
    ? ((currentMonth.totalAmount - previousMonth.totalAmount) / previousMonth.totalAmount * 100).toFixed(1)
    : null;
  
  const topCategory = categorySummary?.reduce((max, category) => {
    const categoryAmount = category?.totalAmount || 0;
    const maxAmount = max?.totalAmount || 0;
    return categoryAmount > maxAmount ? category : max;
  }, categorySummary[0] || null);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigate('/expenses');
        break;
      case 'view':
        navigate('/expenses');
        break;
      case 'export':
        alert('Export functionality coming soon!');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Error loading dashboard
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName || user?.username || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your expenses today.
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            lg: '1fr 1fr 1fr 1fr' 
          },
          gap: 3,
          mb: 4 
        }}
      >
        <MetricCard
          title="Total Expenses"
          value={`$${totalExpenseAmount?.toLocaleString() || '0'}`}
          change={monthlyChange ? `${monthlyChange}%` : undefined}
          trend={monthlyChange && parseFloat(monthlyChange) > 0 ? 'up' : 'down'}
          icon={<MoneyIcon />}
          color="primary"
        />
        <MetricCard
          title="This Month"
          value={`$${currentMonth?.totalAmount?.toLocaleString() || '0'}`}
          change="12.5%"
          trend="up"
          icon={<CalendarIcon />}
          color="success"
        />
        <MetricCard
          title="Total Transactions"
          value={totalElements?.toString() || '0'}
          icon={<ReceiptIcon />}
          color="warning"
        />
        <MetricCard
          title="Top Category"
          value={topCategory?.category?.replace('_', ' ') || 'N/A'}
          icon={<CategoryIcon />}
          color="error"
        />
      </Box>

      {/* Charts and Data */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 4 
        }}
      >
        {/* Expense Chart */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Expense Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category breakdown for this period
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <ExpenseAnalytics categorySummary={categorySummary} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage your expenses efficiently
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => handleQuickAction('add')}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 1,
                  '&:hover': { boxShadow: 3 },
                }}
              >
                Add New Expense
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ViewIcon />}
                onClick={() => handleQuickAction('view')}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                View All ({totalElements})
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ExportIcon />}
                onClick={() => handleQuickAction('export')}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Export Data
              </Button>
            </Stack>

            {/* Quick Stats */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Monthly Summary
              </Typography>
              <ExpenseSummary monthlySummary={monthlySummary} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Recent Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your latest expense activities
              </Typography>
            </Box>
            <Button
              variant="text"
              onClick={() => navigate('/expenses')}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>
          
          {recentExpenses.length > 0 ? (
            <ExpenseList expenses={recentExpenses} onDelete={deleteExpense} />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
            >
              <ReceiptIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No expenses yet
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                Start tracking your expenses to see them here
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/expenses')}
                sx={{ textTransform: 'none' }}
              >
                Add Your First Expense
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};