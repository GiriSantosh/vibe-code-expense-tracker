import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Pagination,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  List as ListIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseSummary from './ExpenseSummary';
import CategoryChart from './CategoryChart';
import FilterControls from './FilterControls';
import MonthlySplineChart from './MonthlySplineChart';
import { ExpenseCategory } from '../types/ExpenseCategory';

export const ExpenseManagement: React.FC = () => {
  const { 
    expenses, 
    monthlySummary, 
    categorySummary, 
    loading, 
    error, 
    fetchExpenses, 
    addExpense, 
    deleteExpense, 
    fetchMonthlySummary, 
    totalPages, 
    totalElements 
  } = useExpenses();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleAddExpense = async (expense: any) => {
    try {
      await addExpense(expense);
      fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
      fetchExpenses(undefined, undefined, undefined, currentPage, pageSize);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleFilterExpenses = (category?: ExpenseCategory, startDate?: string, endDate?: string) => {
    setCurrentPage(0);
    fetchExpenses(category, startDate, endDate, 0, pageSize);
    fetchMonthlySummary(startDate, endDate);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage - 1);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main" gutterBottom>
          Expense Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Track, categorize, and analyze your personal expenses
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="primary.main" fontWeight="semibold" mt={2}>
            Loading data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Error loading expense data
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Add Expense Form and Summary */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box sx={{ flex: 2 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" fontWeight="semibold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon /> Add New Expense
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <ExpenseForm onSubmit={handleAddExpense} isLoading={loading} />
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <ExpenseSummary monthlySummary={monthlySummary} />
        </Box>
      </Box>

      {/* Filters */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="semibold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon /> Filter Expenses
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <FilterControls onFilter={handleFilterExpenses} />
        </CardContent>
      </Card>

      {/* Expense List and Category Chart */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box sx={{ flex: 2 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight="semibold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListIcon /> Expense List
                </Typography>
                <Chip 
                  label={`${totalElements} total expenses`} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
              
              {/* Pagination */}
              <Box mt={3} pt={3} borderTop="1px solid" borderColor="divider">
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {currentPage + 1} of {totalPages || 1} ({totalElements} items total)
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Items per page:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        variant="outlined"
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                      </Select>
                    </FormControl>
                    <Pagination
                      count={totalPages || 1}
                      page={currentPage + 1}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" fontWeight="semibold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon /> Expenses by Category
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <CategoryChart categorySummary={categorySummary} />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Monthly Chart */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" fontWeight="semibold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon /> Monthly Trends
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <MonthlySplineChart monthlySummary={monthlySummary} />
        </CardContent>
      </Card>
    </Container>
  );
};