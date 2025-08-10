import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { MonthlySummaryFormatted } from '../types/Analytics';

interface ExpenseSummaryProps {
  monthlySummary: MonthlySummaryFormatted[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ monthlySummary }) => {
  // Defensive check for undefined/null monthlySummary
  const safeMonthlySummary = monthlySummary || [];
  console.log('ExpenseSummary received monthlySummary:', safeMonthlySummary);
  
  // Calculate total and find highest month
  const totalAmount = safeMonthlySummary.reduce((acc, summary) => acc + (summary.totalAmount || 0), 0);
  const highestMonth = safeMonthlySummary.reduce((max, current) => 
    (current.totalAmount || 0) > (max.totalAmount || 0) ? current : max, safeMonthlySummary[0] || {});
  
  console.log('ExpenseSummary calculated totalAmount:', totalAmount);
  console.log('ExpenseSummary found highestMonth:', highestMonth);
  
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Monthly Summary
          </Typography>
          <Chip 
            label={`${safeMonthlySummary.length} months`} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ ml: 2 }}
          />
        </Box>
        
        {safeMonthlySummary.length === 0 ? (
          <Box textAlign="center" py={4}>
            <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No monthly summary available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start adding expenses to see your monthly trends
            </Typography>
          </Box>
        ) : (
          <>
            {/* Summary Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  ${totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {highestMonth.month || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Highest Spending Month
                </Typography>
              </Box>
            </Box>
            
            {/* Monthly Breakdown */}
            <Box>
              <Typography variant="h6" fontWeight="semibold" mb={2}>
                Monthly Breakdown
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2 
              }}>
                {safeMonthlySummary.map((summary, index) => {
                  const percentage = totalAmount > 0 ? (summary.totalAmount || 0) / totalAmount * 100 : 0;
                  return (
                    <Card 
                      key={index}
                      variant="outlined" 
                      sx={{ 
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="semibold">
                            {summary.month}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            ${summary.totalAmount ? summary.totalAmount.toFixed(2) : '0.00'}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ height: 6, borderRadius: 3, mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {percentage.toFixed(1)}% of total
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseSummary;